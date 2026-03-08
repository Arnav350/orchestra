import { supabase } from './supabase';

export type ChatMessage = {
  text: string;
  isUser: boolean;
};

export type OpenAIResponse = {
  success: boolean;
  response?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  error?: string;
};

/**
 * Call Supabase Edge Function to get AI completion
 * @param messages - Array of chat messages for context
 * @param systemPrompt - Optional system prompt to customize AI behavior
 */
export async function getAICompletion(
  messages: ChatMessage[],
  systemPrompt?: string
): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('chat-completion', {
      body: {
        messages,
        systemPrompt: systemPrompt || 'You are a helpful AI assistant named Orchestra.',
      },
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(error.message || 'Failed to get AI response');
    }

    if (!data.success) {
      throw new Error(data.error || 'AI response failed');
    }

    return data.response;
  } catch (error) {
    console.error('Error calling AI:', error);
    throw error;
  }
}
