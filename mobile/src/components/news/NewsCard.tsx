import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Share, Alert } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Avatar } from '../common/Avatar';
import type { NewsItem } from '../../types';
import { formatDistanceToNow, isValid } from 'date-fns';
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

  const dateObj = item.createdAt ? new Date(item.createdAt) : null;
  const timeAgo = dateObj && isValid(dateObj)
    ? formatDistanceToNow(dateObj, { addSuffix: true })
    : '';
  const firstMedia = item.media?.[0];
  const isLiked = item.liked ?? (item.likes?.includes(currentUserId) ?? false);
  const likesCount = item.likes?.length ?? 0;
  const author = item.submittedBy;

  const handleOptions = () => {
    Alert.alert(
      'Options',
      '',
      [
        {
          text: 'Share',
          onPress: async () => {
            try {
              await Share.share({
                message: `Check out this news: ${item.title}\nRead more on Asian News Bureau!`,
              });
            } catch (error) {
              console.log(error);
            }
          }
        },
        {
          text: 'Report',
          onPress: () => {
            Alert.alert('Reported', 'Thank you for reporting. Our admins will review this.');
          },
          style: 'destructive'
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
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
            <Video
              source={{ uri: firstMedia.url }}
              style={styles.media}
              useNativeControls
              resizeMode={ResizeMode.COVER}
              isLooping
            />
          ) : (
            <Image
              source={{ uri: firstMedia.url }}
              style={styles.media}
              resizeMode="cover"
            />
          )
        )}
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.likeButton} onPress={onLike} activeOpacity={0.7}>
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={22}
            color={isLiked ? Colors.heartRed : '#9CA3AF'}
          />
          <Text style={[styles.likeCount, isLiked && styles.likedText]}>{likesCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('NewsDetail', { id: item._id })}
          style={styles.viewMoreBtn}
        >
          <Text style={styles.viewMore}>View more</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
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
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 6,
    lineHeight: 22,
  },
  description: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 12,
    lineHeight: 20,
  },
  media: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 12,
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
  },
  likeCount: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  likedText: { color: Colors.heartRed },
  viewMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewMore: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
});
