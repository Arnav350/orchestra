import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { DesignTokens } from '@/constants/theme';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  style?: ViewStyle;
};

export function ScreenHeader({ title, subtitle, style }: ScreenHeaderProps) {
  return (
    <View style={[styles.header, style]}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: DesignTokens.spacing.xxl,
  },
  title: {
    fontSize: DesignTokens.typography.title.fontSize,
    fontWeight: DesignTokens.typography.title.fontWeight,
    color: DesignTokens.colors.textPrimary,
    marginBottom: DesignTokens.spacing.xs,
  },
  subtitle: {
    fontSize: DesignTokens.typography.subtitle.fontSize,
    fontWeight: DesignTokens.typography.subtitle.fontWeight,
    color: DesignTokens.colors.textSecondary,
  },
});
