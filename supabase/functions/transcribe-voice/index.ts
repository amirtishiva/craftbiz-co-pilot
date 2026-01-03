import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z, ZodError } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AudioSchema = z.object({
  audioData: z.string()
    .min(1, { message: "Audio data is required" })
    .max(52428800, { message: "Audio file exceeds 50MB limit" })
    .refine((val) => val.includes('base64') || val.length > 0, { message: 'Invalid audio data format' })
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { audioData } = AudioSchema.parse(body);

    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    
    if (!ELEVENLABS_API_KEY) {
      console.error('Missing ELEVENLABS_API_KEY configuration');
      return new Response(
        JSON.stringify({ error: 'Service configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Transcribing audio with ElevenLabs Speech-to-Text API');

    // Convert base64 to binary
    const base64Audio = audioData.includes('base64,') 
      ? audioData.split('base64,')[1] 
      : audioData;
    
    const binaryAudio = Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0));
    
    // Create form data for ElevenLabs API
    const formData = new FormData();
    const audioBlob = new Blob([binaryAudio], { type: 'audio/webm' });
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model_id', 'scribe_v1');
    formData.append('tag_audio_events', 'false');
    formData.append('diarize', 'false');

    // Step 1: Transcribe with ElevenLabs
    const elevenLabsResponse = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: formData,
    });

    if (!elevenLabsResponse.ok) {
      const errorText = await elevenLabsResponse.text();
      console.error('ElevenLabs API error:', elevenLabsResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to transcribe audio. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const elevenLabsData = await elevenLabsResponse.json();
    const transcribedText = elevenLabsData.text;
    // ElevenLabs returns language_code in ISO 639-3 format (e.g., 'eng', 'hin')
    const detectedLanguage = elevenLabsData.language_code || 'eng';

    console.log('Transcribed text:', transcribedText, 'Language:', detectedLanguage);

    // Step 2: If not English, translate using Gemini API
    let translatedText = null;
    
    if (detectedLanguage !== 'eng' && detectedLanguage !== 'en' && GEMINI_API_KEY) {
      console.log('Detected non-English language, translating to English...');
      
      try {
        const translationResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      text: `You are a professional translator. Your ONLY task is to translate the following text into clear, natural English. Respond with ONLY the English translation - no explanations, no labels, no additional text whatsoever. Just the pure English translation.\n\nText to translate:\n${transcribedText}`
                    }
                  ]
                }
              ],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 2048,
              }
            }),
          }
        );

        if (!translationResponse.ok) {
          const errorText = await translationResponse.text();
          console.error('Gemini Translation API error:', translationResponse.status, errorText);
          // Don't throw - translation is optional, continue with original text
          translatedText = null;
        } else {
          const translationData = await translationResponse.json();
          translatedText = translationData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          
          if (!translatedText || translatedText.length === 0) {
            console.error('Translation returned empty text');
            translatedText = null;
          } else {
            console.log('Successfully translated text:', translatedText);
          }
        }
      } catch (translationError) {
        console.error('Translation failed:', translationError);
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
  } catch (error: unknown) {
    console.error('Error in transcribe-voice function:', error);
    
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
    
    return new Response(
      JSON.stringify({ error: 'Failed to transcribe audio. Please try again.' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
