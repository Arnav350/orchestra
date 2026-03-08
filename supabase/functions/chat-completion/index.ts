import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import OpenAI from 'https://esm.sh/openai@4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    })

    // Parse request body
    const { messages, systemPrompt } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      throw new Error('Invalid messages format')
    }

    // Build messages array for OpenAI
    const openaiMessages = [
      {
        role: 'system',
        content: systemPrompt || 'You are a helpful AI assistant named Orchestra.',
      },
      ...messages.map((msg: any) => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.text,
      })),
    ]

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Cost-effective model
      messages: openaiMessages,
      temperature: 0.7,
      max_tokens: 500,
    })

    const aiResponse = completion.choices[0]?.message?.content || 'No response generated'

    return new Response(
      JSON.stringify({
        success: true,
        response: aiResponse,
        usage: completion.usage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
