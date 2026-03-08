import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = '@orchestra_messages_cache';
const MAX_CACHED_MESSAGES = 200;

export type CachedMessage = {
  id: string;
  text: string;
  isUser: boolean;
};

/**
 * Load messages from AsyncStorage cache
 * Returns empty array if cache doesn't exist or fails
 */
export async function loadMessagesFromCache(): Promise<CachedMessage[]> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (!cached) return [];

    const messages = JSON.parse(cached) as CachedMessage[];
    return messages;
  } catch (error) {
    console.error('Failed to load messages from cache:', error);
    return [];
  }
}

/**
 * Save messages to AsyncStorage cache
 * Automatically prunes to last MAX_CACHED_MESSAGES
 */
export async function saveMessagesToCache(messages: CachedMessage[]): Promise<void> {
  try {
    // Keep only the most recent messages to stay under size limits
    const messagesToCache = messages.slice(-MAX_CACHED_MESSAGES);

    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(messagesToCache));
  } catch (error) {
    console.error('Failed to save messages to cache:', error);
    // Don't throw - cache failures shouldn't break the app
  }
}

/**
 * Clear the message cache
 * Useful for debugging or logout scenarios
 */
export async function clearMessageCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error('Failed to clear message cache:', error);
  }
}
