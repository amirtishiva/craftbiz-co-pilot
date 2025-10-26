import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Download,
  Edit,
  Save,
  Calculator,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BusinessPlanProps {
  ideaData?: any;
}

const BusinessPlan: React.FC<BusinessPlanProps> = ({ ideaData }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [businessPlan, setBusinessPlan] = useState<string>('');
  const [planId, setPlanId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState<string>('');
  const [businessName, setBusinessName] = useState('');
  const [financialData, setFinancialData] = useState({
    startupCost: '',
    monthlyExpenses: '',
    pricePerUnit: '',
    unitsPerMonth: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    if (ideaData?.id) {
      loadExistingPlan(ideaData.id);
    }
  }, [ideaData]);

  const loadExistingPlan = async (ideaId: string) => {
    try {
      const { data, error } = await supabase
        .from('business_plans')
        .select('*')
        .eq('idea_id', ideaId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPlanId(data.id);
        // Combine all sections into unified content
        const unifiedPlan = formatUnifiedPlan({
          executiveSummary: data.executive_summary || '',
          marketAnalysis: data.market_analysis || '',
          targetCustomers: data.target_customers || '',
          competitiveAdvantage: data.competitive_advantage || '',
          revenueModel: data.revenue_model || '',
          marketingStrategy: data.marketing_strategy || '',
          operationsPlan: data.operations_plan || '',
          financialProjections: data.financial_projections || '',
          riskAnalysis: data.risk_analysis || '',
          implementationTimeline: data.implementation_timeline || ''
        });
        setBusinessPlan(unifiedPlan);
        setBusinessName(data.business_name || '');
      }
    } catch (error) {
      console.error('Error loading plan:', error);
    }
  };

  const formatUnifiedPlan = (sections: any): string => {
    return `EXECUTIVE SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${sections.executiveSummary}

MARKET ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${sections.marketAnalysis}

TARGET CUSTOMERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${sections.targetCustomers}

COMPETITIVE ADVANTAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${sections.competitiveAdvantage}

REVENUE MODEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${sections.revenueModel}

MARKETING STRATEGY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${sections.marketingStrategy}

OPERATIONS PLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${sections.operationsPlan}

FINANCIAL PROJECTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${sections.financialProjections}

RISK ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${sections.riskAnalysis}

IMPLEMENTATION TIMELINE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${sections.implementationTimeline}`;
  };

  const generateBusinessPlan = async () => {
    if (!ideaData?.id) {
      toast({
        title: "Missing Information",
        description: "No business idea found. Please capture your idea first.",
        variant: "destructive",
      });
      return;
    }

    const nameToUse = businessName || ideaData.type || 'My Business';
    
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-business-plan', {
        body: { 
          ideaId: ideaData.id,
          businessName: nameToUse
        }
      });

      if (error) throw error;

      const planData = data.businessPlan;
      setPlanId(planData.id);
      
      // Format unified plan from backend response
      const unifiedPlan = formatUnifiedPlan({
        executiveSummary: planData.executive_summary || '',
        marketAnalysis: planData.market_analysis || '',
        targetCustomers: planData.target_customers || '',
        competitiveAdvantage: planData.competitive_advantage || '',
        revenueModel: planData.revenue_model || '',
        marketingStrategy: planData.marketing_strategy || '',
        operationsPlan: planData.operations_plan || '',
        financialProjections: planData.financial_projections || '',
        riskAnalysis: planData.risk_analysis || '',
        implementationTimeline: planData.implementation_timeline || ''
      });
      
      setBusinessPlan(unifiedPlan);
      setBusinessName(planData.business_name);
      
      toast({
        title: "Business Plan Generated!",
        description: "Your comprehensive business plan is ready.",
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate business plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleEdit = () => {
    if (!isEditing) {
      setEditedContent(businessPlan);
    }
    setIsEditing(!isEditing);
  };

  const parseUnifiedPlanToSections = (unifiedPlan: string) => {
    const sections = {
      executive_summary: '',
      market_analysis: '',
      target_customers: '',
      competitive_advantage: '',
      revenue_model: '',
      marketing_strategy: '',
      operations_plan: '',
      financial_projections: '',
      risk_analysis: '',
      implementation_timeline: ''
    };

    const sectionRegex = /^([A-Z\s]+)\n━+\n([\s\S]*?)(?=\n\n[A-Z\s]+\n━+|$)/gm;
    let match;

    while ((match = sectionRegex.exec(unifiedPlan)) !== null) {
      const title = match[1].trim();
      const content = match[2].trim();
      
      switch(title) {
        case 'EXECUTIVE SUMMARY':
          sections.executive_summary = content;
          break;
        case 'MARKET ANALYSIS':
          sections.market_analysis = content;
          break;
        case 'TARGET CUSTOMERS':
          sections.target_customers = content;
          break;
        case 'COMPETITIVE ADVANTAGE':
          sections.competitive_advantage = content;
          break;
        case 'REVENUE MODEL':
          sections.revenue_model = content;
          break;
        case 'MARKETING STRATEGY':
          sections.marketing_strategy = content;
          break;
        case 'OPERATIONS PLAN':
          sections.operations_plan = content;
          break;
        case 'FINANCIAL PROJECTIONS':
          sections.financial_projections = content;
          break;
        case 'RISK ANALYSIS':
          sections.risk_analysis = content;
          break;
        case 'IMPLEMENTATION TIMELINE':
          sections.implementation_timeline = content;
          break;
      }
    }

    return sections;
  };

  const handleSavePlan = async () => {
    if (!planId) {
      toast({
        title: "Save Failed",
        description: "No plan ID found. Please regenerate the plan.",
        variant: "destructive",
      });
      return;
    }

    try {
      const sections = parseUnifiedPlanToSections(editedContent);
      
      const { error } = await supabase
        .from('business_plans')
        .update(sections)
        .eq('id', planId);

      if (error) throw error;

      setBusinessPlan(editedContent);
      setIsEditing(false);
      
      toast({
        title: "Business Plan Updated",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPDF = () => {
    const planText = `BUSINESS PLAN
=============
Business Name: ${businessName}

${businessPlan}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FINANCIAL CALCULATOR RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Monthly Revenue: ₹${projections.monthlyRevenue.toLocaleString()}
Monthly Profit: ₹${projections.monthlyProfit.toLocaleString()}
Break-even Period: ${projections.breakEvenMonths} months
Yearly Revenue: ₹${projections.yearlyRevenue.toLocaleString()}
    `;

    const blob = new Blob([planText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${businessName.replace(/\s+/g, '-')}-business-plan.txt`;
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <FileText className="h-8 w-8 text-primary" />
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
            <CardContent className="text-center space-y-6">
              {ideaData && (
                <div className="p-4 bg-muted rounded-lg text-left">
                  <h4 className="font-semibold mb-2">Your Business Idea:</h4>
                  <p className="text-sm text-muted-foreground">{ideaData.idea}</p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Type: {ideaData.type}
                  </div>
                </div>
              )}

              <div className="space-y-2 text-left max-w-md mx-auto">
                <label className="text-sm font-medium">Business Name (Optional)</label>
                <Input
                  placeholder="Enter your business name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>
              
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
              <Button variant="craft" onClick={handleDownloadPDF} aria-label="Download business plan as text file">
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
              {/* Unified Business Plan Editor */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Complete Business Plan
                    </CardTitle>
                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <Button
                            variant="outline"
                            onClick={toggleEdit}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSavePlan}
                            className="gap-2"
                          >
                            <Save className="h-4 w-4" />
                            Save Changes
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={toggleEdit}
                          className="gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Edit Plan
                        </Button>
                      )}
                    </div>
                  </div>
                  <CardDescription>
                    {isEditing 
                      ? "Edit your business plan. Section headers are marked with ━━━ separators."
                      : "Your comprehensive business plan with all sections in one view."
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      className="w-full min-h-[600px] font-mono text-sm leading-relaxed"
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      aria-label="Edit complete business plan"
                    />
                  ) : (
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-sm text-foreground leading-relaxed">
                        {businessPlan}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
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