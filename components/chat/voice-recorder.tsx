import { DesignTokens } from '@/constants/theme';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

type VoiceRecorderProps = {
  duration: number;
  onCancel: () => void;
  onSend: () => void;
};

export function VoiceRecorder({ duration, onCancel, onSend }: VoiceRecorderProps) {
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  // Pulsing animation for recording indicator
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [pulseAnim]);

  // Format duration as MM:SS
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Recording indicator */}
      <Animated.View
        style={[
          styles.recordingIndicator,
          { transform: [{ scale: pulseAnim }] },
        ]}
      />

      {/* Duration */}
      <Text style={styles.durationText}>{formatDuration(duration)}</Text>

      {/* Waveform placeholder (could be replaced with actual waveform) */}
      <View style={styles.waveformContainer}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <View
            key={i}
            style={[
              styles.waveformBar,
              { height: Math.random() * 20 + 10 },
            ]}
          />
        ))}
      </View>

      {/* Action buttons */}
      <View style={styles.buttonsContainer}>
        {/* Cancel button */}
        <TouchableOpacity
          style={[styles.actionButton, styles.cancelButton]}
          onPress={onCancel}
          activeOpacity={0.7}
        >
          <IconSymbol name="xmark" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Send button */}
        <TouchableOpacity
          style={[styles.actionButton, styles.sendButton]}
          onPress={onSend}
          activeOpacity={0.7}
        >
          <IconSymbol name="checkmark" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignTokens.colors.surface,
    padding: DesignTokens.spacing.md,
    borderRadius: DesignTokens.borderRadius.lg,
    gap: DesignTokens.spacing.md,
  },
  recordingIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444', // Red color for recording
  },
  durationText: {
    fontSize: DesignTokens.typography.body.fontSize,
    color: DesignTokens.colors.textPrimary,
    fontWeight: '600',
    minWidth: 50,
  },
  waveformContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    height: 30,
  },
  waveformBar: {
    width: 3,
    backgroundColor: DesignTokens.colors.primary,
    borderRadius: 1.5,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: DesignTokens.spacing.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6B7280', // Gray color
  },
  sendButton: {
    backgroundColor: DesignTokens.colors.primary,
  },
});
