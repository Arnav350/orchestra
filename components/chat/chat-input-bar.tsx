import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { DesignTokens } from '@/constants/theme';
import { VoiceRecorder } from './voice-recorder';

type ChatInputBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  placeholder?: string;
  searchIcon?: string;
  sendIcon?: string;
  disabled?: boolean;
  // Voice recording props
  isRecording?: boolean;
  isTranscribing?: boolean;
  recordingDuration?: number;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  onCancelRecording?: () => void;
};

export function ChatInputBar({
  value,
  onChangeText,
  onSend,
  placeholder = 'Ask ai chat anything',
  searchIcon = 'magnifyingglass',
  sendIcon = 'paperplane.fill',
  disabled = false,
  isRecording = false,
  isTranscribing = false,
  recordingDuration = 0,
  onStartRecording,
  onStopRecording,
  onCancelRecording,
}: ChatInputBarProps) {
  // Show voice recorder UI when recording
  if (isRecording && onStopRecording && onCancelRecording) {
    return (
      <View style={styles.inputContainer}>
        <VoiceRecorder
          duration={recordingDuration}
          onCancel={onCancelRecording}
          onSend={onStopRecording}
        />
      </View>
    );
  }

  // Show loading state when transcribing
  if (isTranscribing) {
    return (
      <View style={styles.inputContainer}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={DesignTokens.colors.primary} />
        </View>
      </View>
    );
  }

  // Normal input state
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

      {/* Microphone button (only show if onStartRecording is provided) */}
      {onStartRecording && (
        <TouchableOpacity
          style={[styles.micButton, disabled && styles.sendButtonDisabled]}
          onPress={onStartRecording}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <IconSymbol name="mic.fill" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {/* Send button */}
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
  micButton: {
    width: 48,
    height: 48,
    borderRadius: DesignTokens.borderRadius.full,
    backgroundColor: DesignTokens.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DesignTokens.spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DesignTokens.colors.chatBubble,
    borderRadius: DesignTokens.borderRadius.xl,
    paddingVertical: DesignTokens.spacing.md,
  },
});
