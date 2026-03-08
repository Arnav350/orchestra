import { DesignTokens } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

type ChatMessageProps = {
  id: string;
  text: string;
  isUser: boolean;
  onSpeak?: (text: string, messageId: string) => void;
  onStopSpeaking?: () => void;
  isSpeaking?: boolean;
};

export function ChatMessage({
  id,
  text,
  isUser,
  onSpeak,
  onStopSpeaking,
  isSpeaking = false
}: ChatMessageProps) {
  const handleSpeakerPress = () => {
    if (isSpeaking) {
      onStopSpeaking?.();
    } else {
      onSpeak?.(text, id);
    }
  };

  return (
    <View
      key={id}
      style={[
        styles.messageRow,
        isUser ? styles.messageRowUser : styles.messageRowBot,
      ]}
    >
      <View style={[styles.messageBubble, isUser && styles.messageBubbleUser]}>
        <Text style={styles.messageText}>{text}</Text>

        {/* Speaker button for AI messages only */}
        {!isUser && (
          <TouchableOpacity
            style={styles.speakerButton}
            onPress={handleSpeakerPress}
            activeOpacity={0.7}
          >
            <IconSymbol
              name={isSpeaking ? 'speaker.wave.3.fill' : 'speaker.wave.2'}
              size={16}
              color={isSpeaking ? DesignTokens.colors.primary : DesignTokens.colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  messageRow: {
    flexDirection: 'row',
    marginBottom: DesignTokens.spacing.md,
  },
  messageRowBot: {
    justifyContent: 'flex-start',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    backgroundColor: DesignTokens.colors.chatBubble,
    borderRadius: DesignTokens.borderRadius.lg,
    paddingVertical: DesignTokens.spacing.sm,
    paddingHorizontal: DesignTokens.spacing.md,
    maxWidth: '85%',
  },
  messageBubbleUser: {
    backgroundColor: DesignTokens.colors.chatBubbleUser,
  },
  messageText: {
    fontSize: DesignTokens.typography.body.fontSize,
    color: DesignTokens.colors.textPrimary,
    lineHeight: 22,
  },
  speakerButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    padding: 4,
    borderRadius: DesignTokens.borderRadius.sm,
  },
});
