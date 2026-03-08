/**
 * Design tokens and theme configuration for the Orchestra app.
 * All colors, spacing, typography, and other design values are defined here.
 */

import { Platform } from 'react-native';

// Design tokens from UX spec
export const DesignTokens = {
  colors: {
    background: '#191A1F',
    chatBubble: '#1F222B',
    chatBubbleUser: '#6849FF',
    primary: '#6849FF',
    textPrimary: '#ECEDEE',
    textSecondary: '#9BA1A6',
  },
  iconColors: {
    yellow: '#F5A623',
    purple: '#6849FF',
    red: '#E74C3C',
    green: '#2ECC71',
    blue: '#3498DB',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 999,
  },
  typography: {
    title: {
      fontSize: 28,
      fontWeight: '600' as const,
    },
    subtitle: {
      fontSize: 16,
      fontWeight: '400' as const,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
    },
    label: {
      fontSize: 14,
      fontWeight: '400' as const,
    },
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
