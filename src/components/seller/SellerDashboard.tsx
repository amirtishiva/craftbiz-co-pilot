import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Package, ShoppingBag, TrendingUp, Star, Settings, MessageSquare, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSellerProfile } from '@/hooks/useSellerProfile';
import { supabase } from '@/integrations/supabase/client';
import ProductForm from './ProductForm';
import SellerProductList from './SellerProductList';
import CustomRequestsList from './CustomRequestsList';
import SellerAnalytics from './SellerAnalytics';

interface SellerDashboardProps {
  onBack: () => void;
}

const SellerDashboard: React.FC<SellerDashboardProps> = ({ onBack }) => {
  const { sellerProfile } = useSellerProfile();
  const [showProductForm, setShowProductForm] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    pendingOrders: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get profile id
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      // Get product stats
      const { data: products } = await supabase
        .from('products')
        .select('id, status')
        .eq('seller_id', profile.id);

      const totalProducts = products?.length || 0;
      const activeProducts = products?.filter(p => p.status === 'active').length || 0;

      // Get order stats
      const { data: orders } = await supabase
        .from('orders')
        .select('id, status')
        .eq('seller_id', profile.id);

      const totalOrders = orders?.length || 0;
      const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;

      setStats({ totalProducts, activeProducts, totalOrders, pendingOrders });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  if (showProductForm) {
    return (
      <ProductForm 
        onBack={() => setShowProductForm(false)} 
        onSuccess={() => {
          setShowProductForm(false);
          fetchStats();
        }}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Button variant="ghost" onClick={onBack} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-foreground">
            {sellerProfile?.shop_name || 'Seller Dashboard'}
          </h1>
          {sellerProfile?.shop_tagline && (
            <p className="text-muted-foreground mt-1">{sellerProfile.shop_tagline}</p>
          )}
        </div>

        <Button onClick={() => setShowProductForm(true)}>
          <Plus className="h-5 w-5 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-3xl font-bold text-foreground">{stats.totalProducts}</p>
              </div>
              <Package className="h-10 w-10 text-primary/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Listings</p>
                <p className="text-3xl font-bold text-foreground">{stats.activeProducts}</p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-500/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-3xl font-bold text-foreground">{stats.totalOrders}</p>
              </div>
              <ShoppingBag className="h-10 w-10 text-blue-500/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Shop Rating</p>
                <p className="text-3xl font-bold text-foreground flex items-center gap-1">
                  {sellerProfile?.rating?.toFixed(1) || '0.0'}
                  <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                </p>
              </div>
              <Star className="h-10 w-10 text-yellow-500/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="products" className="space-y-6">
        <TabsList>
          <TabsTrigger value="products">My Products</TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="custom-requests">Custom Requests</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="settings">Shop Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <SellerProductList onAddProduct={() => setShowProductForm(true)} />
        </TabsContent>

        <TabsContent value="analytics">
          <SellerAnalytics />
        </TabsContent>

        <TabsContent value="custom-requests">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Custom Order Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CustomRequestsList isSeller={true} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No orders yet. Start listing products to receive orders!</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Shop Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>Shop settings coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SellerDashboard;