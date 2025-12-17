import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock, XCircle, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  customization_notes: string | null;
  product: {
    id: string;
    title: string;
    product_images: { image_url: string; is_primary: boolean }[];
  } | null;
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  tracking_number: string | null;
  shipping_address: any;
  notes: string | null;
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
  seller_profile: {
    shop_name: string;
  } | null;
}

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Package },
];

const statusConfig: Record<string, { color: string; bgColor: string }> = {
  pending: { color: 'text-yellow-600', bgColor: 'bg-yellow-500' },
  confirmed: { color: 'text-blue-600', bgColor: 'bg-blue-500' },
  shipped: { color: 'text-purple-600', bgColor: 'bg-purple-500' },
  delivered: { color: 'text-green-600', bgColor: 'bg-green-500' },
  cancelled: { color: 'text-red-600', bgColor: 'bg-red-500' },
};

const OrderStatusTimeline: React.FC<{ status: string; trackingNumber?: string | null }> = ({ status, trackingNumber }) => {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 py-4">
        <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center">
          <XCircle className="h-4 w-4 text-white" />
        </div>
        <span className="text-red-600 font-medium">Order Cancelled</span>
      </div>
    );
  }

  const currentStepIndex = statusSteps.findIndex(s => s.key === status);

  return (
    <div className="py-4">
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-muted" />
        <div 
          className="absolute top-4 left-0 h-0.5 bg-primary transition-all duration-500"
          style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
        />

        {statusSteps.map((step, index) => {
          const isCompleted = index <= currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              <div 
                className={`h-8 w-8 rounded-full flex items-center justify-center transition-all ${
                  isCompleted 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                } ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className={`text-xs mt-2 text-center ${isCompleted ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {trackingNumber && status === 'shipped' && (
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">Tracking Number:</p>
          <p className="font-mono font-medium">{trackingNumber}</p>
        </div>
      )}
    </div>
  );
};

const BuyerOrderHistory: React.FC = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchOrders();
    
    // Subscribe to real-time order updates
    const channel = supabase
      .channel('buyer-orders')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          setOrders(prev => prev.map(order => 
            order.id === payload.new.id 
              ? { ...order, ...payload.new }
              : order
          ));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            unit_price,
            customization_notes,
            product:products (
              id,
              title,
              product_images (image_url, is_primary)
            )
          )
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch seller profiles separately
      const ordersWithSellers = await Promise.all((data || []).map(async (order) => {
        const { data: sellerProfile } = await supabase
          .from('seller_profiles')
          .select('shop_name')
          .eq('user_id', order.seller_id)
          .maybeSingle();
        
        return { ...order, seller_profile: sellerProfile };
      }));

      setOrders(ordersWithSellers);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrders(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const formatAddress = (address: any) => {
    if (!address) return 'No address';
    if (typeof address === 'string') return address;
    return [address.street, address.city, address.state, address.zip].filter(Boolean).join(', ');
  };

  const getProductImage = (item: OrderItem) => {
    const primaryImage = item.product?.product_images?.find(img => img.is_primary);
    return primaryImage?.image_url || item.product?.product_images?.[0]?.image_url;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-32" />
          </Card>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-lg font-medium mb-2">No orders yet</h3>
          <p className="text-muted-foreground">Start shopping to see your orders here!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">My Orders</h2>
      
      {orders.map((order) => {
        const isExpanded = expandedOrders.has(order.id);
        const config = statusConfig[order.status] || statusConfig.pending;

        return (
          <Card key={order.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base font-medium">
                    Order #{order.id.slice(0, 8)}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(order.created_at), 'MMM dd, yyyy • h:mm a')}
                    {order.seller_profile && (
                      <span> • From {order.seller_profile.shop_name}</span>
                    )}
                  </p>
                </div>
                <Badge 
                  variant="outline" 
                  className={`${config.color} border-current`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Order Status Timeline */}
              <OrderStatusTimeline status={order.status} trackingNumber={order.tracking_number} />

              <Separator />

              {/* Order Items Preview */}
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {order.order_items.slice(0, 3).map((item, idx) => {
                    const imageUrl = getProductImage(item);
                    return (
                      <div 
                        key={item.id}
                        className="h-12 w-12 rounded-lg border-2 border-background bg-muted overflow-hidden"
                        style={{ zIndex: 3 - idx }}
                      >
                        {imageUrl ? (
                          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {order.order_items.length > 3 && (
                    <div className="h-12 w-12 rounded-lg border-2 border-background bg-muted flex items-center justify-center text-sm font-medium">
                      +{order.order_items.length - 3}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    {order.order_items.length} item{order.order_items.length > 1 ? 's' : ''}
                  </p>
                  <p className="font-bold">₹{order.total_amount.toLocaleString()}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => toggleExpand(order.id)}
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Details
                    </>
                  )}
                </Button>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="space-y-4 pt-4 border-t">
                  {/* Items List */}
                  <div className="space-y-3">
                    {order.order_items.map((item) => {
                      const imageUrl = getProductImage(item);
                      return (
                        <div key={item.id} className="flex gap-3">
                          <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                            {imageUrl ? (
                              <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <Package className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{item.product?.title || 'Unknown Product'}</p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity} × ₹{item.unit_price.toLocaleString()}
                            </p>
                            {item.customization_notes && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Note: {item.customization_notes}
                              </p>
                            )}
                          </div>
                          <p className="font-medium">
                            ₹{(item.quantity * item.unit_price).toLocaleString()}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Shipping Address */}
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Shipping Address</p>
                        <p className="text-sm text-muted-foreground">{formatAddress(order.shipping_address)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default BuyerOrderHistory;
