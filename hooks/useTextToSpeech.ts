import { useState, useCallback, useEffect } from 'react';
import * as Speech from 'expo-speech';

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeakingId, setCurrentSpeakingId] = useState<string | null>(null);

  useEffect(() => {
    // Cleanup: stop speech when component unmounts
    return () => {
      Speech.stop();
    };
  }, []);

  const speak = useCallback(async (text: string, messageId: string) => {
    try {
      // Stop any ongoing speech first
      await Speech.stop();

      setIsSpeaking(true);
      setCurrentSpeakingId(messageId);

      Speech.speak(text, {
        rate: 1.0, // Normal speed
        pitch: 1.0, // Normal pitch
        language: 'en-US', // Can be made configurable
        onDone: () => {
          setIsSpeaking(false);
          setCurrentSpeakingId(null);
        },
        onStopped: () => {
          setIsSpeaking(false);
          setCurrentSpeakingId(null);
        },
        onError: (error) => {
          console.error('TTS error:', error);
          setIsSpeaking(false);
          setCurrentSpeakingId(null);
        },
      });
    } catch (error) {
      console.error('Failed to start speech:', error);
      setIsSpeaking(false);
      setCurrentSpeakingId(null);
    }
  }, []);

  const stop = useCallback(async () => {
    try {
      await Speech.stop();
      setIsSpeaking(false);
      setCurrentSpeakingId(null);
    } catch (error) {
      console.error('Failed to stop speech:', error);
    }
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    currentSpeakingId,
  };
}
