import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import { Theme } from '../../constants/theme';
import { Avatar } from '../common/Avatar';
import type { NewsItem } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../navigation/AppStack';
import { useAppSelector } from '../../hooks/useAppSelector';

interface NewsCardProps {
  item: NewsItem;
  onLike?: () => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({ item, onLike }) => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const currentUserId = useAppSelector(state => state.auth.user?._id || '');

  const timeAgo = formatDistanceToNow(new Date(item.createdAt), { addSuffix: true });
  const firstMedia = item.media?.[0];
  const isLiked = item.likes?.includes(currentUserId) ?? false;
  const likesCount = item.likes?.length ?? 0;
  const author = item.submittedBy;

  const handlePress = () => {
    navigation.navigate('NewsDetail', { id: item._id });
  };

  return (
    <View style={styles.card}>
      {/* Author header */}
      <View style={styles.header}>
        <View style={styles.authorInfo}>
          <Avatar
            url={author?.profilePhoto || ''}
            name={author?.name || 'NGO Team'}
            size={40}
          />
          <View style={styles.authorText}>
            <Text style={styles.authorName}>{author?.name || 'NEXY Foundation'}</Text>
            <Text style={styles.locationTime}>
              📍 {item.location} • {timeAgo}
            </Text>
          </View>
        </View>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      </View>

      {/* Content */}
      <TouchableOpacity activeOpacity={0.8} onPress={handlePress}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        {firstMedia?.url && (
          <Image
            source={{ uri: firstMedia.url }}
            style={[styles.media, firstMedia.type === 'video' && styles.videoMedia]}
            resizeMode="cover"
          />
        )}
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.likeButton} onPress={onLike}>
          <Text style={styles.likeIcon}>{isLiked ? '❤️' : '🤍'}</Text>
          <Text style={[styles.likeCount, isLiked && styles.likedText]}>
            {likesCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handlePress} style={styles.viewMoreBtn}>
          <Text style={styles.viewMore}>Read more →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
    ...Theme.shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorText: {
    marginLeft: Theme.spacing.md,
    flex: 1,
  },
  authorName: {
    fontSize: Theme.typography.size.md,
    fontWeight: Theme.typography.weight.semibold,
    color: Colors.textPrimary,
  },
  locationTime: {
    fontSize: Theme.typography.size.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  categoryBadge: {
    backgroundColor: Colors.primaryXLight,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: Theme.borderRadius.full,
    marginLeft: Theme.spacing.sm,
  },
  categoryText: {
    fontSize: Theme.typography.size.xs,
    fontWeight: Theme.typography.weight.semibold,
    color: Colors.primary,
  },
  title: {
    fontSize: Theme.typography.size.lg,
    fontWeight: Theme.typography.weight.bold,
    color: Colors.textPrimary,
    marginBottom: Theme.spacing.xs,
    lineHeight: 24,
  },
  description: {
    fontSize: Theme.typography.size.md,
    color: Colors.textSecondary,
    marginBottom: Theme.spacing.md,
    lineHeight: 20,
  },
  media: {
    width: '100%',
    height: 200,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.md,
  },
  videoMedia: {
    height: 180,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Theme.spacing.xs,
    paddingTop: Theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.xs,
  },
  likeIcon: {
    fontSize: 20,
    marginRight: Theme.spacing.xs,
  },
  likeCount: {
    fontSize: Theme.typography.size.md,
    color: Colors.textMuted,
    fontWeight: Theme.typography.weight.medium,
  },
  likedText: {
    color: Colors.heartRed,
  },
  viewMoreBtn: {
    padding: Theme.spacing.xs,
  },
  viewMore: {
    fontSize: Theme.typography.size.sm,
    color: Colors.primary,
    fontWeight: Theme.typography.weight.semibold,
  },
});
