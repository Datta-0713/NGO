import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Theme } from '../../constants/theme';

interface EmptyStateProps {
  emoji?: string;
  title: string;
  description?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ emoji = '📭', title, description }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xxxl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: Theme.spacing.lg,
  },
  title: {
    fontSize: Theme.typography.size.xl,
    fontWeight: Theme.typography.weight.semibold,
    color: Colors.textPrimary,
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: Theme.typography.size.md,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
