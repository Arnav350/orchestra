import React, { useState } from 'react';
import { StyleSheet, ScrollView, Alert, TouchableOpacity, Pressable } from 'react-native';
import { Text, View } from '@/components/Themed';
import AudioRecorder from '@/components/AudioRecorder';
import { uploadAudioForSTT, parseIntent, executeIntent, textToSpeech, STTResponse, IntentResponse, ExecuteResponse } from '@/services/api';
import { Audio } from 'expo-av';

export default function VoiceAgentScreen() {
  const [isUploading, setIsUploading] = useState(false);
  const [transcribedText, setTranscribedText] = useState<string>('');
  const [intent, setIntent] = useState<IntentResponse | null>(null);
  const [executionResult, setExecutionResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handleAudioRecorded = async (audioUri: string) => {
    try {
      setIsUploading(true);
      setError('');
      setTranscribedText('');
      setIntent(null);
      setExecutionResult('');

      // Step 1: Speech to Text
      const sttResult: STTResponse = await uploadAudioForSTT(audioUri);
      
      if (!sttResult.success) {
        setError(sttResult.error || 'Failed to process audio');
        Alert.alert('Error', sttResult.error || 'Failed to process audio');
        return;
      }

      setTranscribedText(sttResult.text);

      // Step 2: Parse Intent
      const intentResult: IntentResponse = await parseIntent(sttResult.text);
      setIntent(intentResult);

      // Step 3: Execute Intent
      const executeResult: ExecuteResponse = await executeIntent(intentResult);
      setExecutionResult(executeResult.result);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unexpected error occurred';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const playResponseAudio = async () => {
    if (!executionResult || isPlayingAudio) return;

    try {
      setIsPlayingAudio(true);
      
      // Get TTS audio URL
      const audioUrl = await textToSpeech(executionResult);
      
      // Play the audio
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );
      
      // Clean up when finished
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlayingAudio(false);
          sound.unloadAsync();
        }
      });
      
    } catch (err) {
      setIsPlayingAudio(false);
      console.error('Error playing audio:', err);
      Alert.alert('Error', 'Failed to play audio response');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Voice Agent</Text>
      
      <Text style={styles.subtitle}>
        Press and hold the button to record your voice command
      </Text>

      <AudioRecorder 
        onAudioRecorded={handleAudioRecorded}
        isUploading={isUploading}
      />

      {transcribedText ? (
        <View style={styles.stepContainer}>
          <Text style={styles.stepLabel}>1. Speech to Text:</Text>
          <Text style={styles.stepText}>{transcribedText}</Text>
        </View>
      ) : null}

      {intent ? (
        <View style={styles.stepContainer}>
          <Text style={styles.stepLabel}>2. Intent Parsed:</Text>
          <Text style={styles.stepText}>Action: {intent.action}</Text>
          <Text style={styles.stepText}>Title: {intent.title}</Text>
          {intent.time && <Text style={styles.stepText}>Time: {intent.time}</Text>}
          <Text style={styles.stepText}>Details: {intent.details}</Text>
          <Text style={styles.stepText}>Confidence: {Math.round(intent.confidence * 100)}%</Text>
        </View>
      ) : null}

      {executionResult ? (
        <View style={styles.responseContainer}>
          <Text style={styles.responseLabel}>3. Result:</Text>
          <Text style={styles.responseText}>{executionResult}</Text>
          
          <TouchableOpacity 
            style={[styles.playButton, isPlayingAudio && styles.playButtonActive]} 
            onPress={playResponseAudio}
            disabled={isPlayingAudio}
          >
            <Text style={styles.playButtonText}>
              {isPlayingAudio ? '🔊 Playing...' : '🔊 Play Response'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorLabel}>Error:</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  stepContainer: {
    width: '100%',
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#0ea5e9',
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0ea5e9',
    marginBottom: 6,
  },
  stepText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
    marginBottom: 2,
  },
  responseContainer: {
    width: '100%',
    marginTop: 20,
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  responseLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 8,
  },
  responseText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 16,
  },
  playButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  playButtonActive: {
    backgroundColor: '#4f46e5',
  },
  playButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    width: '100%',
    marginTop: 30,
    padding: 20,
    backgroundColor: '#fff5f5',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
  },
  errorLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#721c24',
  },
});
