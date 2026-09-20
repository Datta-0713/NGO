import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import { Theme } from '../../constants/theme';

interface EmptyStateProps {
  emoji?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ emoji = '📭', title, description, actionLabel, onActionPress }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {actionLabel && onActionPress && (
        <TouchableOpacity style={styles.actionButton} onPress={onActionPress} activeOpacity={0.8}>
          <Text style={styles.actionButtonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
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
    marginBottom: Theme.spacing.lg,
  },
  actionButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: Theme.typography.size.md,
    fontWeight: Theme.typography.weight.semibold,
  },
});
