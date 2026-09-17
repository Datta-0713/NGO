import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { NotificationItem } from '../../components/notifications/NotificationItem';
import { TopContributorBanner } from '../../components/notifications/TopContributorBanner';
import { EmptyState } from '../../components/common/EmptyState';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { fetchNotifications, markReadThunk, getHighlightThunk } from '../../store/slices/notificationsSlice';

export const UpdatesScreen = () => {
  const dispatch = useAppDispatch();
  const { items, loading, highlight } = useAppSelector(state => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications({ page: 1, limit: 20 }));
    dispatch(getHighlightThunk());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchNotifications({ page: 1, limit: 20 }));
  };

  const handlePress = (id: string) => {
    dispatch(markReadThunk(id));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Updates" />

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
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
});
