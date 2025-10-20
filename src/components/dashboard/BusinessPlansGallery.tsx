import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Download, Share2, FileText, Plus } from 'lucide-react';
import { BusinessPlan } from '@/types/dashboard';
import { formatRelative, formatCurrency } from '@/lib/dashboard-utils';

interface BusinessPlansGalleryProps {
  plans: BusinessPlan[];
  onViewPlan: (id: string) => void;
  onEditPlan: (id: string) => void;
  onDownloadPlan: (id: string) => void;
  onNewPlan: () => void;
}

const BusinessPlansGallery: React.FC<BusinessPlansGalleryProps> = ({
  plans,
  onViewPlan,
  onEditPlan,
  onDownloadPlan,
  onNewPlan,
}) => {
  if (plans.length === 0) {
    return (
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Your Business Plans</h2>
        </div>
        <Card className="text-center py-12">
          <CardContent>
            <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No business plans yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Generate your first comprehensive business plan from one of your ideas.
            </p>
            <Button size="lg" variant="craft" onClick={onNewPlan}>
              View My Ideas
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div id="plans-gallery" className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Your Business Plans</h2>
        <Button variant="craft" onClick={onNewPlan}>
          <Plus className="mr-2 h-4 w-4" />
          Generate New Plan
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card 
            key={plan.id}
            className="hover:shadow-medium transition-smooth overflow-hidden"
          >
            <div className="h-24 gradient-brand flex items-center justify-center">
              <FileText className="h-12 w-12 text-white" />
            </div>
            
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-xl font-bold line-clamp-1">{plan.businessName}</h3>
                <Badge variant={plan.status === 'complete' ? 'default' : 'secondary'}>
                  {plan.status === 'complete' ? '✓ Complete' : '⚠ Draft'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {plan.businessType}
              </p>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-muted rounded-lg p-3">
                  <div className="text-xs text-muted-foreground mb-1">Revenue/mo</div>
                  <div className="text-sm font-semibold">₹{formatCurrency(plan.financialData.monthlyRevenue)}</div>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="text-xs text-muted-foreground mb-1">Break-even</div>
                  <div className="text-sm font-semibold">{plan.financialData.breakEvenMonths} months</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Completion</span>
                  <span>{plan.completionPercentage}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-accent-orange h-2 rounded-full transition-smooth"
                    style={{ width: `${plan.completionPercentage}%` }}
                  />
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground mt-3">
                Last edited: {formatRelative(plan.lastEdited)}
              </p>
            </CardContent>
            
            <CardFooter className="flex gap-2 flex-wrap">
              <Button size="sm" variant="craft" onClick={() => onViewPlan(plan.id)} className="flex-1">
                <Eye className="mr-1 h-3 w-3" />
                View
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onEditPlan(plan.id)}>
                <Edit className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onDownloadPlan(plan.id)}>
                <Download className="h-3 w-3" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BusinessPlansGallery;
