import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, ActivityIndicator,
  TouchableOpacity, TextInput, KeyboardAvoidingView, Platform,
  FlatList, Alert, Share, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video, ResizeMode } from 'expo-av';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Avatar } from '../../components/common/Avatar';
import { feedApi } from '../../api/feedApi';
import { Config } from '../../constants/config';
import { isValid, format, formatDistanceToNow } from 'date-fns';
import type { NewsItem, Comment } from '../../types';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { toggleLike } from '../../store/slices/feedSlice';
import { EmptyState } from '../../components/common/EmptyState';

const safeFormat = (d: string, fmt: string) => {
  const p = new Date(d);
  return isValid(p) ? format(p, fmt) : '';
};

export const NewsDetailScreen = () => {
  const route      = useRoute<any>();
  const navigation = useNavigation();
  const dispatch   = useAppDispatch();
  const currentUser = useAppSelector(state => state.auth.user);
  const { width: screenWidth } = useWindowDimensions();
  const { id } = route.params;

  const [news, setNews]           = useState<NewsItem | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  // Comments
  const [comments, setComments]         = useState<Comment[]>([]);
  const [commentText, setCommentText]   = useState('');
  const [posting, setPosting]           = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Multi-media carousel state
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [isMediaScrolling, setIsMediaScrolling] = useState(false);
  const mediaListRef = useRef<FlatList>(null);

  const scrollRef = useRef<ScrollView>(null);

  const onMediaScroll = (e: any) => {
    const layoutWidth = e.nativeEvent.layoutMeasurement.width;
    if (!layoutWidth) return;
    const index = Math.round(e.nativeEvent.contentOffset.x / layoutWidth);
    if (index !== activeMediaIndex) setActiveMediaIndex(index);
  };

  // Load news detail
  useEffect(() => {
    (async () => {
      try {
        const data = await feedApi.getNewsById(id);
        setNews(data?.news ?? null);
      } catch (e: any) {
        setError(e.response?.data?.message || 'Failed to load story');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Load comments
  useEffect(() => {
    if (!id) return;
    setCommentsLoading(true);
    feedApi.getComments(id)
      .then(data => setComments(data?.comments ?? []))
      .catch(() => {})
      .finally(() => setCommentsLoading(false));
  }, [id]);

  const handleRetry = () => {
    setLoading(true);
    setError('');
    feedApi.getNewsById(id)
      .then(data => {
        setNews(data?.news ?? null);
        setLoading(false);
      })
      .catch(e => {
        setError(e.response?.data?.message || 'Failed to load story');
        setLoading(false);
      });
  };

  const handleLike = async () => {
    if (!news) return;
    const alreadyLiked = Boolean(news.liked);
    const prevLiked = alreadyLiked;
    const prevLikesCount = news.likesCount || 0;
    // Optimistic update
    setNews(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        liked: !alreadyLiked,
        likesCount: Math.max(0, prevLikesCount + (alreadyLiked ? -1 : 1)),
      };
    });
    try {
      await dispatch(toggleLike({ id: news._id, liked: !!alreadyLiked })).unwrap();
    } catch {
      // Revert on failure
      setNews(prev => {
        if (!prev) return prev;
        return { ...prev, liked: prevLiked, likesCount: prevLikesCount };
      });
    }
  };

  const handleSave = async () => {
    if (!news || saving) return;
    setSaving(true);
    try {
      const result = news.saved ? await feedApi.unsaveNews(news._id) : await feedApi.saveNews(news._id);
      setNews(prev => prev ? { ...prev, saved: result.saved } : prev);
    } catch (e: any) {
      Alert.alert('Could not update saved stories', e?.response?.data?.message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    if (!news) return;
    const link = Config.PUBLIC_WEB_URL
      ? `${Config.PUBLIC_WEB_URL.replace(/\/$/, '')}/news/${news._id}`
      : `asiannewsbureau://news/${news._id}`;
    try {
      await Share.share({
        title: news.title,
        message: `${news.title}\n\nRead this story on Asian News Bureau:\n${link}`,
        url: link,
      });
    } catch (e) {
      console.warn('Share failed:', e);
    }
  };

  const handlePostComment = async () => {
    if (!commentText.trim() || posting) return;
    setPosting(true);
    try {
      const data = await feedApi.addComment(id, commentText.trim());
      setCommentText('');
      // Refresh comment list from server to get updated count/order
      feedApi.getComments(id).then(data => {
        if (data?.comments) setComments(data.comments);
      }).catch(() => {});
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Could not post comment');
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteComment = (commentId: string) => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to remove this comment? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await feedApi.deleteComment(id, commentId);
              setComments(prev => prev.filter(c => c._id !== commentId));
              // Refresh count from server so the badge stays accurate
              feedApi.getComments(id).then(data => {
                if (data?.comments) setComments(data.comments);
              }).catch(() => {});
            } catch (e: any) {
              Alert.alert('Could not delete comment', e?.response?.data?.message || 'Please try again.');
            }
          },
        },
      ]
    );
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
        <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
        <Text style={styles.errorText}>{error || 'Story not found'}</Text>
        <TouchableOpacity onPress={handleRetry} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, styles.backBtnSecondary]}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isLiked    = Boolean(news.liked);
  const likesCount = news.likesCount ?? 0;
  const author     = news.submittedBy as any;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Custom back header */}
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="arrow-back" size={24} color="#1A1A2E" />
          </TouchableOpacity>
          <View style={styles.navActions}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleSave} disabled={saving} activeOpacity={0.7}>
              <Ionicons name={news.saved ? 'bookmark' : 'bookmark-outline'} size={21} color={news.saved ? Colors.primary : '#6B7280'} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={handleShare} activeOpacity={0.7}>
              <Ionicons name="share-outline" size={21} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.likeBtn} onPress={handleLike} activeOpacity={0.7}>
              <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={22} color={isLiked ? Colors.heartRed : '#6B7280'} />
              <Text style={[styles.likeCount, isLiked && styles.likedText]}>{likesCount}</Text>
            </TouchableOpacity>
            <View style={styles.viewsBtn}>
              <Ionicons name="eye-outline" size={20} color="#6B7280" />
              <Text style={styles.viewsText}>{news.views}</Text>
            </View>
          </View>
        </View>

        <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* ALL media in a single swipeable carousel — no text between items */}
          {news.media && news.media.length > 0 && (
            <View style={styles.mediaCarouselWrap}>
              <FlatList
                ref={mediaListRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                decelerationRate="fast"
                onMomentumScrollEnd={onMediaScroll}
                onScrollBeginDrag={() => setIsMediaScrolling(true)}
                onScrollEndDrag={() => setIsMediaScrolling(false)}
                data={news.media}
                keyExtractor={(_, i) => `media-${i}`}
renderItem={({ item }) => (
                    <View style={[styles.mediaCarouselItem, { width: screenWidth }]}>
                      {item.type === 'video' ? (
                        <Video
                          source={{ uri: item.url }}
                          posterSource={item.thumbnailUrl ? { uri: item.thumbnailUrl } : undefined}
                          usePoster={Boolean(item.thumbnailUrl)}
                          style={styles.extraImage}
                          useNativeControls
                          resizeMode={ResizeMode.COVER}
                          isLooping
                        />
                      ) : (
                        <Image source={{ uri: item.url }} style={styles.extraImage} resizeMode="cover" />
                      )}
                    </View>
                  )}
                />
              {news.media.length > 1 && (
                <View style={styles.mediaCounter}>
                  <Text style={styles.mediaCounterText}>
                    {activeMediaIndex + 1} / {news.media.length}
                  </Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.content}>
            {/* Category badge */}
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{news.category}</Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>{news.title}</Text>

            {/* Meta */}
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="location-outline" size={14} color="#9CA3AF" />
                <Text style={styles.metaText}>{news.location}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
                <Text style={styles.metaText}>{safeFormat(news.createdAt, 'MMM d, yyyy')}</Text>
              </View>
            </View>

            {/* Author */}
            <View style={styles.authorSection}>
              <Avatar url={author?.profilePhoto} name={author?.name || 'Asian News Bureau'} size={44} />
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>{author?.name || 'Asian News Bureau'}</Text>
                <View style={styles.contributorBadge}>
                  <Ionicons name="shield-checkmark" size={11} color={Colors.accent} />
                  <Text style={styles.contributorText}>Contributor · {author?.credits ?? 0} credits</Text>
                </View>
              </View>
            </View>

            {/* Body */}
            <Text style={styles.description}>{news.description}</Text>

            {/* Comments section */}
            <View style={styles.commentsHeader}>
              <Text style={styles.commentsTitle}>Comments</Text>
              <Text style={styles.commentsCount}>{comments.length}</Text>
            </View>

            {commentsLoading ? (
              <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 16 }} />
            ) : comments.length === 0 ? (
              <EmptyState
                title="No comments yet"
                description="Be the first to share your thoughts"
                emoji="💬"
              />
            ) : (
              comments.map(c => (
                <View key={c._id} style={styles.commentItem}>
                  <Avatar url={c.user?.profilePhoto} name={c.user?.name || 'User'} size={36} />
                  <View style={styles.commentBubble}>
                    <View style={styles.commentTop}>
                      <Text style={styles.commentName}>{c.user?.name || 'User'}</Text>
                      <Text style={styles.commentTime}>
                        {isValid(new Date(c.createdAt)) ? formatDistanceToNow(new Date(c.createdAt), { addSuffix: true }) : ''}
                      </Text>
                    </View>
                    <Text style={styles.commentText}>{c.text}</Text>
                  </View>
                  {c.user?._id === currentUser?._id && (
                    <TouchableOpacity style={styles.commentDeleteButton} onPress={() => handleDeleteComment(c._id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Ionicons name="trash-outline" size={16} color="#9CA3AF" />
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}

            <View style={{ height: 100 }} />
          </View>
        </ScrollView>

        {/* Comment input bar */}
        <View style={styles.commentBar}>
          <Avatar url={currentUser?.profilePhoto} name={currentUser?.name || ''} size={34} />
          <TextInput
            style={styles.commentInput}
            placeholder="Write a comment..."
            placeholderTextColor="#9CA3AF"
            value={commentText}
            onChangeText={setCommentText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            onPress={handlePostComment}
            disabled={!commentText.trim() || posting}
            style={[styles.sendBtn, (!commentText.trim() || posting) && styles.sendBtnDisabled]}
          >
            {posting
              ? <ActivityIndicator size="small" color="#fff" />
              : <Ionicons name="send" size={18} color="#fff" />
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', gap: 12 },
  errorText: { fontSize: 16, color: Colors.error, textAlign: 'center' },
  backBtn: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginTop: 8 },
  backBtnSecondary: { backgroundColor: '#F3F4F6', marginTop: 8 },
  backBtnText: { color: '#fff', fontWeight: '700' },

  navBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  navBack: { width: 40, height: 40, justifyContent: 'center' },
  navActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  actionBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 19, backgroundColor: '#F9FAFB' },
  likeBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#F9FAFB', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  likeCount: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  likedText: { color: Colors.heartRed },
  viewsBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  viewsText: { fontSize: 13, color: '#9CA3AF' },

  scrollContent: { paddingBottom: 8 },

  content: { padding: 18 },
  categoryBadge: {
    alignSelf: 'flex-start', backgroundColor: Colors.primaryXLight,
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginBottom: 12,
  },
  categoryText: { color: Colors.primary, fontSize: 12, fontWeight: '700' },
  title: { fontSize: 22, fontWeight: '800', color: '#1A1A2E', marginBottom: 12, lineHeight: 30 },

  metaRow: { flexDirection: 'row', gap: 16, marginBottom: 18 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 13, color: '#9CA3AF' },

  authorSection: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#F8F9FA', borderRadius: 12, padding: 12, marginBottom: 18,
  },
  authorInfo: { flex: 1 },
  authorName: { fontSize: 15, fontWeight: '700', color: '#1A1A2E', marginBottom: 4 },
  contributorBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EDE9FE', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, alignSelf: 'flex-start' },
  contributorText: { fontSize: 11, color: Colors.accent, fontWeight: '600' },

description: { fontSize: 16, color: '#374151', lineHeight: 26, marginBottom: 20 },

  mediaCarouselWrap: { marginBottom: 20, position: 'relative' },
  mediaCarouselItem: { height: 320, marginRight: 0, justifyContent: 'center', alignItems: 'center' },
  extraImage: { width: '100%', height: 320, borderRadius: 10 },
  mediaCounter: {
    position: 'absolute',
    bottom: 12, right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20,
  },
  mediaCounterText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  commentsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  commentsTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A2E' },
  commentsCount: { backgroundColor: '#F3F4F6', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 12, fontSize: 13, fontWeight: '600', color: '#6B7280' },

  noComments: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  noCommentsText: { color: '#9CA3AF', fontSize: 14 },

  commentItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14, gap: 10 },
  commentDeleteButton: { width: 30, minHeight: 34, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  commentBubble: { flex: 1, backgroundColor: '#F9FAFB', borderRadius: 12, padding: 10 },
  commentTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  commentName: { fontSize: 13, fontWeight: '700', color: '#1A1A2E' },
  commentTime: { fontSize: 11, color: '#9CA3AF' },
  commentText: { fontSize: 14, color: '#374151', lineHeight: 19 },

  commentBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: '#F3F4F6', backgroundColor: '#fff',
  },
  commentInput: {
    flex: 1, backgroundColor: '#F3F4F6', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 9, fontSize: 14,
    color: '#1A1A2E', maxHeight: 90,
  },
  sendBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#D1D5DB' },
});
