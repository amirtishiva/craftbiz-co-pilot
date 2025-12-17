import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, XCircle, Clock, Eye, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Order {
  id: string;
  buyer_id: string;
  total_amount: number;
  status: string;
  tracking_number: string | null;
  shipping_address: any;
  notes: string | null;
  created_at: string;
  updated_at: string;
  order_items: {
    id: string;
    quantity: number;
    unit_price: number;
    customization_notes: string | null;
    product: {
      id: string;
      title: string;
    } | null;
  }[];
}

const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  pending: { label: 'Pending', icon: <Clock className="h-4 w-4" />, color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
  confirmed: { label: 'Confirmed', icon: <CheckCircle className="h-4 w-4" />, color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  shipped: { label: 'Shipped', icon: <Truck className="h-4 w-4" />, color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
  delivered: { label: 'Delivered', icon: <CheckCircle className="h-4 w-4" />, color: 'bg-green-500/10 text-green-600 border-green-500/20' },
  cancelled: { label: 'Cancelled', icon: <XCircle className="h-4 w-4" />, color: 'bg-red-500/10 text-red-600 border-red-500/20' },
};

const OrderManagement: React.FC = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!profile) return;

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            unit_price,
            customization_notes,
            product:products (id, title)
          )
        `)
        .eq('seller_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
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

  const updateOrderStatus = async (orderId: string, newStatus: string, tracking?: string) => {
    setUpdating(true);
    try {
      const updateData: any = { status: newStatus };
      if (tracking) {
        updateData.tracking_number = tracking;
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;

      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, tracking_number: tracking || order.tracking_number }
          : order
      ));

      toast({
        title: 'Order Updated',
        description: `Order status changed to ${newStatus}`,
      });

      setShowTrackingModal(false);
      setSelectedOrder(null);
      setTrackingNumber('');
    } catch (error: any) {
      console.error('Error updating order:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update order',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleShip = (order: Order) => {
    setSelectedOrder(order);
    setTrackingNumber(order.tracking_number || '');
    setShowTrackingModal(true);
  };

  const confirmShip = () => {
    if (selectedOrder) {
      updateOrderStatus(selectedOrder.id, 'shipped', trackingNumber);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge variant="outline" className={`${config.color} gap-1`}>
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const formatAddress = (address: any) => {
    if (!address) return 'No address';
    if (typeof address === 'string') return address;
    return [address.street, address.city, address.state, address.zip].filter(Boolean).join(', ');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-muted-foreground">No orders yet. Start listing products to receive orders!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base font-medium">
                    Order #{order.id.slice(0, 8)}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(order.created_at), 'MMM dd, yyyy • h:mm a')}
                  </p>
                </div>
                {getStatusBadge(order.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order Items */}
              <div className="space-y-2">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <span>
                      {item.product?.title || 'Unknown Product'} × {item.quantity}
                    </span>
                    <span className="font-medium">₹{(item.unit_price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-medium">Total</span>
                  <span className="font-bold text-lg">₹{order.total_amount.toLocaleString()}</span>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="text-sm">
                <p className="text-muted-foreground">Ship to:</p>
                <p>{formatAddress(order.shipping_address)}</p>
              </div>

              {/* Tracking Number */}
              {order.tracking_number && (
                <div className="text-sm">
                  <p className="text-muted-foreground">Tracking:</p>
                  <p className="font-mono">{order.tracking_number}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2">
                {order.status === 'pending' && (
                  <>
                    <Button 
                      size="sm" 
                      onClick={() => updateOrderStatus(order.id, 'confirmed')}
                      disabled={updating}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Confirm Order
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => updateOrderStatus(order.id, 'cancelled')}
                      disabled={updating}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </>
                )}

                {order.status === 'confirmed' && (
                  <Button 
                    size="sm"
                    onClick={() => handleShip(order)}
                    disabled={updating}
                  >
                    <Truck className="h-4 w-4 mr-1" />
                    Mark as Shipped
                  </Button>
                )}

                {order.status === 'shipped' && (
                  <Button 
                    size="sm"
                    onClick={() => updateOrderStatus(order.id, 'delivered')}
                    disabled={updating}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Mark Delivered
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tracking Number Modal */}
      <Dialog open={showTrackingModal} onOpenChange={setShowTrackingModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Tracking Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tracking">Tracking Number</Label>
              <Input
                id="tracking"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number (optional)"
              />
              <p className="text-xs text-muted-foreground">
                The buyer will be notified when you mark this order as shipped
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTrackingModal(false)}>
              Cancel
            </Button>
            <Button onClick={confirmShip} disabled={updating}>
              {updating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Truck className="h-4 w-4 mr-2" />
                  Confirm Shipment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OrderManagement;
