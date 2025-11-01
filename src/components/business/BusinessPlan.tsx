import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Download,
  Edit,
  Save,
  Calculator,
  TrendingUp,
  Languages,
  Lightbulb,
  AlertCircle
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
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [translatedContent, setTranslatedContent] = useState<{ [key: string]: string }>({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [financialLanguage, setFinancialLanguage] = useState('en');
  const [translatedFinancialLabels, setTranslatedFinancialLabels] = useState<{[key: string]: any}>({});
  const [isTranslatingFinancial, setIsTranslatingFinancial] = useState(false);
  const [financialData, setFinancialData] = useState({
    startupCost: '',
    monthlyExpenses: '',
    pricePerUnit: '',
    unitsPerMonth: '',
  });
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const { toast } = useToast();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी (Hindi)' },
    { code: 'te', name: 'తెలుగు (Telugu)' },
    { code: 'ta', name: 'தமிழ் (Tamil)' },
    { code: 'bn', name: 'বাংলা (Bengali)' },
    { code: 'mr', name: 'मराठी (Marathi)' },
    { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
    { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
    { code: 'ml', name: 'മലയാളം (Malayalam)' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' },
    { code: 'or', name: 'ଓଡ଼ିଆ (Odia)' },
  ];

  useEffect(() => {
    if (ideaData?.id) {
      loadExistingPlan(ideaData.id);
    }
  }, [ideaData]);

  // Load language preference from session storage
  useEffect(() => {
    const savedLanguage = sessionStorage.getItem('businessPlanLanguage');
    if (savedLanguage) {
      setSelectedLanguage(savedLanguage);
    }
  }, []);

  // Save language preference to session storage
  useEffect(() => {
    sessionStorage.setItem('businessPlanLanguage', selectedLanguage);
  }, [selectedLanguage]);

  // Load financial calculator language preference
  useEffect(() => {
    const savedFinancialLanguage = sessionStorage.getItem('financialCalculatorLanguage');
    if (savedFinancialLanguage) {
      setFinancialLanguage(savedFinancialLanguage);
    }
  }, []);

  // Save financial calculator language preference
  useEffect(() => {
    sessionStorage.setItem('financialCalculatorLanguage', financialLanguage);
  }, [financialLanguage]);

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

  const translateBusinessPlan = async (targetLanguage: string) => {
    if (targetLanguage === 'en') {
      // Reset to original English content
      setSelectedLanguage('en');
      return;
    }

    // Check if translation is already cached
    if (translatedContent[targetLanguage]) {
      setSelectedLanguage(targetLanguage);
      return;
    }

    setIsTranslating(true);
    try {
      const contentToTranslate = businessPlan;

      const { data, error } = await supabase.functions.invoke('translate-business-plan', {
        body: { 
          content: contentToTranslate,
          targetLanguage 
        }
      });

      if (error) throw error;

      // Cache the translation
      setTranslatedContent(prev => ({
        ...prev,
        [targetLanguage]: data.translatedContent
      }));

      setSelectedLanguage(targetLanguage);

      toast({
        title: "Translation completed",
        description: "Your business plan has been translated successfully.",
      });
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: "Translation failed",
        description: "Failed to translate business plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTranslating(false);
    }
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

  // Check if all financial inputs are filled
  const allInputsFilled = financialData.startupCost && 
    financialData.monthlyExpenses && 
    financialData.pricePerUnit && 
    financialData.unitsPerMonth;

  const translateFinancialCalculator = async (targetLanguage: string) => {
    if (targetLanguage === 'en') {
      setFinancialLanguage('en');
      return;
    }

    if (translatedFinancialLabels[targetLanguage]) {
      setFinancialLanguage(targetLanguage);
      return;
    }

    setIsTranslatingFinancial(true);

    try {
      // Format content for translation with clear delimiters
      const contentToTranslate = `
###SECTION_TITLES###
financialCalculator::Financial Calculator
projections::Projections
aiStrategist::AI Financial Strategist

###INPUT_LABELS###
startupCost::Initial Startup Cost
monthlyExpenses::Monthly Operating Expenses
pricePerUnit::Price per Unit/Service
unitsPerMonth::Units Sold per Month

###PROJECTION_LABELS###
monthlyRevenue::Monthly Revenue
monthlyProfit::Monthly Profit
breakEvenPeriod::Break-even Period
yearlyRevenue::Yearly Revenue

###AI_SECTION_LABELS###
cashFlow::Cash Flow Analysis
pricing::Pricing Strategy
growth::Growth Opportunities
risk::Risk Mitigation
actions::Immediate Action Items

###BUTTONS###
getInsights::Get AI Insights
refresh::Refresh Insights
analyzing::Analyzing...

###DESCRIPTIONS###
financialCalc::Input your estimates to calculate projections
aiStrategist::Get personalized recommendations to grow your business
enterDetails::Enter all financial details above to get personalized AI insights

${aiInsights ? `###AI_INSIGHTS###
cashFlowAnalysis::${aiInsights.cashFlowAnalysis}
pricingRecommendation::${aiInsights.pricingRecommendation}
growthOpportunities::${aiInsights.growthOpportunities?.join('||')}
riskMitigation::${aiInsights.riskMitigation?.join('||')}
actionItems::${aiInsights.actionItems?.join('||')}` : ''}
      `.trim();

      const { data, error } = await supabase.functions.invoke('translate-business-plan', {
        body: { 
          content: contentToTranslate,
          targetLanguage 
        }
      });

      if (error) throw error;

      // Parse the translated content
      const translatedText = data.translatedContent;
      console.log('Raw translated text:', translatedText);
      
      const sections = translatedText.split('###').filter((s: string) => s.trim());
      const translatedData: any = {};

      sections.forEach((section: string) => {
        const lines = section.trim().split('\n').filter((l: string) => l.trim());
        if (lines.length === 0) return;

        const sectionName = lines[0].trim();
        console.log('Processing section:', sectionName);
        
        const sectionData: any = {};

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line || !line.includes('::')) continue;
          
          const colonIndex = line.indexOf('::');
          const key = line.substring(0, colonIndex).trim();
          const value = line.substring(colonIndex + 2).trim();
          
          // Handle array values (joined with ||)
          if (value.includes('||')) {
            sectionData[key] = value.split('||').map(v => v.trim());
          } else {
            sectionData[key] = value;
          }
        }

        // Map section names to object structure
        const sectionMap: any = {
          'SECTION_TITLES': 'sectionTitles',
          'INPUT_LABELS': 'inputLabels',
          'PROJECTION_LABELS': 'projectionLabels',
          'AI_SECTION_LABELS': 'aiSectionLabels',
          'BUTTONS': 'buttons',
          'DESCRIPTIONS': 'descriptions',
          'AI_INSIGHTS': 'aiInsights'
        };

        const mappedName = sectionMap[sectionName];
        if (mappedName) {
          translatedData[mappedName] = sectionData;
          console.log(`Mapped ${sectionName} to ${mappedName}:`, sectionData);
        }
      });

      console.log('Final translated data:', translatedData);

      setTranslatedFinancialLabels(prev => ({
        ...prev,
        [targetLanguage]: translatedData
      }));

      setFinancialLanguage(targetLanguage);

      toast({
        title: "Translation completed",
        description: "Financial calculator has been translated successfully.",
      });
    } catch (error) {
      console.error('Financial translation error:', error);
      toast({
        title: "Translation failed",
        description: "Failed to translate financial calculator. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTranslatingFinancial(false);
    }
  };

  const getFinancialLabel = (category: string, key: string, fallback: string) => {
    if (financialLanguage === 'en') return fallback;
    return translatedFinancialLabels[financialLanguage]?.[category]?.[key] || fallback;
  };

  const generateFinancialInsights = async () => {
    if (!allInputsFilled) {
      toast({
        title: "Missing Information",
        description: "Please fill in all financial inputs to get AI insights.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setInsightsError(null);

    try {
      const businessContext = businessPlan 
        ? `${businessPlan.substring(0, 500)}...` // First 500 chars as context
        : ideaData?.refined_idea || ideaData?.original_text || 'New business venture';

      const { data, error } = await supabase.functions.invoke('analyze-financial-strategy', {
        body: {
          financialData: {
            startupCost: parseFloat(financialData.startupCost),
            monthlyExpenses: parseFloat(financialData.monthlyExpenses),
            pricePerUnit: parseFloat(financialData.pricePerUnit),
            unitsPerMonth: parseFloat(financialData.unitsPerMonth),
          },
          projections: {
            monthlyRevenue: projections.monthlyRevenue,
            monthlyProfit: projections.monthlyProfit,
            breakEvenMonths: projections.breakEvenMonths,
            yearlyRevenue: projections.yearlyRevenue,
          },
          businessContext,
          businessName: businessName || ideaData?.type || 'My Business'
        }
      });

      if (error) throw error;

      setAiInsights(data.insights);
      
      // Clear cached translations for financial calculator when insights change
      if (financialLanguage !== 'en') {
        setTranslatedFinancialLabels({});
        setFinancialLanguage('en');
      }
      
      toast({
        title: "AI Insights Generated!",
        description: "Your personalized financial strategy is ready.",
      });
    } catch (error) {
      console.error('Insights generation error:', error);
      setInsightsError(error.message || 'Failed to generate insights');
      
      toast({
        title: "Insights Generation Failed",
        description: "Failed to generate AI insights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Get the content to display based on selected language
  const displayContent = selectedLanguage === 'en' 
    ? businessPlan 
    : (translatedContent[selectedLanguage] || businessPlan);

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
                    <div className="flex items-center gap-2">
                      <Select
                        value={selectedLanguage}
                        onValueChange={translateBusinessPlan}
                        disabled={isTranslating || isEditing}
                      >
                        <SelectTrigger className="w-[200px]">
                          <Languages className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map((lang) => (
                            <SelectItem key={lang.code} value={lang.code}>
                              {lang.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                          disabled={selectedLanguage !== 'en'}
                          title={selectedLanguage !== 'en' ? 'Switch to English to edit' : ''}
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
                      : selectedLanguage !== 'en'
                        ? `Your comprehensive business plan translated to ${languages.find(l => l.code === selectedLanguage)?.name}.`
                        : "Your comprehensive business plan with all sections in one view."
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isTranslating ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        <p className="text-muted-foreground">Translating your business plan...</p>
                      </div>
                    </div>
                  ) : isEditing ? (
                    <Textarea
                      className="w-full min-h-[600px] font-mono text-sm leading-relaxed"
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      aria-label="Edit complete business plan"
                    />
                  ) : (
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-sm text-foreground leading-relaxed">
                        {displayContent}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calculator" className="space-y-6">
              {/* Language Selector for Financial Calculator */}
              <div className="flex justify-end mb-4">
                <Select
                  value={financialLanguage}
                  onValueChange={translateFinancialCalculator}
                  disabled={isTranslatingFinancial}
                >
                  <SelectTrigger className="w-[200px]">
                    <Languages className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isTranslatingFinancial ? (
                <div className="flex items-center justify-center py-20">
                  <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="text-muted-foreground">Translating financial calculator...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Financial Calculator */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calculator className="h-5 w-5" />
                          {getFinancialLabel('sectionTitles', 'financialCalculator', 'Financial Calculator')}
                        </CardTitle>
                        <CardDescription>
                          {getFinancialLabel('descriptions', 'financialCalc', 'Input your estimates to calculate projections')}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">{getFinancialLabel('inputLabels', 'startupCost', 'Initial Startup Cost')} (₹)</label>
                          <Input
                            type="number"
                            placeholder="500000"
                            value={financialData.startupCost}
                            onChange={(e) => setFinancialData(prev => ({ ...prev, startupCost: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">{getFinancialLabel('inputLabels', 'monthlyExpenses', 'Monthly Operating Expenses')} (₹)</label>
                          <Input
                            type="number"
                            placeholder="50000"
                            value={financialData.monthlyExpenses}
                            onChange={(e) => setFinancialData(prev => ({ ...prev, monthlyExpenses: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">{getFinancialLabel('inputLabels', 'pricePerUnit', 'Price per Unit/Service')} (₹)</label>
                          <Input
                            type="number"
                            placeholder="1000"
                            value={financialData.pricePerUnit}
                            onChange={(e) => setFinancialData(prev => ({ ...prev, pricePerUnit: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">{getFinancialLabel('inputLabels', 'unitsPerMonth', 'Units Sold per Month')}</label>
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
                          {getFinancialLabel('sectionTitles', 'projections', 'Projections')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                            <span className="text-sm font-medium">{getFinancialLabel('projectionLabels', 'monthlyRevenue', 'Monthly Revenue')}</span>
                            <span className="text-lg font-bold text-blue-600">
                              ₹{projections.monthlyRevenue.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                            <span className="text-sm font-medium">{getFinancialLabel('projectionLabels', 'monthlyProfit', 'Monthly Profit')}</span>
                            <span className={`text-lg font-bold ${projections.monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ₹{projections.monthlyProfit.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                            <span className="text-sm font-medium">{getFinancialLabel('projectionLabels', 'breakEvenPeriod', 'Break-even Period')}</span>
                            <span className="text-lg font-bold text-orange-600">
                              {projections.breakEvenMonths} months
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                            <span className="text-sm font-medium">{getFinancialLabel('projectionLabels', 'yearlyRevenue', 'Yearly Revenue')}</span>
                            <span className="text-lg font-bold text-purple-600">
                              ₹{projections.yearlyRevenue.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* AI Financial Strategist */}
                    <Card className="border-primary/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lightbulb className="h-5 w-5 text-primary" />
                          {getFinancialLabel('sectionTitles', 'aiStrategist', 'AI Financial Strategist')}
                        </CardTitle>
                        <CardDescription>
                          {getFinancialLabel('descriptions', 'aiStrategist', 'Get personalized recommendations to grow your business')}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {!aiInsights ? (
                          <div className="text-center py-6 space-y-4">
                            {!allInputsFilled ? (
                              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                <AlertCircle className="h-5 w-5" />
                                <p className="text-sm">{getFinancialLabel('descriptions', 'enterDetails', 'Enter all financial details above to get personalized AI insights')}</p>
                              </div>
                            ) : (
                              <Button
                                variant="craft"
                                size="lg"
                                onClick={generateFinancialInsights}
                                disabled={isAnalyzing}
                                className="min-w-[200px]"
                              >
                                {isAnalyzing ? (
                                  <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    {getFinancialLabel('buttons', 'analyzing', 'Analyzing...')}
                                  </>
                                ) : (
                                  <>
                                    <Lightbulb className="mr-2 h-5 w-5" />
                                    {getFinancialLabel('buttons', 'getInsights', 'Get AI Insights')}
                                  </>
                                )}
                              </Button>
                            )}
                            {insightsError && (
                              <p className="text-sm text-destructive">{insightsError}</p>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {/* Refresh Button */}
                            <div className="flex justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={generateFinancialInsights}
                                disabled={isAnalyzing}
                              >
                                {isAnalyzing ? getFinancialLabel('buttons', 'analyzing', 'Analyzing...') : getFinancialLabel('buttons', 'refresh', 'Refresh Insights')}
                              </Button>
                            </div>

                            {/* Cash Flow Analysis */}
                            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                {getFinancialLabel('aiSectionLabels', 'cashFlow', 'Cash Flow Analysis')}
                              </h4>
                              <p className="text-sm text-blue-800 dark:text-blue-200">
                                {financialLanguage === 'en' 
                                  ? aiInsights.cashFlowAnalysis 
                                  : (translatedFinancialLabels[financialLanguage]?.aiInsights?.cashFlowAnalysis || aiInsights.cashFlowAnalysis)}
                              </p>
                            </div>

                            {/* Pricing Recommendation */}
                            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                                <Calculator className="h-4 w-4" />
                                {getFinancialLabel('aiSectionLabels', 'pricing', 'Pricing Strategy')}
                              </h4>
                              <p className="text-sm text-green-800 dark:text-green-200">
                                {financialLanguage === 'en' 
                                  ? aiInsights.pricingRecommendation 
                                  : (translatedFinancialLabels[financialLanguage]?.aiInsights?.pricingRecommendation || aiInsights.pricingRecommendation)}
                              </p>
                            </div>

                            {/* Growth Opportunities */}
                            <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                              <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">{getFinancialLabel('aiSectionLabels', 'growth', 'Growth Opportunities')}</h4>
                              <ul className="space-y-2">
                                {(financialLanguage === 'en' 
                                  ? aiInsights.growthOpportunities 
                                  : (translatedFinancialLabels[financialLanguage]?.aiInsights?.growthOpportunities || aiInsights.growthOpportunities)
                                )?.map((opportunity: string, index: number) => (
                                  <li key={index} className="text-sm text-purple-800 dark:text-purple-200 flex gap-2">
                                    <span className="text-purple-500 dark:text-purple-400">•</span>
                                    <span>{opportunity}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Risk Mitigation */}
                            <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                              <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">{getFinancialLabel('aiSectionLabels', 'risk', 'Risk Mitigation')}</h4>
                              <ul className="space-y-2">
                                {(financialLanguage === 'en' 
                                  ? aiInsights.riskMitigation 
                                  : (translatedFinancialLabels[financialLanguage]?.aiInsights?.riskMitigation || aiInsights.riskMitigation)
                                )?.map((risk: string, index: number) => (
                                  <li key={index} className="text-sm text-orange-800 dark:text-orange-200 flex gap-2">
                                    <span className="text-orange-500 dark:text-orange-400">•</span>
                                    <span>{risk}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Action Items */}
                            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                              <h4 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-2">{getFinancialLabel('aiSectionLabels', 'actions', 'Immediate Action Items')}</h4>
                              <ol className="space-y-2 list-decimal list-inside">
                                {(financialLanguage === 'en' 
                                  ? aiInsights.actionItems 
                                  : (translatedFinancialLabels[financialLanguage]?.aiInsights?.actionItems || aiInsights.actionItems)
                                )?.map((action: string, index: number) => (
                                  <li key={index} className="text-sm text-indigo-800 dark:text-indigo-200">
                                    {action}
                                  </li>
                                ))}
                              </ol>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default BusinessPlan;