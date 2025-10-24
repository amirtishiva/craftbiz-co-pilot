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
    const { audioData } = await req.json();

    if (!audioData) {
      throw new Error('Audio data is required');
    }

    const OPENAI_API_KEY = Deno.env.get('Open_API');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }
    
    if (!LOVABLE_API_KEY) {
      throw new Error('Lovable API key is not configured');
    }

    console.log('Transcribing audio with OpenAI Whisper API');

    // Convert base64 to binary
    const base64Audio = audioData.includes('base64,') 
      ? audioData.split('base64,')[1] 
      : audioData;
    
    const binaryAudio = Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0));
    
    // Create form data for Whisper API
    const formData = new FormData();
    const audioBlob = new Blob([binaryAudio], { type: 'audio/webm' });
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'verbose_json');

    // Step 1: Transcribe with Whisper
    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!whisperResponse.ok) {
      const errorText = await whisperResponse.text();
      console.error('Whisper API error:', whisperResponse.status, errorText);
      throw new Error(`Whisper API error: ${whisperResponse.status}`);
    }

    const whisperData = await whisperResponse.json();
    const transcribedText = whisperData.text;
    const detectedLanguage = whisperData.language || 'en';

    console.log('Transcribed text:', transcribedText, 'Language:', detectedLanguage);

    // Step 2: If not English, translate using GPT-5 Mini
    let translatedText = null;
    
    if (detectedLanguage !== 'en') {
      console.log('Detected non-English language, translating to English...');
      
      try {
        const translationResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { 
                role: 'system', 
                content: 'You are a professional translator. Your ONLY task is to translate the given text into clear, natural English. Respond with ONLY the English translation - no explanations, no labels, no additional text whatsoever. Just the pure English translation.'
              },
              { 
                role: 'user', 
                content: transcribedText
              }
            ],
          }),
        });

        if (!translationResponse.ok) {
          const errorText = await translationResponse.text();
          console.error('Translation API error:', translationResponse.status, errorText);
          throw new Error(`Translation API error: ${translationResponse.status} - ${errorText}`);
        }

        const translationData = await translationResponse.json();
        translatedText = translationData.choices[0].message.content.trim();
        
        if (!translatedText || translatedText.length === 0) {
          console.error('Translation returned empty text');
          translatedText = null;
        } else {
          console.log('Successfully translated text:', translatedText);
        }
      } catch (error) {
        console.error('Translation failed:', error);
        // Translation failed, will return null and frontend will use original text
        translatedText = null;
      }
    }

    return new Response(
      JSON.stringify({ 
        transcribedText,
        detectedLanguage,
        translatedText
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in transcribe-voice function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
