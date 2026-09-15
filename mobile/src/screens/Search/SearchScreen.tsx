import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Theme } from '../../constants/theme';
import { Config } from '../../constants/config';
import { feedApi } from '../../api/feedApi';
import type { NewsItem } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import { CategoryChip } from '../../components/news/CategoryChip';
import { EmptyState } from '../../components/common/EmptyState';

export const SearchScreen = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();

  const categoryIcons: Record<string, string> = {
    Community: '👥',
    Education: '📚',
    Environment: '🌱',
    Health: '🏥',
    Events: '📅'
  };

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.length > 2) {
      setLoading(true);
      try {
        const response = await feedApi.getFeed({ page: 1, limit: 20, search: text });
        setResults(response.news);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    } else {
      setResults([]);
    }
  };

  const handleCategoryPress = async (category: string) => {
    setQuery(category);
    setLoading(true);
    try {
      const response = await feedApi.getFeed({ page: 1, limit: 20, category });
      setResults(response.news);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderResultItem = ({ item }: { item: NewsItem }) => (
    <TouchableOpacity 
      style={styles.resultItem}
      onPress={() => navigation.navigate('NewsDetail', { id: item._id })}
    >
      {item.media?.[0]?.url ? (
        <Image source={{ uri: item.media[0].url }} style={styles.thumbnail} />
      ) : (
        <View style={[styles.thumbnail, styles.thumbnailPlaceholder]} />
      )}
      <View style={styles.resultContent}>
        <Text style={styles.resultTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.resultMeta}>
          {item.location} • {(item.submittedBy as any)?.name || 'NGO Team'}
        </Text>
        <Text style={styles.resultTime}>
          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
        </Text>
      </View>
      <Text style={styles.bookmarkIcon}>🔖</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search stories, people, or places..."
            value={query}
            onChangeText={handleSearch}
            placeholderTextColor={Colors.textMuted}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {query.length === 0 ? (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.sectionTitle}>Suggested Topics</Text>
          <View style={styles.chipGrid}>
            {Config.CATEGORIES.map(cat => (
              <CategoryChip 
                key={cat} 
                label={cat} 
                icon={categoryIcons[cat]} 
                onPress={() => handleCategoryPress(cat)} 
              />
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => item._id}
          renderItem={renderResultItem}
          contentContainerStyle={styles.resultsList}
          ListEmptyComponent={
            !loading && query.length > 2 ? (
              <EmptyState title="No results found" description="Try a different search term" emoji="🔍" />
            ) : null
          }
          ListHeaderComponent={
            results.length > 0 ? (
              <View style={styles.resultsHeader}>
                <Text style={styles.sectionTitle}>News Results</Text>
                <Text style={styles.sortText}>Sort: Newest ▼</Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    padding: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundGray,
    borderRadius: Theme.borderRadius.full,
    paddingHorizontal: Theme.spacing.md,
    height: 48,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: Theme.spacing.sm,
    color: Colors.textMuted,
  },
  searchInput: {
    flex: 1,
    fontSize: Theme.typography.size.md,
    color: Colors.textPrimary,
  },
  clearIcon: {
    fontSize: 16,
    color: Colors.textMuted,
    padding: Theme.spacing.xs,
  },
  suggestionsContainer: {
    padding: Theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: Theme.typography.size.lg,
    fontWeight: Theme.typography.weight.bold,
    color: Colors.textPrimary,
    marginBottom: Theme.spacing.md,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  resultsList: {
    flexGrow: 1,
    padding: Theme.spacing.md,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.sm,
  },
  sortText: {
    fontSize: Theme.typography.size.sm,
    color: Colors.primary,
    fontWeight: Theme.typography.weight.medium,
  },
  resultItem: {
    flexDirection: 'row',
    padding: Theme.spacing.md,
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'center',
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: Theme.borderRadius.sm,
    marginRight: Theme.spacing.md,
  },
  thumbnailPlaceholder: {
    backgroundColor: Colors.backgroundGray,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: Theme.typography.size.md,
    fontWeight: Theme.typography.weight.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  resultMeta: {
    fontSize: Theme.typography.size.sm,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  resultTime: {
    fontSize: Theme.typography.size.xs,
    color: Colors.textLight,
  },
  bookmarkIcon: {
    fontSize: 20,
    color: Colors.textLight,
    padding: Theme.spacing.xs,
  },
});
