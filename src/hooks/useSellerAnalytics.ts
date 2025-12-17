import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SellerAnalytics {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  averageOrderValue: number;
  uniqueCustomers: number;
  repeatCustomers: number;
  monthlyRevenue: { month: string; revenue: number; orders: number }[];
  topProducts: { id: string; title: string; sales: number; revenue: number }[];
  ordersByStatus: { status: string; count: number }[];
  recentOrders: {
    id: string;
    total_amount: number;
    status: string;
    created_at: string;
    buyer_id: string;
  }[];
}

const initialAnalytics: SellerAnalytics = {
  totalRevenue: 0,
  totalOrders: 0,
  totalProducts: 0,
  averageOrderValue: 0,
  uniqueCustomers: 0,
  repeatCustomers: 0,
  monthlyRevenue: [],
  topProducts: [],
  ordersByStatus: [],
  recentOrders: []
};

export const useSellerAnalytics = () => {
  const [analytics, setAnalytics] = useState<SellerAnalytics>(initialAnalytics);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get profile id
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      // Fetch all orders for this seller
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, buyer_id, total_amount, status, created_at')
        .eq('seller_id', profile.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, title, status')
        .eq('seller_id', profile.id);

      if (productsError) throw productsError;

      // Fetch order items for top products
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          product_id,
          quantity,
          unit_price,
          order_id
        `)
        .in('order_id', (orders || []).map(o => o.id));

      if (itemsError) throw itemsError;

      // Calculate analytics
      const totalRevenue = (orders || [])
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + Number(o.total_amount), 0);
      
      const totalOrders = (orders || []).length;
      const totalProducts = (products || []).length;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Unique and repeat customers
      const buyerCounts: Record<string, number> = {};
      (orders || []).forEach(o => {
        buyerCounts[o.buyer_id] = (buyerCounts[o.buyer_id] || 0) + 1;
      });
      const uniqueCustomers = Object.keys(buyerCounts).length;
      const repeatCustomers = Object.values(buyerCounts).filter(count => count > 1).length;

      // Monthly revenue (last 6 months)
      const monthlyData: Record<string, { revenue: number; orders: number }> = {};
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        monthlyData[key] = { revenue: 0, orders: 0 };
      }

      (orders || [])
        .filter(o => o.status !== 'cancelled')
        .forEach(o => {
          const date = new Date(o.created_at);
          const key = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
          if (monthlyData[key]) {
            monthlyData[key].revenue += Number(o.total_amount);
            monthlyData[key].orders += 1;
          }
        });

      const monthlyRevenue = Object.entries(monthlyData).map(([month, data]) => ({
        month,
        revenue: data.revenue,
        orders: data.orders
      }));

      // Top products by sales
      const productSales: Record<string, { quantity: number; revenue: number }> = {};
      (orderItems || []).forEach(item => {
        if (item.product_id) {
          if (!productSales[item.product_id]) {
            productSales[item.product_id] = { quantity: 0, revenue: 0 };
          }
          productSales[item.product_id].quantity += item.quantity;
          productSales[item.product_id].revenue += item.quantity * Number(item.unit_price);
        }
      });

      const topProducts = Object.entries(productSales)
        .map(([productId, data]) => {
          const product = (products || []).find(p => p.id === productId);
          return {
            id: productId,
            title: product?.title || 'Unknown Product',
            sales: data.quantity,
            revenue: data.revenue
          };
        })
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Orders by status
      const statusCounts: Record<string, number> = {};
      (orders || []).forEach(o => {
        statusCounts[o.status || 'pending'] = (statusCounts[o.status || 'pending'] || 0) + 1;
      });

      const ordersByStatus = Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count
      }));

      // Recent orders
      const recentOrders = (orders || []).slice(0, 5);

      setAnalytics({
        totalRevenue,
        totalOrders,
        totalProducts,
        averageOrderValue,
        uniqueCustomers,
        repeatCustomers,
        monthlyRevenue,
        topProducts,
        ordersByStatus,
        recentOrders
      });
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'Failed to fetch analytics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    isLoading,
    error,
    refetch: fetchAnalytics
  };
};