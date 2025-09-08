import React, { useState, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

interface AudioRecorderProps {
  onAudioRecorded: (audioUri: string) => void;
  isUploading: boolean;
}

export default function AudioRecorder({ onAudioRecorded, isUploading }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingPermission, setRecordingPermission] = useState<boolean | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);

  const requestPermission = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      setRecordingPermission(status === 'granted');
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting audio permission:', error);
      Alert.alert('Error', 'Failed to request audio permission');
      return false;
    }
  };

  const startRecording = async () => {
    try {
      // Request permission if not already granted
      if (recordingPermission === null) {
        const hasPermission = await requestPermission();
        if (!hasPermission) return;
      } else if (!recordingPermission) {
        Alert.alert('Permission Required', 'Please grant microphone permission to record audio');
        return;
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      recordingRef.current = recording;
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    try {
      if (!recordingRef.current) return;

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      
      setIsRecording(false);
      recordingRef.current = null;

      if (uri) {
        onAudioRecorded(uri);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Error', 'Failed to stop recording');
      setIsRecording(false);
    }
  };

  const handlePressIn = () => {
    if (!isUploading) {
      startRecording();
    }
  };

  const handlePressOut = () => {
    if (isRecording) {
      stopRecording();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instructions}>
        {isUploading 
          ? 'Processing...' 
          : isRecording 
            ? 'Recording... Release to send'
            : 'Hold to record'
        }
      </Text>
      
      <Pressable
        style={[
          styles.recordButton,
          isRecording && styles.recordButtonActive,
          isUploading && styles.recordButtonDisabled
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isUploading}
      >
        <View style={[
          styles.recordButtonInner,
          isRecording && styles.recordButtonInnerActive
        ]} />
      </Pressable>
      
      <Text style={styles.status}>
        {isRecording ? 'Recording...' : isUploading ? 'Uploading...' : 'Ready'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  instructions: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  recordButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  recordButtonActive: {
    backgroundColor: '#cc2222',
    transform: [{ scale: 1.1 }],
  },
  recordButtonDisabled: {
    backgroundColor: '#ccc',
  },
  recordButtonInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
  },
  recordButtonInnerActive: {
    borderRadius: 8,
    width: 40,
    height: 40,
  },
  status: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
});