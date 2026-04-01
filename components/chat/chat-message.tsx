import { DesignTokens } from '@/constants/theme';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const TYPING_INTERVAL_MS = 16;
const CHARS_PER_TICK = 2;

type ChatMessageProps = {
  id: string;
  text: string;
  isUser: boolean;
  animate?: boolean;
};

export function ChatMessage({ id, text, isUser, animate = false }: ChatMessageProps) {
  const [displayed, setDisplayed] = useState(animate ? '' : text);

  useEffect(() => {
    if (!animate) {
      setDisplayed(text);
      return;
    }

    setDisplayed('');
    let i = 0;
    const interval = setInterval(() => {
      i = Math.min(i + CHARS_PER_TICK, text.length);
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, TYPING_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [text, animate]);

  return (
    <View
      key={id}
      style={[
        styles.messageRow,
        isUser ? styles.messageRowUser : styles.messageRowBot,
      ]}
    >
      <View style={[styles.messageBubble, isUser && styles.messageBubbleUser]}>
        <Text style={styles.messageText}>{displayed}</Text>
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
});
