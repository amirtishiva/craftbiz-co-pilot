import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, targetLanguage } = await req.json();

    if (!content || !targetLanguage) {
      throw new Error('Content and target language are required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const languageNames: { [key: string]: string } = {
      'hi': 'Hindi (हिन्दी)',
      'te': 'Telugu (తెలుగు)',
      'ta': 'Tamil (தமிழ்)',
      'bn': 'Bengali (বাংলা)',
      'mr': 'Marathi (मराठी)',
      'gu': 'Gujarati (ગુજરાતી)',
      'kn': 'Kannada (ಕನ್ನಡ)',
      'ml': 'Malayalam (മലയാളം)',
      'pa': 'Punjabi (ਪੰਜਾਬੀ)',
      'or': 'Odia (ଓଡ଼ିଆ)',
    };

    const systemPrompt = `You are a professional translator specializing in business documents. Your task is to translate the given business plan content into ${languageNames[targetLanguage] || targetLanguage} while:

1. Preserving all formatting, structure, and section headings
2. Maintaining professional business terminology
3. Keeping the same tone and clarity
4. Translating section titles, headings, and all content
5. Ensuring cultural appropriateness for Indian entrepreneurs
6. Preserving any numerical data, percentages, and currency symbols (₹)

Provide ONLY the translated text without any explanations or metadata.`;

    const userPrompt = `Translate the following business plan content into ${languageNames[targetLanguage] || targetLanguage}:

${content}`;

    console.log('Translating business plan to:', targetLanguage);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI API error:', response.status, errorText);
      throw new Error(`Translation API error: ${response.status}`);
    }

    const data = await response.json();
    const translatedContent = data.choices[0].message.content;

    console.log('Translation completed successfully');

    return new Response(
      JSON.stringify({ translatedContent }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in translate-business-plan function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
