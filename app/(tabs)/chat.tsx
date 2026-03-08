import { DesignTokens } from '@/constants/theme';
import { ChatHeader } from '@/components/ui/chat-header';
import { ChatMessage } from '@/components/chat/chat-message';
import { ChatInputBar } from '@/components/chat/chat-input-bar';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import React, { useState, useRef, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  View,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatScreen() {
  const { messages, loading, error, aiLoading, sendMessage } = useChatMessages();
  const { speak, stop, currentSpeakingId } = useTextToSpeech();
  const {
    isRecording,
    duration,
    transcribedText,
    isTranscribing,
    error: recordingError,
    startRecording,
    stopRecording,
    cancelRecording,
    clearTranscription,
  } = useVoiceRecording();

  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const lastPlayedMessageIdRef = useRef<string | null>(null);
  const previousMessageCountRef = useRef(0);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // Auto-play AI responses (only for newly added messages, not on initial load)
  useEffect(() => {
    // Only auto-play if messages were actually added (not initial load or cache restore)
    const isNewMessage = messages.length > previousMessageCountRef.current;
    previousMessageCountRef.current = messages.length;

    if (isNewMessage && messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      // Auto-play if:
      // 1. It's an AI message (not user message)
      // 2. We haven't already played this message
      // 3. Nothing is currently speaking
      if (
        !latestMessage.isUser &&
        latestMessage.id !== lastPlayedMessageIdRef.current &&
        !currentSpeakingId
      ) {
        lastPlayedMessageIdRef.current = latestMessage.id;
        speak(latestMessage.text, latestMessage.id);
      }
    }
  }, [messages, speak, currentSpeakingId]);

  // Auto-populate input with transcribed text
  useEffect(() => {
    if (transcribedText) {
      setInputText(transcribedText);
      clearTranscription();
    }
  }, [transcribedText, clearTranscription]);

  // Show recording error if any
  useEffect(() => {
    if (recordingError) {
      console.error('Recording error:', recordingError);
    }
  }, [recordingError]);

  const handleSend = async () => {
    if (inputText.trim()) {
      try {
        setInputText(''); // Clear input immediately for better UX
        await sendMessage(inputText.trim(), true);
      } catch (err) {
        console.error('Failed to send message:', err);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ChatHeader title="Chat AI" />

        {/* Messages Area */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={DesignTokens.colors.primary} />
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {error}</Text>
          </View>
        )}

        {!loading && !error && (
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map(message => (
              <ChatMessage
                key={message.id}
                id={message.id}
                text={message.text}
                isUser={message.isUser}
                onSpeak={speak}
                onStopSpeaking={stop}
                isSpeaking={currentSpeakingId === message.id}
              />
            ))}

            {/* AI Typing Indicator */}
            {aiLoading && (
              <View style={styles.typingIndicator}>
                <ActivityIndicator size="small" color={DesignTokens.colors.textSecondary} />
                <Text style={styles.typingText}>AI is thinking...</Text>
              </View>
            )}
          </ScrollView>
        )}

        <ChatInputBar
          value={inputText}
          onChangeText={setInputText}
          onSend={handleSend}
          disabled={aiLoading}
          isRecording={isRecording}
          isTranscribing={isTranscribing}
          recordingDuration={duration}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
          onCancelRecording={cancelRecording}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: DesignTokens.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: DesignTokens.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: DesignTokens.spacing.lg,
  },
  errorText: {
    color: 'red',
    fontSize: DesignTokens.typography.body.fontSize,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: DesignTokens.spacing.lg,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: DesignTokens.spacing.sm,
    paddingHorizontal: DesignTokens.spacing.md,
  },
  typingText: {
    marginLeft: DesignTokens.spacing.sm,
    fontSize: DesignTokens.typography.label.fontSize,
    color: DesignTokens.colors.textSecondary,
    fontStyle: 'italic',
  },
});
