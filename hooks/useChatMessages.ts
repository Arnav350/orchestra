import { supabase } from '@/lib/supabase';
import { randomUUID } from 'expo-crypto';
import { useEffect, useState } from 'react';
import { loadMessagesFromCache, saveMessagesToCache } from '@/lib/messageCache';
import { getAICompletion } from '@/lib/openai';

type Message = {
  id: string;
  text: string;
  isUser: boolean;
};

type DatabaseMessage = {
  id: string;
  text: string;
  is_user: boolean;
  created_at: string;
};

const MAX_CONTEXT_MESSAGES = 10; // Limit context to save costs

export function useChatMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Load messages on mount
  useEffect(() => {
    loadMessages();
  }, []);

  async function loadMessages() {
    try {
      setLoading(true);
      setError(null);

      // Load from cache first for instant display
      const cachedMessages = await loadMessagesFromCache();
      if (cachedMessages.length > 0) {
        setMessages(cachedMessages);
        setLoading(false); // Show cached messages immediately
      }

      // Fetch from Supabase in background to sync latest
      try {
        const { data, error: fetchError } = await supabase
          .from('messages')
          .select('*')
          .order('created_at', { ascending: true });

        if (fetchError) {
          console.warn('[loadMessages] Supabase fetch error:', fetchError.message);
          // If we have cached messages, don't show error — just use cache
          if (cachedMessages.length > 0) return;
          throw fetchError;
        }

        // Transform database format to app format
        const transformedMessages: Message[] = (data || []).map(
          (msg: DatabaseMessage) => ({
            id: msg.id,
            text: msg.text,
            isUser: msg.is_user,
          })
        );

        setMessages(transformedMessages);

        // Update cache with latest from server
        await saveMessagesToCache(transformedMessages);
      } catch (fetchErr) {
        console.warn('[loadMessages] Could not sync with Supabase, using cache:', fetchErr);
        // If we already set cached messages above, that's fine — don't error
        if (cachedMessages.length === 0) {
          setError('Could not connect to server. Messages will be saved locally.');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  }

  async function generateAIResponse(currentMessages: Message[]) {
    try {
      setAiLoading(true);

      // Get recent context (limit to avoid token limits)
      const contextMessages = currentMessages.slice(-MAX_CONTEXT_MESSAGES);

      // Call OpenAI via Edge Function
      const aiResponse = await getAICompletion(contextMessages);

      // Create AI message
      const aiMessageId = randomUUID();
      const aiMessage: Message = {
        id: aiMessageId,
        text: aiResponse,
        isUser: false,
      };

      // Add AI response to UI
      const newMessages = [...currentMessages, aiMessage];
      setMessages(newMessages);

      // Save AI message to database (non-blocking — don't fail if this errors)
      try {
        const { error: insertError } = await supabase.from('messages').insert({
          id: aiMessageId,
          text: aiResponse,
          is_user: false,
        });

        if (insertError) {
          console.warn('[generateAIResponse] Failed to save AI message to DB:', insertError.message);
        }
      } catch (dbErr) {
        console.warn('[generateAIResponse] DB insert threw:', dbErr);
      }

      // Update cache
      await saveMessagesToCache(newMessages);
    } catch (err) {
      console.error('Error generating AI response:', err);

      // Add error message to chat
      const errorMessageId = randomUUID();
      const errorMessage: Message = {
        id: errorMessageId,
        text: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setAiLoading(false);
    }
  }

  async function sendMessage(text: string, isUser: boolean = true) {
    // Generate UUID client-side
    const messageId = randomUUID();
    const optimisticMessage: Message = {
      id: messageId,
      text,
      isUser,
    };

    // Add message to UI immediately (optimistic update)
    const updatedMessages = [...messages, optimisticMessage];
    setMessages(updatedMessages);

    // Always save to cache immediately — works offline
    await saveMessagesToCache(updatedMessages);

    // Try to persist to Supabase (non-blocking failure)
    try {
      const { error: insertError } = await supabase.from('messages').insert({
        id: messageId,
        text,
        is_user: isUser,
      });

      if (insertError) {
        console.warn('[sendMessage] Supabase insert error (message saved to cache):', insertError.message);
      }
    } catch (dbErr) {
      console.warn('[sendMessage] Supabase insert threw (message saved to cache):', dbErr);
    }

    // If user message, trigger AI response regardless of DB status
    if (isUser) {
      await generateAIResponse(updatedMessages);
    }
  }

  return { messages, loading, error, aiLoading, sendMessage, refetch: loadMessages };
}
