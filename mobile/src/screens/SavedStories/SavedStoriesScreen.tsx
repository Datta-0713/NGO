import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/common/Header';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Colors } from '../../constants/colors';
import { feedApi } from '../../api/feedApi';
import type { NewsItem } from '../../types';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../navigation/AppStack';

type Nav = NativeStackNavigationProp<AppStackParamList>;

export const SavedStoriesScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await feedApi.getSavedNews({ page: 1, limit: 50 });
      setItems(res.news);
    } catch (e: any) {
      Alert.alert('Unable to load saved stories', e?.response?.data?.message || 'Please try again.');
    } finally {
      if (refresh) setRefreshing(false); else setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const unsave = async (id: string) => {
    try {
      await feedApi.unsaveNews(id);
      setItems(prev => prev.filter(x => x._id !== id));
    } catch {
      Alert.alert('Could not remove story', 'Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header showBack title="Saved Stories" subtitle="News you want to keep" />
      {loading ? (
        <View style={styles.loading}>
          {[1, 2, 3].map(i => (
            <LoadingSkeleton key={i} width="100%" height={96} borderRadius={14} style={{ marginBottom: 12 }} />
          ))}
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={x => x._id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={Colors.primary} />}
          ListEmptyComponent={
            <EmptyState title="No saved stories" description="Tap the bookmark on a story to keep it here." emoji="🔖" />
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.main}
                onPress={() => navigation.navigate('NewsDetail', { id: item._id })}
                activeOpacity={0.85}
              >
                {item.media?.[0]?.url ? (
                  item.media[0].type === 'video' ? (
                    <View style={styles.thumbWrap}>
                      <Image source={{ uri: item.media[0].thumbnailUrl }} style={styles.thumb} />
                      <View style={styles.play}><Ionicons name="play" size={14} color="#fff" /></View>
                    </View>
                  ) : (
                    <Image source={{ uri: item.media[0].url }} style={styles.thumb} />
                  )
                ) : (
                  <View style={[styles.thumb, styles.placeholder]}>
                    <Ionicons name="document-text-outline" size={24} color="#D1D5DB" />
                  </View>
                )}
                <View style={styles.copy}>
                  <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.meta}>{item.location}</Text>
                  <Text style={styles.meta}>{item.submittedBy?.name || 'NGO Team'}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => unsave(item._id)} style={styles.saveBtn} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                <Ionicons name="bookmark" size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F9FA' },
  list: { padding: 16, paddingBottom: 40, flexGrow: 1 },
  loading: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 14, marginBottom: 12, padding: 10, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  main: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  thumbWrap: { position: 'relative' },
  thumb: { width: 82, height: 82, borderRadius: 10 },
  placeholder: { backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  play: { position: 'absolute', left: 31, top: 31, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,0.58)', justifyContent: 'center', alignItems: 'center' },
  copy: { flex: 1, marginLeft: 12 },
  title: { fontSize: 14, fontWeight: '700', color: '#1A1A2E', lineHeight: 19 },
  meta: { fontSize: 11, color: '#9CA3AF', marginTop: 4 },
  saveBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
});
