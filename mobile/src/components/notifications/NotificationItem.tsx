import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import { Theme } from '../../constants/theme';
import type { Notification } from '../../types';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItemProps {
  notification: Notification;
  onPress: () => void;
}

/** Maps backend notification types to display emoji icons */
const getNotificationIcon = (type: Notification['type']): string => {
  switch (type) {
    case 'news_approved':     return '✅';
    case 'news_rejected':     return '❌';
    case 'credit_received':   return '💰';
    case 'news_liked':        return '❤️';
    case 'top_contributor':   return '🏆';
    case 'system':
    default:                  return '🔔';
  }
};

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onPress }) => {
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });

  return (
    <TouchableOpacity
      style={[styles.container, !notification.read && styles.unreadContainer]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{getNotificationIcon(notification.type)}</Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, !notification.read && styles.unreadText]}>
          {notification.title}
        </Text>
        <Text style={styles.message} numberOfLines={2}>
          {notification.message}
        </Text>
        <Text style={styles.time}>{timeAgo}</Text>
      </View>

      {!notification.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: Theme.spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  unreadContainer: {
    backgroundColor: Colors.primaryXLight,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.backgroundGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.md,
  },
  icon: {
    fontSize: 22,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: Theme.typography.size.md,
    fontWeight: Theme.typography.weight.medium,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  unreadText: {
    fontWeight: Theme.typography.weight.bold,
  },
  message: {
    fontSize: Theme.typography.size.sm,
    color: Colors.textSecondary,
    marginBottom: 4,
    lineHeight: 20,
  },
  time: {
    fontSize: Theme.typography.size.xs,
    color: Colors.textLight,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginTop: Theme.spacing.md,
  },
});
