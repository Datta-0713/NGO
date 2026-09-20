import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Share,
  Alert,
  FlatList,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Avatar } from '../common/Avatar';
import type { MediaItem, NewsItem } from '../../types';
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

const MEDIA_ASPECT = 4 / 5;

const FeedMedia: React.FC<{
  media: MediaItem;
  width: number;
  onImagePress: () => void;
}> = ({ media, width, onImagePress }) => {
  const [videoReady, setVideoReady] = useState(false);
  const height = width / MEDIA_ASPECT;

  if (media.type === 'video') {
    return (
      <View style={[styles.feedMediaItem, { width, height }]}> 
        <Video
          source={{ uri: media.url }}
          style={[styles.feedMedia, { width, height }]}
          videoStyle={[styles.feedMedia, { width, height }]}
          posterSource={media.thumbnailUrl ? { uri: media.thumbnailUrl } : undefined}
          usePoster={Boolean(media.thumbnailUrl)}
          useNativeControls
          resizeMode={ResizeMode.COVER}
          shouldPlay={false}
          isLooping={false}
          onReadyForDisplay={() => setVideoReady(true)}
          onError={() => setVideoReady(false)}
        />
        {!videoReady && media.thumbnailUrl && (
          <View pointerEvents="none" style={styles.posterFallback}>
            <Image source={{ uri: media.thumbnailUrl }} style={[styles.feedMedia, { width, height }]} resizeMode="cover" />
            <View style={styles.videoPosterLabel}>
              <Ionicons name="play" size={14} color="#fff" />
            </View>
          </View>
        )}
        <View pointerEvents="none" style={styles.videoBadge}>
          <Ionicons name="videocam" size={12} color="#fff" />
          <Text style={styles.videoBadgeText}>VIDEO</Text>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onImagePress}
      style={[styles.feedMediaItem, { width, height }]}
    >
      <Image source={{ uri: media.url }} style={[styles.feedMedia, { width, height }]} resizeMode="cover" />
    </TouchableOpacity>
  );
};

