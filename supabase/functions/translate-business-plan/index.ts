import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z, ZodError } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const validLanguages = ['hi', 'te', 'ta', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa', 'or'];

const TranslationSchema = z.object({
  content: z.string().trim().min(1, { message: "Content is required" }).max(50000, { message: "Content exceeds 50000 character limit" }),
  targetLanguage: z.enum(['hi', 'te', 'ta', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa', 'or'] as [string, ...string[]], { errorMap: () => ({ message: "Invalid target language" }) })
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { content, targetLanguage } = TranslationSchema.parse(body);

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
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

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `${systemPrompt}\n\n${userPrompt}` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 8192,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Translation API error: ${response.status}`);
    }

    const data = await response.json();
    const translatedContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    console.log('Translation completed successfully');

    return new Response(
      JSON.stringify({ translatedContent }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    console.error('Error in translate-business-plan function:', error);
    
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const firstError = error.errors?.[0];
      const message = firstError?.message || 'Invalid input data';
      return new Response(
        JSON.stringify({ error: message }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
