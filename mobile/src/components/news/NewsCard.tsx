import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Share, Alert } from 'react-native';

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
  const firstMedia = item.media?.[0];
  const isLiked = Boolean(item.liked);
  const [saved, setSaved] = useState(Boolean(item.saved));
  const [saving, setSaving] = useState(false);
  const likesCount = item.likesCount ?? 0;
  const author = item.submittedBy;

  const handleReport = async () => {
    try {
      await api.post(`/news/${item._id}/report`, { reason: 'Inappropriate content' });
      Alert.alert('Reported', 'Thank you. Our admins will review this story shortly.');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to report. Please try again.';
      Alert.alert('Notice', msg);
    }
  };

  const handleSave = async () => {
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
    Alert.alert(
      'Options',
      '',
      [
        { text: 'Share', onPress: handleShare },
        { text: saved ? 'Remove from Saved' : 'Save Story', onPress: handleSave },
        {
          text: 'Report Story',
          onPress: () => {
            Alert.alert(
              'Report Story',
              'Are you sure you want to report this story as inappropriate?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Report', style: 'destructive', onPress: handleReport },
              ]
            );
          },
          style: 'destructive'
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
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
        <Text style={styles.description} numberOfLines={3}>{item.description}</Text>
        {firstMedia?.url && (
          firstMedia.type === 'video' ? (
            <View style={[styles.media, styles.videoPreview]}>
              <Image source={{ uri: firstMedia.thumbnailUrl || firstMedia.url }} style={styles.media} resizeMode="cover" />
              <View style={styles.playBadge}><Ionicons name="play" size={20} color="#fff" /></View>
              {item.media && item.media.length > 1 && (
                <View style={styles.mediaCountBadge}>
                  <Ionicons name="images-outline" size={12} color="#fff" />
                  <Text style={styles.mediaCountText}>{item.media.length}</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.mediaPreviewWrap}>
              <Image
                source={{ uri: firstMedia.url }}
                style={styles.media}
                resizeMode="cover"
              />
              {item.media && item.media.length > 1 && (
                <View style={styles.mediaCountBadge}>
                  <Ionicons name="images-outline" size={12} color="#fff" />
                  <Text style={styles.mediaCountText}>{item.media.length}</Text>
                </View>
              )}
            </View>
          )
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
});
