import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Share, Alert, FlatList, Modal } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Avatar } from '../common/Avatar';
import type { NewsItem } from '../../types';
import { formatDistanceToNow, isValid } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../navigation/AppStack';
import { api } from '../../api/axios';
import { feedApi } from '../../api/feedApi';
import { Config } from '../../constants/config';

interface NewsCardProps {
  item: NewsItem;
  onLike?: () => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({ item, onLike }) => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  const dateObj = item.createdAt ? new Date(item.createdAt) : null;
  const timeAgo = dateObj && isValid(dateObj)
    ? formatDistanceToNow(dateObj, { addSuffix: true })
    : '';
  const isLiked = Boolean(item.liked);
  const [saved, setSaved] = useState(Boolean(item.saved));
  const [saving, setSaving] = useState(false);
  const likesCount = item.likesCount ?? 0;
  const author = item.submittedBy;
  const [feedMediaIndex, setFeedMediaIndex] = useState(0);
  const feedMediaListRef = useRef<FlatList>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const onFeedMediaScroll = (e: any) => {
    const w = e.nativeEvent.layoutMeasurement.width;
    if (!w) return;
    setFeedMediaIndex(Math.round(e.nativeEvent.contentSize.width / w));
  };

  const handleReport = async () => {
    setMenuVisible(false);
    try {
      await api.post(`/news/${item._id}/report`, { reason: 'Inappropriate content' });
      Alert.alert('Reported', 'Thank you. Our admins will review this story shortly.');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to report. Please try again.';
      Alert.alert('Notice', msg);
    }
  };

  const handleSave = async () => {
    setMenuVisible(false);
    if (saving) return;
    setSaving(true);
    try {
      const next = saved ? await feedApi.unsaveNews(item._id) : await feedApi.saveNews(item._id);
      setSaved(Boolean(next.saved));
    } catch (error: any) {
      Alert.alert('Could not update saved stories', error?.response?.data?.message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    setMenuVisible(false);
    try {
      const link = Config.PUBLIC_WEB_URL
        ? `${Config.PUBLIC_WEB_URL.replace(/\/$/, '')}/news/${item._id}`
        : `asiannewsbureau://news/${item._id}`;
      await Share.share({
        title: item.title,
        message: `${item.title}\n\nRead this story on Asian News Bureau:\n${link}`,
        url: link,
      });
    } catch (error) {
      console.warn('Share failed:', error);
    }
  };

  const handleOptions = () => {
    setMenuVisible(true);
  };

  const handleComments = () => {
    navigation.navigate('NewsDetail', { id: item._id });
  };

  return (
    <View style={styles.card}>
      {/* Author header */}
      <View style={styles.header}>
        <Avatar url={author?.profilePhoto || ''} name={author?.name || 'Asian News Bureau'} size={40} />
        <View style={styles.headerMid}>
          <Text style={styles.authorName}>{author?.name || 'Asian News Bureau'}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={12} color="#9CA3AF" />
            <Text style={styles.locationTime} numberOfLines={1}>
              {' '}{item.location}  ·  {timeAgo}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleOptions} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="ellipsis-vertical" size={18} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('NewsDetail', { id: item._id })}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        {item.media && item.media.length > 0 && (
          <View style={styles.feedMediaWrap}>
            <FlatList
              ref={feedMediaListRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              pagingEnabled
              decelerationRate="fast"
              onMomentumScrollEnd={onFeedMediaScroll}
              data={item.media}
              keyExtractor={(_, i) => `feed-media-${i}`}
              renderItem={({ item: m }) => (
                <View style={styles.feedMediaItem}>
                  {m.type === 'video' ? (
                    <Image source={{ uri: m.thumbnailUrl || m.url }} style={styles.feedMedia} resizeMode="cover" />
                  ) : (
                    <Image source={{ uri: m.url }} style={styles.feedMedia} resizeMode="cover" />
                  )}
                </View>
              )}
            />
            {item.media.length > 1 && (
              <View style={styles.feedMediaBadge}>
                <Ionicons name="images-outline" size={11} color="#fff" />
                <Text style={styles.feedMediaBadgeText}>{item.media.length}</Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>

      {/* Footer — like · comment · save · share */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.likeButton} onPress={onLike} activeOpacity={0.7}>
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={22}
            color={isLiked ? Colors.heartRed : '#9CA3AF'}
          />
          <Text style={[styles.likeCount, isLiked && styles.likedText]}>{likesCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.commentButton} onPress={handleComments} activeOpacity={0.7}>
          <Ionicons name="chatbubble-outline" size={20} color="#9CA3AF" />
          <Text style={styles.commentCount}>{item.commentsCount ?? 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveButton} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={20} color={saved ? Colors.primary : '#9CA3AF'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <Ionicons name="share-outline" size={20} color="#9CA3AF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleOptions} style={styles.optionsButton} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <Ionicons name="ellipsis-vertical" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Options menu — proper modal that dismisses on back button and outside tap */}
      <Modal
        visible={menuVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuBox} pointerEvents="box-none">
            <View style={styles.menuHandle} />
            <TouchableOpacity style={styles.menuItem} onPress={handleShare} activeOpacity={0.7}>
              <Ionicons name="share-outline" size={20} color="#1A1A2E" />
              <Text style={styles.menuItemText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleSave} activeOpacity={0.7}>
              <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={20} color={saved ? Colors.primary : '#1A1A2E'} />
              <Text style={styles.menuItemText}>{saved ? 'Remove from Saved' : 'Save Story'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleReport} activeOpacity={0.7}>
              <Ionicons name="flag-outline" size={20} color={Colors.error} />
              <Text style={[styles.menuItemText, { color: Colors.error }]}>Report Story</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, styles.menuCancel]} onPress={() => setMenuVisible(false)} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color="#6B7280" />
              <Text style={styles.menuCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
    card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  headerMid: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationTime: {
    fontSize: 12,
    color: '#9CA3AF',
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 8,
    lineHeight: 24,
  },
  description: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 12,
  },
  media: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 12,
  },
  feedMediaWrap: {
    width: '100%',
    height: 200,
    marginBottom: 12,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  feedMedia: {
    width: '100%',
    height: 200,
  },
  feedMediaItem: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedMediaBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  feedMediaBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  mediaPreviewWrap: {
    position: 'relative',
    width: '100%',
    height: 200,
    marginBottom: 12,
    borderRadius: 10,
    overflow: 'hidden',
  },
  mediaCountBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mediaCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 20,
  },
  likeCount: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  likedText: { color: Colors.heartRed },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 20,
  },
  commentCount: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  saveButton: { marginRight: 4, padding: 6 },
  shareButton: { padding: 6 },
  optionsButton: { padding: 6 },
  videoPreview: { position: 'relative', overflow: 'hidden' },
  playBadge: { position: 'absolute', left: '50%', top: '50%', marginLeft: -22, marginTop: -22, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  menuBox: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 12,
    paddingTop: 10,
  },
  menuHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  menuItemText: {
    fontSize: 16,
    color: '#1A1A2E',
    fontWeight: '500',
  },
  menuCancel: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginTop: 4,
  },
  menuCancelText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
});
