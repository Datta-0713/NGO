import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { Theme } from '../../constants/theme';
import { Header } from '../../components/common/Header';
import { Avatar } from '../../components/common/Avatar';
import { format } from 'date-fns';
import { feedApi } from '../../api/feedApi';
import type { NewsItem } from '../../types';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { toggleLike } from '../../store/slices/feedSlice';

export const NewsDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const currentUserId = useAppSelector(state => state.auth.user?._id || '');
  const { id } = route.params;

  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await feedApi.getNewsById(id);
        setNews(data?.news ?? null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleLike = () => {
    if (!news) return;
    dispatch(toggleLike(news._id));
    setNews(prev => {
      if (!prev) return prev;
      const userId = currentUserId;
      const alreadyLiked = prev.likes?.includes(userId);
      return {
        ...prev,
        likes: alreadyLiked
          ? prev.likes.filter((id: string) => id !== userId)
          : [...(prev.likes || []), userId],
      };
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error || !news) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || 'Not found'}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header showBack title="" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {news.media?.[0]?.url && (
          <Image source={{ uri: news.media[0].url }} style={styles.heroImage} resizeMode="cover" />
        )}
        
        <View style={styles.content}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{news.category}</Text>
          </View>
          
          <Text style={styles.title}>{news.title}</Text>
          
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>📍 {news.location}</Text>
            <Text style={styles.metaText}>📅 {format(new Date(news.createdAt), 'MMM d, yyyy')}</Text>
          </View>

          <View style={styles.authorSection}>
            <Avatar url={(news.submittedBy as any)?.profilePhoto} name={(news.submittedBy as any)?.name || 'NGO Team'} size={48} />
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{(news.submittedBy as any)?.name || 'NGO Team'}</Text>
              <View style={styles.contributorBadge}>
                <Text style={styles.contributorBadgeText}>Contributor • {(news.submittedBy as any)?.credits || 0} Credits</Text>
              </View>
            </View>
          </View>

          <Text style={styles.description}>{news.description}</Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.likeButton} onPress={handleLike}>
          <Text style={styles.likeIcon}>{(news.likes?.includes(currentUserId) ?? false) ? '❤️' : '🤍'}</Text>
          <Text style={[styles.likeCount, (news.likes?.includes(currentUserId) ?? false) && styles.likedText]}>{news.likes?.length || 0}</Text>
        </TouchableOpacity>
        <Text style={styles.viewsCount}>👁️ {news.views} views</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  errorText: {
    color: Colors.error,
    fontSize: Theme.typography.size.lg,
    marginBottom: Theme.spacing.md,
  },
  backText: {
    color: Colors.primary,
    fontSize: Theme.typography.size.md,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingBottom: 80, // Space for bottom bar
  },
  heroImage: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: Theme.spacing.lg,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryXLight,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.full,
    marginBottom: Theme.spacing.md,
  },
  badgeText: {
    color: Colors.primary,
    fontSize: Theme.typography.size.xs,
    fontWeight: Theme.typography.weight.bold,
  },
  title: {
    fontSize: Theme.typography.size.xxl,
    fontWeight: Theme.typography.weight.bold,
    color: Colors.textPrimary,
    marginBottom: Theme.spacing.md,
    lineHeight: 32,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  metaText: {
    fontSize: Theme.typography.size.sm,
    color: Colors.textMuted,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.md,
    backgroundColor: Colors.backgroundGray,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.xl,
  },
  authorInfo: {
    marginLeft: Theme.spacing.md,
  },
  authorName: {
    fontSize: Theme.typography.size.md,
    fontWeight: Theme.typography.weight.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  contributorBadge: {
    backgroundColor: Colors.accentLight,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.sm,
  },
  contributorBadgeText: {
    color: Colors.accent,
    fontSize: Theme.typography.size.xs,
    fontWeight: Theme.typography.weight.semibold,
  },
  description: {
    fontSize: Theme.typography.size.lg,
    color: Colors.textSecondary,
    lineHeight: 28,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.xl,
    paddingBottom: Theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    ...Theme.shadows.md,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundGray,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.full,
  },
  likeIcon: {
    fontSize: 24,
    marginRight: Theme.spacing.sm,
  },
  likeCount: {
    fontSize: Theme.typography.size.lg,
    fontWeight: Theme.typography.weight.bold,
    color: Colors.textPrimary,
  },
  likedText: {
    color: Colors.heartRed,
  },
  viewsCount: {
    fontSize: Theme.typography.size.md,
    color: Colors.textMuted,
    fontWeight: Theme.typography.weight.medium,
  },
});
