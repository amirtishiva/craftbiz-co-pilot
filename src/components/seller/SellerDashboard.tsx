import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Package, ShoppingBag, TrendingUp, Star, Settings, MessageSquare, BarChart3, Eye, Clock, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useSellerProfile } from '@/hooks/useSellerProfile';
import { supabase } from '@/integrations/supabase/client';
import ProductForm from './ProductForm';
import SellerProductList from './SellerProductList';
import CustomRequestsList from './CustomRequestsList';
import SellerAnalytics from './SellerAnalytics';
import ShopSettings from './ShopSettings';
import OrderManagement from './OrderManagement';

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

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const { data: products } = await supabase
        .from('products')
        .select('id, status')
        .eq('seller_id', profile.id);

      const totalProducts = products?.length || 0;
      const activeProducts = products?.filter(p => p.status === 'active').length || 0;

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack} 
            className="mb-4 hover:bg-primary/10 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                  {sellerProfile?.shop_name || 'Seller Dashboard'}
                </h1>
                {sellerProfile?.is_verified && (
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              {sellerProfile?.shop_tagline && (
                <p className="text-muted-foreground text-lg">{sellerProfile.shop_tagline}</p>
              )}
            </div>

            <Button 
              onClick={() => setShowProductForm(true)}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Product
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/80 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                  <p className="text-4xl font-bold tracking-tight">{stats.totalProducts}</p>
                </div>
                <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Package className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/80 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Active Listings</p>
                  <p className="text-4xl font-bold tracking-tight text-green-600">{stats.activeProducts}</p>
                </div>
                <div className="p-3 rounded-xl bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/80 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                  <p className="text-4xl font-bold tracking-tight text-blue-600">{stats.totalOrders}</p>
                  {stats.pendingOrders > 0 && (
                    <div className="flex items-center gap-1 text-xs text-amber-600">
                      <Clock className="h-3 w-3" />
                      {stats.pendingOrders} pending
                    </div>
                  )}
                </div>
                <div className="p-3 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                  <ShoppingBag className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/80 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Shop Rating</p>
                  <div className="flex items-center gap-2">
                    <p className="text-4xl font-bold tracking-tight text-amber-600">
                      {sellerProfile?.rating?.toFixed(1) || '0.0'}
                    </p>
                    <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
                  <Star className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
          <Tabs defaultValue="products" className="w-full">
            <div className="border-b border-border/50">
              <TabsList className="w-full justify-start h-auto p-0 bg-transparent rounded-none gap-0">
                <TabsTrigger 
                  value="products" 
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-4 font-medium"
                >
                  <Package className="h-4 w-4 mr-2" />
                  My Products
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-4 font-medium"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger 
                  value="custom-requests" 
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-4 font-medium"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Custom Requests
                </TabsTrigger>
                <TabsTrigger 
                  value="orders" 
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-4 font-medium"
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Orders
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-4 font-medium"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Shop Settings
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="products" className="m-0">
                <SellerProductList onAddProduct={() => setShowProductForm(true)} />
              </TabsContent>

              <TabsContent value="analytics" className="m-0">
                <SellerAnalytics />
              </TabsContent>

              <TabsContent value="custom-requests" className="m-0">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Custom Order Requests</h3>
                  </div>
                  <CustomRequestsList isSeller={true} />
                </div>
              </TabsContent>

              <TabsContent value="orders" className="m-0">
                <OrderManagement />
              </TabsContent>

              <TabsContent value="settings" className="m-0">
                <ShopSettings />
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default SellerDashboard;
