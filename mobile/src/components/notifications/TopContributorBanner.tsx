import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import { Theme } from '../../constants/theme';
import type { ContributorHighlight } from '../../types';

interface TopContributorBannerProps {
  highlight: ContributorHighlight;
}

export const TopContributorBanner: React.FC<TopContributorBannerProps> = ({ highlight }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <View style={styles.banner}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🏆</Text>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Top Contributor!</Text>
          <Text style={styles.subtitle}>
            🎉 <Text style={styles.bold}>{highlight.user?.name || 'A contributor'}</Text> was this {highlight.period === 'weekly' ? 'week' : 'month'}'s top contributor with {highlight.count} stories!
          </Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => setIsVisible(false)} style={styles.closeButton}>
        <Text style={styles.closeIcon}>✕</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: Colors.accent,
    margin: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    ...Theme.shadows.md,
  },
  content: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 32,
    marginRight: Theme.spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: Colors.white,
    fontWeight: Theme.typography.weight.bold,
    fontSize: Theme.typography.size.md,
    marginBottom: 4,
  },
  subtitle: {
    color: Colors.white,
    fontSize: Theme.typography.size.sm,
    opacity: 0.9,
    lineHeight: 20,
  },
  bold: {
    fontWeight: Theme.typography.weight.bold,
  },
  closeButton: {
    padding: Theme.spacing.xs,
    marginLeft: Theme.spacing.sm,
  },
  closeIcon: {
    color: Colors.white,
    fontSize: 16,
    opacity: 0.8,
  },
});
