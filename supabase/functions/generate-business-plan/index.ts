import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ideaId, businessName } = await req.json();

    if (!ideaId) {
      throw new Error('Idea ID is required');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the user's idea
    const { data: idea, error: ideaError } = await supabase
      .from('business_ideas')
      .select('*')
      .eq('id', ideaId)
      .single();

    if (ideaError || !idea) {
      throw new Error('Idea not found');
    }

    const OPENAI_API_KEY = Deno.env.get('Open_API');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const systemPrompt = `You are an expert business consultant specializing in helping Indian entrepreneurs create comprehensive business plans. You understand the Indian market, local challenges, and opportunities for small businesses.

Your task is to generate a complete, practical business plan that is:
- Tailored to the Indian market context
- Actionable and realistic for small business owners
- Comprehensive yet easy to understand
- Focused on practical implementation`;

    const userPrompt = `Business Idea: ${idea.refined_idea || idea.original_text}
Business Name: ${businessName || 'Not specified'}

Please generate a comprehensive business plan with the following sections:

1. Executive Summary (2-3 paragraphs overview)
2. Market Analysis (target market, size, trends in India)
3. Target Customers (detailed customer profiles)
4. Competitive Advantage (what makes this business unique)
5. Revenue Model (how the business will make money)
6. Marketing Strategy (customer acquisition channels suitable for India)
7. Operations Plan (day-to-day operations, resources needed)
8. Financial Projections (startup costs, monthly expenses, revenue estimates)
9. Risk Analysis (potential challenges and mitigation strategies)
10. Implementation Timeline (6-month roadmap)

Format the response as JSON with these exact keys: executiveSummary, marketAnalysis, targetCustomers, competitiveAdvantage, revenueModel, marketingStrategy, operationsPlan, financialProjections, riskAnalysis, implementationTimeline`;

    console.log('Generating business plan for idea:', ideaId);

    console.log('Generating business plan with OpenAI GPT-5');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    // Try to parse JSON from the response
    let planContent;
    try {
      planContent = JSON.parse(content);
    } catch (e) {
      // If not valid JSON, create structured plan from text
      console.log('Response not JSON, structuring data from text');
      planContent = {
        executiveSummary: content.substring(0, 500),
        marketAnalysis: content.substring(500, 1000) || 'Market analysis pending',
        targetCustomers: content.substring(1000, 1500) || 'Target customers to be defined',
        competitiveAdvantage: content.substring(1500, 2000) || 'Competitive advantages to be identified',
        revenueModel: content.substring(2000, 2500) || 'Revenue model to be developed',
        marketingStrategy: content.substring(2500, 3000) || 'Marketing strategy to be planned',
        operationsPlan: content.substring(3000, 3500) || 'Operations plan to be detailed',
        financialProjections: content.substring(3500, 4000) || 'Financial projections to be calculated',
        riskAnalysis: content.substring(4000, 4500) || 'Risk analysis to be completed',
        implementationTimeline: content.substring(4500) || '6-month timeline to be created'
      };
    }

    // Save business plan to database
    const { data: businessPlan, error: planError } = await supabase
      .from('business_plans')
      .insert({
        user_id: idea.user_id,
        idea_id: ideaId,
        business_name: businessName || 'My Business',
        executive_summary: planContent.executiveSummary,
        market_analysis: planContent.marketAnalysis,
        target_customers: planContent.targetCustomers,
        competitive_advantage: planContent.competitiveAdvantage,
        revenue_model: planContent.revenueModel,
        marketing_strategy: planContent.marketingStrategy,
        operations_plan: planContent.operationsPlan,
        financial_projections: planContent.financialProjections,
        risk_analysis: planContent.riskAnalysis,
        implementation_timeline: planContent.implementationTimeline,
        status: 'completed'
      })
      .select()
      .single();

    if (planError) {
      console.error('Error saving business plan:', planError);
      throw new Error('Failed to save business plan');
    }

    console.log('Business plan generated and saved:', businessPlan.id);

    return new Response(
      JSON.stringify({ businessPlan }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-business-plan function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
