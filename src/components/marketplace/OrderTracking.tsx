import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, CreditCard, Truck, CheckCircle, Clock, MapPin, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  tracking_number: string | null;
  notes: string | null;
  shipping_address: any;
  seller?: {
    business_name: string | null;
  };
  order_items?: {
    id: string;
    quantity: number;
    unit_price: number;
    product?: {
      title: string;
      product_images?: { image_url: string; is_primary: boolean }[];
    };
  }[];
}

interface OrderTrackingProps {
  onBack: () => void;
}

const ORDER_STATUSES = [
  { key: 'pending', label: 'Order Placed', icon: CreditCard, description: 'Your order has been received' },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle, description: 'Seller has confirmed your order' },
  { key: 'processing', label: 'Processing', icon: Package, description: 'Your order is being prepared' },
  { key: 'shipped', label: 'Shipped', icon: Truck, description: 'Your order is on the way' },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle, description: 'Order delivered successfully' },
];

const OrderTracking: React.FC<OrderTrackingProps> = ({ onBack }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          seller:profiles!orders_seller_id_fkey(business_name),
          order_items(
            id,
            quantity,
            unit_price,
            product:products(
              title,
              product_images(image_url, is_primary)
            )
          )
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Subscribe to real-time order updates
    const channel = supabase
      .channel('order-updates')
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
          if (selectedOrder?.id === payload.new.id) {
            setSelectedOrder(prev => prev ? { ...prev, ...payload.new } : null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedOrder?.id]);

  const getStatusIndex = (status: string) => {
    return ORDER_STATUSES.findIndex(s => s.key === status);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-500';
      case 'confirmed': return 'bg-blue-500';
      case 'processing': return 'bg-purple-500';
      case 'shipped': return 'bg-indigo-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-muted';
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (selectedOrder) {
    const currentStatusIndex = getStatusIndex(selectedOrder.status);

    return (
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => setSelectedOrder(null)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">Order #{selectedOrder.id.slice(0, 8)}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Placed on {format(new Date(selectedOrder.created_at), 'PPP')}
                </p>
              </div>
              <Badge className={`${getStatusColor(selectedOrder.status)} text-white`}>
                {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Timeline */}
            <div className="relative">
              <h3 className="font-semibold mb-4">Order Status</h3>
              <div className="space-y-4">
                {ORDER_STATUSES.map((status, index) => {
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  const Icon = status.icon;

                  return (
                    <div key={status.key} className="flex items-start gap-4">
                      <div className="relative">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center
                          ${isCompleted ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
                          ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}
                        `}>
                          <Icon className="h-5 w-5" />
                        </div>
                        {index < ORDER_STATUSES.length - 1 && (
                          <div className={`
                            absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-8
                            ${index < currentStatusIndex ? 'bg-primary' : 'bg-muted'}
                          `} />
                        )}
                      </div>
                      <div className="flex-1 pt-1">
                        <p className={`font-medium ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {status.label}
                        </p>
                        <p className="text-sm text-muted-foreground">{status.description}</p>
                        {isCurrent && selectedOrder.updated_at && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(selectedOrder.updated_at), 'PPp')}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tracking Number */}
            {selectedOrder.tracking_number && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Tracking Information
                  </h3>
                  <p className="text-sm bg-muted p-3 rounded-lg font-mono">
                    {selectedOrder.tracking_number}
                  </p>
                </div>
              </>
            )}

            {/* Shipping Address */}
            <Separator />
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Shipping Address
              </h3>
              <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                <p className="font-medium text-foreground">{String(selectedOrder.shipping_address?.name || '')}</p>
                <p>{String(selectedOrder.shipping_address?.address || '')}</p>
                <p>{String(selectedOrder.shipping_address?.city || '')}, {String(selectedOrder.shipping_address?.state || '')}</p>
                <p>{String(selectedOrder.shipping_address?.pincode || '')}</p>
                {selectedOrder.shipping_address?.phone && (
                  <p className="mt-1">Phone: {String(selectedOrder.shipping_address.phone)}</p>
                )}
              </div>
            </div>

            {/* Order Items */}
            <Separator />
            <div>
              <h3 className="font-semibold mb-3">Order Items</h3>
              <div className="space-y-3">
                {selectedOrder.order_items?.map((item) => {
                  const primaryImage = item.product?.product_images?.find(img => img.is_primary);
                  return (
                    <div key={item.id} className="flex gap-3 p-3 bg-muted rounded-lg">
                      {primaryImage && (
                        <img
                          src={primaryImage.image_url}
                          alt={item.product?.title}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{item.product?.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity} × {formatPrice(item.unit_price)}
                        </p>
                      </div>
                      <p className="font-semibold">
                        {formatPrice(item.quantity * item.unit_price)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total */}
            <Separator />
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total</span>
              <span>{formatPrice(selectedOrder.total_amount)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold">My Orders</h1>
        </div>
        <Button variant="outline" size="sm" onClick={fetchOrders} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-4">
              Start shopping to see your orders here
            </p>
            <Button onClick={onBack}>Browse Products</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const firstItem = order.order_items?.[0];
            const primaryImage = firstItem?.product?.product_images?.find(img => img.is_primary);
            const itemCount = order.order_items?.length || 0;

            return (
              <Card
                key={order.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedOrder(order)}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {primaryImage && (
                      <img
                        src={primaryImage.image_url}
                        alt={firstItem?.product?.title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold truncate">
                            {firstItem?.product?.title}
                            {itemCount > 1 && (
                              <span className="text-muted-foreground font-normal">
                                {' '}+{itemCount - 1} more
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Order #{order.id.slice(0, 8)}
                          </p>
                        </div>
                        <Badge className={`${getStatusColor(order.status)} text-white`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {format(new Date(order.created_at), 'PP')}
                        </div>
                        <p className="font-semibold">{formatPrice(order.total_amount)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
