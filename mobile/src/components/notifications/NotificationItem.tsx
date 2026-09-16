import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import type { Notification } from '../../types';
import { formatDistanceToNow, isValid } from 'date-fns';

interface NotificationItemProps {
  notification: Notification;
  onPress: () => void;
}

type IoniconName = keyof typeof Ionicons.glyphMap;

const getIcon = (type: Notification['type']): { name: IoniconName; color: string; bg: string } => {
  switch (type) {
    case 'news_approved':   return { name: 'checkmark-circle', color: '#22C55E', bg: '#F0FDF4' };
    case 'news_rejected':   return { name: 'close-circle',     color: '#EF4444', bg: '#FEF2F2' };
    case 'credit_received': return { name: 'wallet',           color: '#F59E0B', bg: '#FFFBEB' };
    case 'news_liked':      return { name: 'heart',            color: '#FF4B4B', bg: '#FFF5F5' };
    case 'top_contributor': return { name: 'trophy',           color: '#8B5CF6', bg: '#F5F3FF' };
    default:                return { name: 'notifications',    color: Colors.primary, bg: Colors.primaryXLight };
  }
};

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onPress }) => {
  const dateObj = new Date(notification.createdAt);
  const timeAgo = isValid(dateObj) ? formatDistanceToNow(dateObj, { addSuffix: true }) : '';
  const icon = getIcon(notification.type);

  return (
    <TouchableOpacity
      style={[styles.container, !notification.read && styles.unreadContainer]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: icon.bg }]}>
        <Ionicons name={icon.name} size={22} color={icon.color} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, !notification.read && styles.unreadText]} numberOfLines={1}>
          {notification.title}
        </Text>
        <Text style={styles.message} numberOfLines={2}>{notification.message}</Text>
        <Text style={styles.time}>{timeAgo}</Text>
      </View>

      {!notification.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
    alignItems: 'center',
    gap: 12,
  },
  unreadContainer: { backgroundColor: '#F0FDF4' },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  content: { flex: 1 },
  title: { fontSize: 14, fontWeight: '500', color: '#1A1A2E', marginBottom: 3 },
  unreadText: { fontWeight: '700' },
  message: { fontSize: 13, color: '#4B5563', lineHeight: 18, marginBottom: 4 },
  time: { fontSize: 11, color: '#9CA3AF' },
  unreadDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.primary, flexShrink: 0,
  },
});
