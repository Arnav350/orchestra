import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { DesignTokens } from '@/constants/theme';

type ChatHeaderProps = {
  title: string;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  leftIcon?: string;
  rightIcon?: string;
};

export function ChatHeader({
  title,
  onLeftPress,
  onRightPress,
  leftIcon = 'xmark',
  rightIcon = 'ellipsis',
}: ChatHeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.headerButton} onPress={onLeftPress}>
        <IconSymbol name={leftIcon} size={24} color={DesignTokens.colors.textPrimary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <TouchableOpacity style={styles.headerButton} onPress={onRightPress}>
        <IconSymbol name={rightIcon} size={24} color={DesignTokens.colors.textPrimary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingVertical: DesignTokens.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: DesignTokens.colors.textPrimary,
  },
});
