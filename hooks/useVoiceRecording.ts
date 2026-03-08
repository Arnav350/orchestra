import { useState, useCallback, useRef } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { supabase } from '@/lib/supabase';

export function useVoiceRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcribedText, setTranscribedText] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        setError('Microphone permission denied');
        return false;
      }
      return true;
    } catch (err) {
      console.error('Permission error:', err);
      setError('Failed to request microphone permission');
      return false;
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setTranscribedText(null);
      setDuration(0);

      // Request permissions
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      // Set audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Create and start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setIsRecording(true);

      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Failed to start recording');
      setIsRecording(false);
    }
  }, [requestPermissions]);

  const stopRecording = useCallback(async (): Promise<void> => {
    try {
      if (!recordingRef.current) {
        return;
      }

      setIsRecording(false);

      // Stop duration timer
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      // Stop recording
      await recordingRef.current.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      if (!uri) {
        throw new Error('No recording URI found');
      }

      // Transcribe the audio
      await transcribeAudio(uri);

    } catch (err) {
      console.error('Failed to stop recording:', err);
      setError('Failed to stop recording');
    }
  }, []);

  const cancelRecording = useCallback(async () => {
    try {
      if (!recordingRef.current) {
        return;
      }

      setIsRecording(false);
      setDuration(0);
      setTranscribedText(null);

      // Stop duration timer
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      // Stop and delete recording
      await recordingRef.current.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      recordingRef.current = null;

    } catch (err) {
      console.error('Failed to cancel recording:', err);
    }
  }, []);

  const transcribeAudio = async (uri: string) => {
    try {
      setIsTranscribing(true);
      setError(null);

      // Read audio file as base64
      const base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Determine format based on URI extension
      const format = uri.endsWith('.m4a') ? 'm4a' : 'webm';

      // Call Whisper Edge Function
      const { data, error: apiError } = await supabase.functions.invoke('speech-to-text', {
        body: {
          audio: base64Audio,
          format,
        },
      });

      if (apiError) {
        throw new Error(apiError.message || 'Transcription failed');
      }

      if (!data.success) {
        throw new Error(data.error || 'Transcription failed');
      }

      setTranscribedText(data.text);

    } catch (err) {
      console.error('Transcription error:', err);
      setError(err instanceof Error ? err.message : 'Transcription failed');
    } finally {
      setIsTranscribing(false);
    }
  };

  return {
    isRecording,
    duration,
    transcribedText,
    isTranscribing,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
    clearTranscription: () => setTranscribedText(null),
  };
}
