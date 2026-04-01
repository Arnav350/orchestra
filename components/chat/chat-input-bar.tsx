import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { IconSymbol, IconSymbolName } from '@/components/ui/icon-symbol';
import { DesignTokens } from '@/constants/theme';

type ChatInputBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  placeholder?: string;
  searchIcon?: IconSymbolName;
  sendIcon?: IconSymbolName;
  disabled?: boolean;
};

export function ChatInputBar({
  value,
  onChangeText,
  onSend,
  placeholder = 'Ask ai chat anything',
  searchIcon = 'magnifyingglass',
  sendIcon = 'paperplane.fill',
  disabled = false,
}: ChatInputBarProps) {
  return (
    <View style={styles.inputContainer}>
      <View style={styles.inputWrapper}>
        <IconSymbol
          name={searchIcon}
          size={20}
          color={DesignTokens.colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={DesignTokens.colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          multiline
          editable={!disabled}
        />
      </View>

      <TouchableOpacity
        style={[styles.sendButton, disabled && styles.sendButtonDisabled]}
        onPress={onSend}
        disabled={!value.trim() || disabled}
      >
        <IconSymbol name={sendIcon} size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingVertical: DesignTokens.spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignTokens.colors.chatBubble,
    borderRadius: DesignTokens.borderRadius.xl,
    paddingLeft: DesignTokens.spacing.lg,
    paddingRight: DesignTokens.spacing.lg,
    marginRight: DesignTokens.spacing.sm,
    minHeight: 48,
  },
  searchIcon: {
    marginRight: DesignTokens.spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: DesignTokens.typography.body.fontSize,
    color: DesignTokens.colors.textPrimary,
    maxHeight: 100,
    paddingVertical: DesignTokens.spacing.md,
    textAlignVertical: 'center',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: DesignTokens.borderRadius.full,
    backgroundColor: DesignTokens.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
