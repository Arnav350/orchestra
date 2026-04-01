import { DesignTokens } from '@/constants/theme';
import { ChatHeader } from '@/components/ui/chat-header';
import { ChatMessage } from '@/components/chat/chat-message';
import { ChatInputBar } from '@/components/chat/chat-input-bar';
import { useChatMessages } from '@/hooks/useChatMessages';
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
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const latestAiMessageIdRef = useRef<string | null>(null);

  // Track the latest AI message for typing animation
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && !lastMsg.isUser) {
      latestAiMessageIdRef.current = lastMsg.id;
    }
  }, [messages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = async () => {
    if (inputText.trim()) {
      try {
        setInputText('');
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
                animate={!message.isUser && message.id === latestAiMessageIdRef.current}
              />
            ))}

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
