import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target, 
  BarChart,
  Download,
  Edit,
  Calculator,
  Globe
} from 'lucide-react';

interface BusinessPlanProps {
  ideaData?: any;
}

const BusinessPlan: React.FC<BusinessPlanProps> = ({ ideaData }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [businessPlan, setBusinessPlan] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [financialData, setFinancialData] = useState({
    startupCost: '',
    monthlyExpenses: '',
    pricePerUnit: '',
    unitsPerMonth: '',
  });

  const generateBusinessPlan = async () => {
    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      setBusinessPlan({
        executiveSummary: "Your handmade crafts marketplace connects local artisans with customers seeking authentic, unique products. By eliminating intermediaries, artisans receive fair compensation while customers access genuine handcrafted items at reasonable prices.",
        marketAnalysis: "The Indian handicrafts market is valued at $4.5 billion with 7 million artisans. E-commerce penetration in this sector is only 15%, representing a significant opportunity. Target demographics include urban millennials and conscious consumers aged 25-45.",
        businessModel: "Commission-based marketplace earning 8-12% per transaction. Additional revenue from premium seller subscriptions, advertising, and logistics partnerships. Focus on quality curation and authentic storytelling.",
        marketingStrategy: "Social media marketing highlighting artisan stories, influencer partnerships, craft workshops, and participation in cultural festivals. SEO-optimized content around 'authentic Indian crafts' and 'supporting local artisans'.",
        operationsPlanning: "Three-phase launch: 1) Onboard 50 artisans in pilot city, 2) Develop quality standards and logistics, 3) Scale to 5 cities within 12 months. Partner with established logistics providers for delivery.",
        financialProjections: "Break-even expected in month 18. Projected revenue of ₹2.5 lakhs in year 1, scaling to ₹15 lakhs by year 3. Initial investment requirement: ₹5 lakhs for platform development and marketing."
      });
      setIsGenerating(false);
    }, 3000);
  };

  const handleEditPlan = () => {
    setIsEditing(!isEditing);
  };

  const handleDownloadPDF = () => {
    // Create a simple text version for download
    const planText = `
BUSINESS PLAN
=============

Executive Summary:
${businessPlan.executiveSummary}

Market Analysis:
${businessPlan.marketAnalysis}

Business Model:
${businessPlan.businessModel}

Marketing Strategy:
${businessPlan.marketingStrategy}

Operations Planning:
${businessPlan.operationsPlanning}

Financial Projections:
${businessPlan.financialProjections}

Financial Calculator Results:
- Monthly Revenue: ₹${projections.monthlyRevenue.toLocaleString()}
- Monthly Profit: ₹${projections.monthlyProfit.toLocaleString()}
- Break-even Period: ${projections.breakEvenMonths} months
- Yearly Revenue: ₹${projections.yearlyRevenue.toLocaleString()}
    `;

    const blob = new Blob([planText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'business-plan.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const calculateProjections = () => {
    const startup = parseFloat(financialData.startupCost) || 0;
    const monthly = parseFloat(financialData.monthlyExpenses) || 0;
    const price = parseFloat(financialData.pricePerUnit) || 0;
    const units = parseFloat(financialData.unitsPerMonth) || 0;
    
    const monthlyRevenue = price * units;
    const monthlyProfit = monthlyRevenue - monthly;
    const breakEvenMonths = startup / (monthlyProfit > 0 ? monthlyProfit : 1);
    
    return {
      monthlyRevenue,
      monthlyProfit,
      breakEvenMonths: isFinite(breakEvenMonths) ? Math.ceil(breakEvenMonths) : 'N/A',
      yearlyRevenue: monthlyRevenue * 12,
    };
  };

  const projections = calculateProjections();

  const planSections = [
    { id: 'executive', title: 'Executive Summary', icon: FileText },
    { id: 'market', title: 'Market Analysis', icon: TrendingUp },
    { id: 'business', title: 'Business Model', icon: Target },
    { id: 'marketing', title: 'Marketing Strategy', icon: Users },
    { id: 'operations', title: 'Operations', icon: BarChart },
    { id: 'financial', title: 'Financial Projections', icon: DollarSign },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <FileText className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-foreground">AI Business Plan Generator</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Get a comprehensive business plan tailored to your idea and market
        </p>
      </div>

      {!businessPlan ? (
        /* Generation State */
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Ready to Generate Your Business Plan?</CardTitle>
              <CardDescription>
                Our AI will analyze your idea and create a detailed business plan with market analysis, financial projections, and actionable strategies.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              {ideaData && (
                <div className="mb-6 p-4 bg-muted rounded-lg text-left">
                  <h4 className="font-semibold mb-2">Your Business Idea:</h4>
                  <p className="text-sm text-muted-foreground">{ideaData.idea}</p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Type: {ideaData.type} | Language: {ideaData.language}
                  </div>
                </div>
              )}
              
              <Button 
                variant="craft" 
                size="xl" 
                onClick={generateBusinessPlan}
                disabled={isGenerating}
                className="min-w-[200px]"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Generating Plan...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-5 w-5" />
                    Generate Business Plan
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Generated Plan State */
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Your Business Plan</h2>
              <p className="text-muted-foreground">Generated for: {ideaData?.type || 'Your Business'}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleEditPlan}>
                <Edit className="mr-2 h-4 w-4" />
                {isEditing ? 'Save Changes' : 'Edit Plan'}
              </Button>
              <Button variant="craft" onClick={handleDownloadPDF}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>

          <Tabs defaultValue="plan" className="space-y-6">
            <TabsList className="grid grid-cols-2 w-full max-w-md">
              <TabsTrigger value="plan">Business Plan</TabsTrigger>
              <TabsTrigger value="calculator">Financial Calculator</TabsTrigger>
            </TabsList>

            <TabsContent value="plan" className="space-y-6">
              {/* Business Plan Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {planSections.map((section) => {
                  const Icon = section.icon;
                  let content = '';
                  
                  switch(section.id) {
                    case 'executive': content = businessPlan.executiveSummary; break;
                    case 'market': content = businessPlan.marketAnalysis; break;
                    case 'business': content = businessPlan.businessModel; break;
                    case 'marketing': content = businessPlan.marketingStrategy; break;
                    case 'operations': content = businessPlan.operationsPlanning; break;
                    case 'financial': content = businessPlan.financialProjections; break;
                  }
                  
                  return (
                    <Card key={section.id} className="h-full">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Icon className="h-5 w-5 text-accent-orange" />
                          {section.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {content}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="calculator" className="space-y-6">
              {/* Financial Calculator */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      Financial Calculator
                    </CardTitle>
                    <CardDescription>
                      Input your estimates to calculate projections
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Initial Startup Cost (₹)</label>
                      <Input
                        type="number"
                        placeholder="500000"
                        value={financialData.startupCost}
                        onChange={(e) => setFinancialData(prev => ({ ...prev, startupCost: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Monthly Operating Expenses (₹)</label>
                      <Input
                        type="number"
                        placeholder="50000"
                        value={financialData.monthlyExpenses}
                        onChange={(e) => setFinancialData(prev => ({ ...prev, monthlyExpenses: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Price per Unit/Service (₹)</label>
                      <Input
                        type="number"
                        placeholder="1000"
                        value={financialData.pricePerUnit}
                        onChange={(e) => setFinancialData(prev => ({ ...prev, pricePerUnit: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Units Sold per Month</label>
                      <Input
                        type="number"
                        placeholder="100"
                        value={financialData.unitsPerMonth}
                        onChange={(e) => setFinancialData(prev => ({ ...prev, unitsPerMonth: e.target.value }))}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Projections
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm font-medium">Monthly Revenue</span>
                        <span className="text-lg font-bold text-blue-600">
                          ₹{projections.monthlyRevenue.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="text-sm font-medium">Monthly Profit</span>
                        <span className={`text-lg font-bold ${projections.monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ₹{projections.monthlyProfit.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                        <span className="text-sm font-medium">Break-even Period</span>
                        <span className="text-lg font-bold text-orange-600">
                          {projections.breakEvenMonths} months
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                        <span className="text-sm font-medium">Yearly Revenue</span>
                        <span className="text-lg font-bold text-purple-600">
                          ₹{projections.yearlyRevenue.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default BusinessPlan;