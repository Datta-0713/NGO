import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { StatusStepper } from '../../components/submissions/StatusStepper';
import { EmptyState } from '../../components/common/EmptyState';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { fetchMySubmissions } from '../../store/slices/submissionsSlice';
import { isValid, format } from 'date-fns';
import type { NewsItem } from '../../types';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../navigation/AppStack';

const safeDate = (d: string) => {
  const p = new Date(d);
  return isValid(p) ? format(p, 'MMM d') : '';
};

const StatusBadge = ({ status }: { status: NewsItem['status'] }) => {
  const map: Record<string, { label: string; color: string }> = {
    published: { label: 'Published', color: Colors.success },
    rejected:  { label: 'Rejected',  color: Colors.error   },
    under_review: { label: 'Under Review', color: Colors.warning },
    needs_changes: { label: 'Changes Needed', color: Colors.accent },
    pending:   { label: 'Under Review', color: Colors.warning },
  };
  const s = map[status] ?? map.pending;
  return (
    <View style={[styles.badge, { backgroundColor: s.color }]}>
      <Text style={styles.badgeText}>{s.label}</Text>
    </View>
  );
};

const FeedbackCard = ({ status, rejectionMessage }: { status: NewsItem['status']; rejectionMessage?: string }) => {
  if (status === 'pending') {
    return (
      <View style={[styles.feedbackCard, { backgroundColor: '#F0FDF4' }]}>
        <Ionicons name="time-outline" size={20} color={Colors.primary} style={{ marginRight: 10, marginTop: 1 }} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.feedbackTitle, { color: Colors.primary }]}>Thank you for contributing!</Text>
          <Text style={[styles.feedbackText, { color: '#166534' }]}>
            Our team is carefully reviewing your submission to ensure it meets community guidelines.
          </Text>
        </View>
      </View>
    );
  }
  if (status === 'rejected') {
    return (
      <View style={[styles.feedbackCard, { backgroundColor: '#FEF2F2' }]}>
        <Ionicons name="information-circle-outline" size={20} color={Colors.error} style={{ marginRight: 10, marginTop: 1 }} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.feedbackTitle, { color: Colors.error }]}>Almost there!</Text>
          <Text style={[styles.feedbackText, { color: '#991B1B' }]}>
            {rejectionMessage || 'Your story needs a small tweak before it can be published.'}
          </Text>
        </View>
      </View>
    );
  }
  return null;
};

export const MySubmissionsScreen = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { mySubmissions, loading } = useAppSelector(state => state.submissions);

  useEffect(() => {
    dispatch(fetchMySubmissions({ page: 1, limit: 20 }));
  }, [dispatch]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header showBack title="My Submissions" subtitle="Track the status of your stories" />

      <FlatList
        data={mySubmissions}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              title="No submissions yet"
              description="Share your first story with the community!"
              emoji=""
            />
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* Header row */}
            <View style={styles.cardHeader}>
              {item.media?.[0]?.url ? (
                <Image source={{ uri: item.media[0].url }} style={styles.thumbnail} />
              ) : (
                <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
                  <Ionicons name="image-outline" size={24} color="#D1D5DB" />
                </View>
              )}
              <View style={styles.headerInfo}>
                <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                <View style={styles.metaRow}>
                  <Ionicons name="location-outline" size={12} color="#9CA3AF" />
                  <Text style={styles.meta}>  {item.location}  ·  {safeDate(item.createdAt)}</Text>
                </View>
              </View>
              <StatusBadge status={item.status} />
            </View>

            <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Submission Status</Text>
            <StatusStepper status={item.status} />

            <FeedbackCard status={item.status} rejectionMessage={item.rejectionMessage} />
            {(item.status === 'needs_changes' || item.status === 'rejected') && (
              <TouchableOpacity style={styles.resubmitBtn} onPress={() => navigation.navigate('ResubmitNews', { id: item._id })}>
                <Ionicons name="create-outline" size={16} color={Colors.primary} />
                <Text style={styles.resubmitText}>Edit & Resubmit</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FA' },
  listContent: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', marginBottom: 12, gap: 12 },
  thumbnail: { width: 64, height: 64, borderRadius: 10, flexShrink: 0 },
  thumbnailPlaceholder: { backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  headerInfo: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 14, fontWeight: '700', color: '#1A1A2E', marginBottom: 5 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  meta: { fontSize: 12, color: '#9CA3AF' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start', flexShrink: 0 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  description: { fontSize: 13, color: '#6B7280', marginBottom: 12, lineHeight: 18 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 12 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 4 },
  feedbackCard: { flexDirection: 'row', padding: 12, borderRadius: 10, marginTop: 12 },
  feedbackTitle: { fontSize: 13, fontWeight: '700', marginBottom: 3 },
  feedbackText: { fontSize: 12, lineHeight: 17 },
  resubmitBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: Colors.primary, borderRadius: 10, paddingVertical: 10, marginTop: 12 },
  resubmitText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
});
