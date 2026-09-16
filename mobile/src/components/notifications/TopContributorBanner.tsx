import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import type { ContributorHighlight } from '../../types';

interface TopContributorBannerProps {
  highlight: ContributorHighlight;
}

export const TopContributorBanner: React.FC<TopContributorBannerProps> = ({ highlight }) => {
  const [isVisible, setIsVisible] = useState(true);
  if (!isVisible) return null;

  return (
    <View style={styles.banner}>
      <View style={styles.iconWrap}>
        <Ionicons name="trophy" size={24} color="#FCD34D" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Top Contributor!</Text>
        <Text style={styles.subtitle}>
          <Text style={styles.bold}>{highlight.user?.name || 'A contributor'}</Text>
          {' '}was this {highlight.period === 'weekly' ? 'week' : 'month'}'s top contributor with{' '}
          <Text style={styles.bold}>{highlight.count} stories</Text>!
        </Text>
      </View>
      <TouchableOpacity onPress={() => setIsVisible(false)} style={styles.closeButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="close" size={18} color="rgba(255,255,255,0.8)" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: Colors.accent,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  textContainer: { flex: 1 },
  title: { color: '#fff', fontWeight: '700', fontSize: 14, marginBottom: 3 },
  subtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 13, lineHeight: 18 },
  bold: { fontWeight: '700' },
  closeButton: { padding: 4, flexShrink: 0 },
});
