import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DesignTokens } from '@/constants/theme';
import { ListRow } from '@/components/ui/list-row';
import { ScreenHeader } from '@/components/ui/screen-header';

export default function SupportScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <ScreenHeader title="Chat AI" subtitle="Support" />

        {/* Primary List */}
        <View style={styles.section}>
          <ListRow
            icon="dollarsign.circle.fill"
            iconColor={DesignTokens.iconColors.yellow}
            label="Restore Purchase"
            onPress={() => console.log('Restore Purchase pressed')}
          />
          <ListRow
            icon="info.circle.fill"
            iconColor={DesignTokens.iconColors.purple}
            label="About us"
            onPress={() => console.log('About us pressed')}
          />
          <ListRow
            icon="lock.shield.fill"
            iconColor={DesignTokens.iconColors.red}
            label="Privacy Policy"
            onPress={() => console.log('Privacy Policy pressed')}
          />
          <ListRow
            icon="doc.text.fill"
            iconColor={DesignTokens.iconColors.green}
            label="Term of use"
            onPress={() => console.log('Term of use pressed')}
          />
          <ListRow
            icon="globe"
            iconColor={DesignTokens.iconColors.blue}
            label="Language"
            onPress={() => console.log('Language pressed')}
          />
        </View>

        {/* Section Label */}
        <Text style={styles.sectionLabel}>Stay in touch</Text>

        {/* Secondary List */}
        <View style={styles.section}>
          <ListRow
            icon="star.fill"
            iconColor={DesignTokens.iconColors.yellow}
            label="Rate App"
            onPress={() => console.log('Rate App pressed')}
          />
          <ListRow
            icon="paperplane.fill"
            iconColor={DesignTokens.iconColors.purple}
            label="Send Feedback"
            onPress={() => console.log('Send Feedback pressed')}
          />
        </View>
      </ScrollView>
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
  contentContainer: {
    padding: DesignTokens.spacing.lg,
  },
  section: {
    marginBottom: DesignTokens.spacing.lg,
  },
  sectionLabel: {
    fontSize: DesignTokens.typography.label.fontSize,
    fontWeight: DesignTokens.typography.label.fontWeight,
    color: DesignTokens.colors.textSecondary,
    marginBottom: DesignTokens.spacing.md,
    marginLeft: DesignTokens.spacing.xs,
  },
});
