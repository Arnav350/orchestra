import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import OpenAI from 'https://esm.sh/openai@4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });

    // Parse request body
    const { audio, format = 'm4a' } = await req.json();

    if (!audio) {
      throw new Error('No audio data provided');
    }

    // Convert base64 to binary
    const audioData = Uint8Array.from(atob(audio), c => c.charCodeAt(0));

    // Create a File object for the Whisper API
    const audioFile = new File([audioData], `audio.${format}`, {
      type: format === 'm4a' ? 'audio/mp4' : 'audio/webm',
    });

    // Call Whisper API for transcription
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en', // Can be made configurable or set to auto-detect
      response_format: 'json',
      temperature: 0, // Deterministic output
    });

    return new Response(
      JSON.stringify({
        success: true,
        text: transcription.text,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Transcription error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Transcription failed',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});