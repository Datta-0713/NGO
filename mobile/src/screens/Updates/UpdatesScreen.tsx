import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { NotificationItem } from '../../components/notifications/NotificationItem';
import { TopContributorBanner } from '../../components/notifications/TopContributorBanner';
import { EmptyState } from '../../components/common/EmptyState';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { fetchNotifications, markReadThunk, getHighlightThunk, refreshUnreadCount } from '../../store/slices/notificationsSlice';

export const UpdatesScreen = () => {
  const dispatch = useAppDispatch();
  const { items, loading, highlight, error } = useAppSelector(state => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications({ page: 1, limit: 20 }));
    dispatch(getHighlightThunk());
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      dispatch(refreshUnreadCount());
    }, [dispatch])
  );

  const handleRefresh = () => {
    dispatch(fetchNotifications({ page: 1, limit: 20 }));
  };

  const handleRetry = () => {
    dispatch(fetchNotifications({ page: 1, limit: 20 }));
  };

  const handlePress = (id: string) => {
    dispatch(markReadThunk(id));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Updates" />

      {loading && items.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading updates...</Text>
        </View>
      ) : error && items.length === 0 ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to load updates</Text>
          <Text style={styles.errorDetail}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <NotificationItem notification={item} onPress={() => handlePress(item._id)} />
          )}
          ListHeaderComponent={
            highlight ? <TopContributorBanner highlight={highlight} /> : null
          }
          ListEmptyComponent={
            !loading ? (
              <EmptyState title="No new updates" description="You're all caught up!" />
            ) : null
          }
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={handleRefresh} tintColor={Colors.primary} />
          }
          ListFooterComponent={
            error && items.length > 0 ? (
              <TouchableOpacity style={styles.footerRetry} onPress={handleRetry}>
                <Text style={styles.footerRetryText}>Something went wrong. Tap to retry.</Text>
              </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 8,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.error,
  },
  errorDetail: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  retryBtnText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  footerRetry: {
    padding: 16,
    alignItems: 'center',
  },
  footerRetryText: {
    color: Colors.error,
    fontSize: 13,
    fontWeight: '500',
  },
});
