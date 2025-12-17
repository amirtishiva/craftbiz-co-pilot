import React, { useState, useEffect } from 'react';
import { Clock, IndianRupee, MessageSquare, Check, X, Calendar, Image } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCustomOrders, CustomRequest } from '@/hooks/useCustomOrders';

interface CustomRequestsListProps {
  isSeller?: boolean;
}

const CustomRequestsList: React.FC<CustomRequestsListProps> = ({ isSeller = false }) => {
  const { 
    isLoading, 
    buyerRequests, 
    sellerRequests, 
    fetchBuyerRequests, 
    fetchSellerRequests,
    respondToRequest,
    acceptQuote
  } = useCustomOrders();
  
  const [selectedRequest, setSelectedRequest] = useState<CustomRequest | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [quote, setQuote] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('');
  const [sellerNotes, setSellerNotes] = useState('');

  useEffect(() => {
    if (isSeller) {
      fetchSellerRequests();
    } else {
      fetchBuyerRequests();
    }
  }, [isSeller, fetchBuyerRequests, fetchSellerRequests]);

  const requests = isSeller ? sellerRequests : buyerRequests;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'outline' | 'destructive'; label: string }> = {
      pending: { variant: 'secondary', label: 'Pending' },
      quoted: { variant: 'default', label: 'Quoted' },
      accepted: { variant: 'default', label: 'Accepted' },
      rejected: { variant: 'destructive', label: 'Rejected' },
      completed: { variant: 'outline', label: 'Completed' }
    };
    const config = variants[status] || { variant: 'secondary', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleRespond = (request: CustomRequest) => {
    setSelectedRequest(request);
    setQuote(request.seller_quote?.toString() || '');
    setDeliveryDays(request.estimated_delivery_days?.toString() || '');
    setSellerNotes(request.seller_notes || '');
    setShowResponseModal(true);
  };

  const handleSubmitResponse = async (status: 'quoted' | 'rejected') => {
    if (!selectedRequest) return;

    await respondToRequest({
      requestId: selectedRequest.id,
      sellerQuote: quote ? parseFloat(quote) : undefined,
      estimatedDeliveryDays: deliveryDays ? parseInt(deliveryDays) : undefined,
      sellerNotes: sellerNotes || undefined,
      status
    });

    setShowResponseModal(false);
    setSelectedRequest(null);
  };

  if (isLoading && requests.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading requests...</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No Custom Requests Yet
          </h3>
          <p className="text-muted-foreground">
            {isSeller 
              ? "You haven't received any custom order requests yet."
              : "You haven't made any custom order requests yet."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {requests.map((request) => (
          <Card key={request.id}>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {getStatusBadge(request.status)}
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(request.created_at)}
                    </span>
                  </div>

                  {!isSeller && request.seller && (
                    <p className="text-sm text-muted-foreground mb-2">
                      To: <span className="font-medium text-foreground">{request.seller.shop_name}</span>
                    </p>
                  )}

                  <p className="text-foreground mb-3 line-clamp-3">
                    {request.description}
                  </p>

                  {request.reference_images && request.reference_images.length > 0 && (
                    <div className="flex gap-2 mb-3">
                      {request.reference_images.slice(0, 3).map((img, i) => (
                        <div key={i} className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {request.reference_images.length > 3 && (
                        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center text-sm text-muted-foreground">
                          +{request.reference_images.length - 3}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm">
                    {request.proposed_budget && (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <IndianRupee className="h-3 w-3" />
                        Budget: {formatPrice(request.proposed_budget)}
                      </span>
                    )}
                    {request.seller_quote && (
                      <span className="flex items-center gap-1 text-primary font-medium">
                        <IndianRupee className="h-3 w-3" />
                        Quote: {formatPrice(request.seller_quote)}
                      </span>
                    )}
                    {request.estimated_delivery_days && (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Delivery: {request.estimated_delivery_days} days
                      </span>
                    )}
                  </div>

                  {request.seller_notes && (
                    <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Artisan's Note:</span> {request.seller_notes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {isSeller && request.status === 'pending' && (
                    <>
                      <Button size="sm" onClick={() => handleRespond(request)}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Respond
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => {
                          setSelectedRequest(request);
                          handleSubmitResponse('rejected');
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Decline
                      </Button>
                    </>
                  )}

                  {!isSeller && request.status === 'quoted' && (
                    <Button size="sm" onClick={() => acceptQuote(request.id)}>
                      <Check className="h-4 w-4 mr-2" />
                      Accept Quote
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Response Modal for Sellers */}
      <Dialog open={showResponseModal} onOpenChange={setShowResponseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Respond to Custom Request</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quote">Your Quote (INR)</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="quote"
                  type="number"
                  placeholder="Enter your price"
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery">Estimated Delivery (Days)</Label>
              <Input
                id="delivery"
                type="number"
                placeholder="Number of days"
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Message to Buyer</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about the custom order..."
                value={sellerNotes}
                onChange={(e) => setSellerNotes(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowResponseModal(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleSubmitResponse('quoted')}>
                Send Quote
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CustomRequestsList;