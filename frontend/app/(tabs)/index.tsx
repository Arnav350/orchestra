import React, { useState } from 'react';
import { StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import AudioRecorder from '@/components/AudioRecorder';
import { uploadAudioForSTT, STTResponse } from '@/services/api';

export default function VoiceAgentScreen() {
  const [isUploading, setIsUploading] = useState(false);
  const [responseText, setResponseText] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleAudioRecorded = async (audioUri: string) => {
    try {
      setIsUploading(true);
      setError('');
      setResponseText('');

      const result: STTResponse = await uploadAudioForSTT(audioUri);
      
      if (result.success) {
        setResponseText(result.text);
      } else {
        setError(result.error || 'Failed to process audio');
        Alert.alert('Error', result.error || 'Failed to process audio');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unexpected error occurred';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsUploading(false);
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

      {responseText ? (
        <View style={styles.responseContainer}>
          <Text style={styles.responseLabel}>Response:</Text>
          <Text style={styles.responseText}>{responseText}</Text>
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
  responseContainer: {
    width: '100%',
    marginTop: 30,
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
