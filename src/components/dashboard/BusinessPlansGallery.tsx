import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Eye, Edit, Download, Share2 } from 'lucide-react';
import { formatRelative, formatCurrency } from '@/lib/dashboard-utils';
import { BusinessPlan } from '@/types/dashboard';

interface BusinessPlansGalleryProps {
  plans: BusinessPlan[];
  onViewPlan: (id: string) => void;
  onEditPlan: (id: string) => void;
  onDownloadPlan: (id: string) => void;
}

const BusinessPlansGallery: React.FC<BusinessPlansGalleryProps> = ({
  plans,
  onViewPlan,
  onEditPlan,
  onDownloadPlan,
}) => {
  if (plans.length === 0) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">Your Business Plans</h2>
        </div>
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No business plans yet</h3>
            <p className="text-muted-foreground mb-6">
              Generate your first comprehensive business plan from one of your ideas.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-foreground">Your Business Plans</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <Card key={plan.id} className="hover:shadow-medium transition-smooth">
            <CardHeader className="gradient-warm">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-white/80">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">{plan.businessName}</CardTitle>
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 mt-1">
                    {plan.businessType}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Monthly Revenue</div>
                  <div className="text-lg font-semibold text-foreground">
                    ₹{formatCurrency(plan.financialData.monthlyRevenue)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Break-even</div>
                  <div className="text-lg font-semibold text-foreground">
                    {plan.financialData.breakEvenMonths} months
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Completion</span>
                  <span className="font-semibold text-foreground">
                    {plan.completionPercentage}%
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-accent-orange h-2 rounded-full transition-smooth"
                    style={{ width: `${plan.completionPercentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                {plan.status === 'complete' ? (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    ✓ Complete
                  </Badge>
                ) : (
                  <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                    ⚠ Draft
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {formatRelative(plan.lastEdited)}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="warm" onClick={() => onViewPlan(plan.id)} className="flex-1">
                  <Eye className="h-3 w-3 mr-1" /> View
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onEditPlan(plan.id)}>
                  <Edit className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onDownloadPlan(plan.id)}>
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BusinessPlansGallery;
