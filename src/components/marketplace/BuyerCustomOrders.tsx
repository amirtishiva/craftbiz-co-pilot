import React, { useEffect } from 'react';
import { ArrowLeft, Clock, CheckCircle, XCircle, MessageSquare, IndianRupee, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCustomOrders, CustomRequest } from '@/hooks/useCustomOrders';

interface BuyerCustomOrdersProps {
  onBack: () => void;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Pending</Badge>;
    case 'quoted':
      return <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20">Quote Received</Badge>;
    case 'accepted':
      return <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">Accepted</Badge>;
    case 'rejected':
      return <Badge variant="secondary" className="bg-red-500/10 text-red-600 border-red-500/20">Declined</Badge>;
    case 'completed':
      return <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">Completed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const BuyerCustomOrders: React.FC<BuyerCustomOrdersProps> = ({ onBack }) => {
  const { buyerRequests, fetchBuyerRequests, acceptQuote, isLoading } = useCustomOrders();

  useEffect(() => {
    fetchBuyerRequests();
  }, [fetchBuyerRequests]);

  const handleAcceptQuote = async (requestId: string) => {
    await acceptQuote(requestId);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button variant="ghost" onClick={onBack} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Marketplace
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <MessageSquare className="h-8 w-8 text-primary" />
          My Custom Orders
        </h1>
        <p className="text-muted-foreground mt-1">
          Track all your custom order requests and artisan responses
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
                <div className="h-3 bg-muted rounded w-2/3 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : buyerRequests.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Custom Orders Yet</h3>
            <p className="text-muted-foreground mb-4">
              Browse products and request custom items from artisans
            </p>
            <Button onClick={onBack}>Browse Marketplace</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {buyerRequests.map((request) => (
            <Card key={request.id} className="hover:border-primary/30 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {request.seller?.shop_name || 'Artisan Shop'}
                    </CardTitle>
                    {request.seller?.shop_tagline && (
                      <p className="text-sm text-muted-foreground">{request.seller.shop_tagline}</p>
                    )}
                  </div>
                  {getStatusBadge(request.status || 'pending')}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Your Request</h4>
                  <p className="text-foreground">{request.description}</p>
                </div>

                <div className="flex flex-wrap gap-4 text-sm">
                  {request.proposed_budget && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <IndianRupee className="h-4 w-4" />
                      <span>Your Budget: ₹{request.proposed_budget.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Submitted: {new Date(request.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Seller Response Section */}
                {request.status === 'quoted' && (
                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4 space-y-3">
                    <h4 className="font-medium text-blue-600 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Artisan's Quote
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {request.seller_quote && (
                        <div>
                          <span className="text-muted-foreground">Quoted Price:</span>
                          <p className="font-semibold text-foreground">₹{request.seller_quote.toLocaleString()}</p>
                        </div>
                      )}
                      {request.estimated_delivery_days && (
                        <div>
                          <span className="text-muted-foreground">Delivery Time:</span>
                          <p className="font-semibold text-foreground">{request.estimated_delivery_days} days</p>
                        </div>
                      )}
                    </div>
                    
                    {request.seller_notes && (
                      <div>
                        <span className="text-sm text-muted-foreground">Artisan's Note:</span>
                        <p className="text-foreground mt-1">{request.seller_notes}</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button 
                        onClick={() => handleAcceptQuote(request.id)}
                        className="flex-1"
                        disabled={isLoading}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accept Quote
                      </Button>
                    </div>
                  </div>
                )}

                {request.status === 'accepted' && (
                  <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
                    <h4 className="font-medium text-green-600 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Order Accepted
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      The artisan will contact you to proceed with your custom order.
                    </p>
                    {request.seller_quote && (
                      <p className="text-sm font-medium mt-2">Final Price: ₹{request.seller_quote.toLocaleString()}</p>
                    )}
                  </div>
                )}

                {request.status === 'rejected' && (
                  <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                    <h4 className="font-medium text-red-600 flex items-center gap-2">
                      <XCircle className="h-4 w-4" />
                      Request Declined
                    </h4>
                    {request.seller_notes && (
                      <p className="text-sm text-muted-foreground mt-1">{request.seller_notes}</p>
                    )}
                  </div>
                )}

                {request.status === 'pending' && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 animate-pulse" />
                    <span>Waiting for artisan response...</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BuyerCustomOrders;
