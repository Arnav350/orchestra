import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { DesignTokens } from '@/constants/theme';
import { IconSymbol } from './icon-symbol';

export type ListRowProps = {
  icon: string;
  iconColor: string;
  label: string;
  onPress?: () => void;
};

export function ListRow({ icon, iconColor, label, onPress }: ListRowProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
        <IconSymbol name={icon} size={20} color="#FFFFFF" />
      </View>
      <Text style={styles.label}>{label}</Text>
      <IconSymbol name="chevron.right" size={20} color={DesignTokens.colors.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: DesignTokens.spacing.lg,
    paddingHorizontal: DesignTokens.spacing.lg,
    backgroundColor: DesignTokens.colors.chatBubble,
    marginBottom: DesignTokens.spacing.sm,
    borderRadius: DesignTokens.borderRadius.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: DesignTokens.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DesignTokens.spacing.md,
  },
  label: {
    flex: 1,
    fontSize: DesignTokens.typography.body.fontSize,
    fontWeight: DesignTokens.typography.body.fontWeight,
    color: DesignTokens.colors.textPrimary,
  },
});