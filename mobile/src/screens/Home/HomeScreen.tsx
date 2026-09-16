import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { fetchFeed, toggleLike } from '../../store/slices/feedSlice';
import { getHighlightThunk } from '../../store/slices/notificationsSlice';
import { Header } from '../../components/common/Header';
import { NewsCard } from '../../components/news/NewsCard';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { TopContributorBanner } from '../../components/notifications/TopContributorBanner';
import { Colors } from '../../constants/colors';
import { Theme } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { TabParamList } from '../../navigation/TabNavigator';
import type { AppStackParamList } from '../../navigation/AppStack';

type NavigationProp = NativeStackNavigationProp<AppStackParamList & TabParamList>;

export const HomeScreen = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavigationProp>();
  const [refreshing, setRefreshing] = useState(false);

  const { items, loading, hasMore, page } = useAppSelector(state => state.feed);
  const { highlight, unreadCount } = useAppSelector(state => state.notifications);

  useEffect(() => {
    dispatch(fetchFeed({ page: 1, limit: 10 }));
    dispatch(getHighlightThunk());
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchFeed({ page: 1, limit: 10 }));
    setRefreshing(false);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      dispatch(fetchFeed({ page: page + 1, limit: 10 }));
    }
  };

  const handleLike = (id: string) => {
    dispatch(toggleLike(id));
  };

  const renderHeader = () => {
    if (highlight) {
      return <TopContributorBanner highlight={highlight} />;
    }
    return null;
  };

  const renderEmpty = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.loadingContainer}>
          {[1, 2, 3].map(i => (
            <View key={i} style={styles.skeletonCard}>
              <View style={styles.skeletonHeader}>
                <LoadingSkeleton width={40} height={40} borderRadius={20} />
                <View style={styles.skeletonHeaderText}>
                  <LoadingSkeleton width={120} height={16} />
                  <LoadingSkeleton width={80} height={12} style={{ marginTop: 8 }} />
                </View>
              </View>
              <LoadingSkeleton width="100%" height={24} style={{ marginBottom: 12 }} />
              <LoadingSkeleton width="100%" height={200} borderRadius={8} />
            </View>
          ))}
        </View>
      );
    }
    return null;
  };

  const BellIcon = () => (
    <View>
      <Ionicons name="notifications-outline" size={24} color="#374151" />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Asian News Bureau"
        subtitle="Building stronger communities together"
        showLogo={true}
        rightIcon={<BellIcon />}
        onRightPress={() => navigation.navigate('Updates')}
      />
      
      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <NewsCard item={item} onLike={() => handleLike(item._id)} />
        )}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  listContent: {
    padding: Theme.spacing.md,
  },
  loadingContainer: {
    paddingTop: Theme.spacing.md,
  },
  skeletonCard: {
    backgroundColor: Colors.white,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.lg,
  },
  skeletonHeader: {
    flexDirection: 'row',
    marginBottom: Theme.spacing.md,
  },
  skeletonHeaderText: {
    marginLeft: Theme.spacing.md,
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
});