export const NewsCard: React.FC<NewsCardProps> = ({ item, onLike }) => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { width: screenWidth } = useWindowDimensions();
  const mediaWidth = Math.max(1, screenWidth - 64);
  const mediaHeight = mediaWidth / MEDIA_ASPECT;

  const dateObj = item.createdAt ? new Date(item.createdAt) : null;
  const timeAgo = dateObj && isValid(dateObj) ? formatDistanceToNow(dateObj, { addSuffix: true }) : '';
  const isLiked = Boolean(item.liked);
  const [saved, setSaved] = useState(Boolean(item.saved));
  const [saving, setSaving] = useState(false);
  const likesCount = item.likesCount ?? 0;
  const author = item.submittedBy;
  const [feedMediaIndex, setFeedMediaIndex] = useState(0);
  const feedMediaListRef = useRef<FlatList<MediaItem>>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const onFeedMediaScroll = (e: any) => {
    const w = e.nativeEvent.layoutMeasurement.width;
    if (!w) return;
    setFeedMediaIndex(Math.round(e.nativeEvent.contentOffset.x / w));
  };

  const handleReport = async () => {
    setMenuVisible(false);
    try {
      await api.post(`/news/${item._id}/report`, { reason: 'Inappropriate content' });
      Alert.alert('Reported', 'Thank you. Our admins will review this story shortly.');
    } catch (err: any) {
      Alert.alert('Notice', err?.response?.data?.message || 'Failed to report. Please try again.');
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

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Avatar url={author?.profilePhoto || ''} name={author?.name || 'Asian News Bureau'} size={40} />
        <View style={styles.headerMid}>
          <Text style={styles.authorName}>{author?.name || 'Asian News Bureau'}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={12} color="#9CA3AF" />
            <Text style={styles.locationTime} numberOfLines={1}>{' '}{item.location} · {timeAgo}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => setMenuVisible(true)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="ellipsis-vertical" size={18} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('NewsDetail', { id: item._id })}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      </TouchableOpacity>

      {item.media?.length > 0 && (
        <View style={[styles.feedMediaWrap, { height: mediaHeight }]}>
          <FlatList
            ref={feedMediaListRef}
            horizontal
            pagingEnabled
            snapToInterval={mediaWidth}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            data={item.media}
            keyExtractor={(media, index) => `${media.publicId || media.url}-${index}`}
            onMomentumScrollEnd={onFeedMediaScroll}
            renderItem={({ item: media }) => (
              <FeedMedia
                media={media}
                width={mediaWidth}
                onImagePress={() => navigation.navigate('NewsDetail', { id: item._id })}
              />
            )}
          />
          {item.media.length > 1 && (
            <>
              <View style={styles.feedMediaBadge}>
                <Ionicons name="images-outline" size={11} color="#fff" />
                <Text style={styles.feedMediaBadgeText}>{feedMediaIndex + 1}/{item.media.length}</Text>
              </View>
              <View style={styles.dotsRow}>
                {item.media.map((media, index) => (
                  <View key={`${media.publicId || media.url}-dot`} style={[styles.dot, index === feedMediaIndex && styles.activeDot]} />
                ))}
              </View>
            </>
          )}
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.actionButton} onPress={onLike} activeOpacity={0.7}>
          <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={22} color={isLiked ? Colors.heartRed : '#9CA3AF'} />
          <Text style={[styles.actionCount, isLiked && styles.likedText]}>{likesCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('NewsDetail', { id: item._id })} activeOpacity={0.7}>
          <Ionicons name="chatbubble-outline" size={20} color="#9CA3AF" />
          <Text style={styles.actionCount}>{item.commentsCount ?? 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.iconButton}>
          <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={20} color={saved ? Colors.primary : '#9CA3AF'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
          <Ionicons name="share-outline" size={20} color="#9CA3AF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.iconButton}>
          <Ionicons name="ellipsis-vertical" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <Modal visible={menuVisible} animationType="fade" transparent onRequestClose={() => setMenuVisible(false)}>
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuBox}>
            <View style={styles.menuHandle} />
            <TouchableOpacity style={styles.menuItem} onPress={handleShare}><Ionicons name="share-outline" size={20} color="#1A1A2E" /><Text style={styles.menuItemText}>Share</Text></TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleSave}><Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={20} color={saved ? Colors.primary : '#1A1A2E'} /><Text style={styles.menuItemText}>{saved ? 'Remove from Saved' : 'Save Story'}</Text></TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleReport}><Ionicons name="flag-outline" size={20} color={Colors.error} /><Text style={[styles.menuItemText, { color: Colors.error }]}>Report Story</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, styles.menuCancel]} onPress={() => setMenuVisible(false)}><Ionicons name="close" size={20} color="#6B7280" /><Text style={styles.menuCancelText}>Cancel</Text></TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  headerMid: { flex: 1 },
  authorName: { fontSize: 14, fontWeight: '600', color: '#1A1A2E', marginBottom: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  locationTime: { fontSize: 12, color: '#9CA3AF', flex: 1 },
  title: { fontSize: 17, fontWeight: '700', color: '#1A1A2E', marginBottom: 8, lineHeight: 24 },
  description: { fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 12 },
  feedMediaWrap: { width: '100%', marginBottom: 12, borderRadius: 12, overflow: 'hidden', backgroundColor: '#111827', position: 'relative' },
  feedMediaItem: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#111827' },
  feedMedia: { borderRadius: 0 },
  posterFallback: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111827' },
  videoPosterLabel: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.62)', justifyContent: 'center', alignItems: 'center' },
  videoBadge: { position: 'absolute', left: 10, top: 10, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, paddingVertical: 4, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.58)' },
  videoBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  feedMediaBadge: { position: 'absolute', top: 10, right: 10, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 12 },
  feedMediaBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  dotsRow: { position: 'absolute', bottom: 8, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.55)' },
  activeDot: { width: 15, backgroundColor: '#fff' },
  footer: { flexDirection: 'row', alignItems: 'center', paddingTop: 6 },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 5, marginRight: 18 },
  actionCount: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
  likedText: { color: Colors.heartRed },
  iconButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', marginLeft: 4 },
  menuOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' },
  menuBox: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 18, paddingTop: 10, paddingBottom: 30 },
  menuHandle: { alignSelf: 'center', width: 42, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB', marginBottom: 10 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16 },
  menuItemText: { fontSize: 15, fontWeight: '600', color: '#1A1A2E' },
  menuCancel: { borderTopWidth: 1, borderTopColor: '#F3F4F6', marginTop: 4 },
  menuCancelText: { fontSize: 15, fontWeight: '600', color: '#6B7280' },
});
