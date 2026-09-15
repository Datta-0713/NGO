import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Theme } from '../../constants/theme';
import { Header } from '../../components/common/Header';
import { StatusStepper } from '../../components/submissions/StatusStepper';
import { EmptyState } from '../../components/common/EmptyState';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { fetchMySubmissions } from '../../store/slices/submissionsSlice';
import { format } from 'date-fns';
import type { NewsItem } from '../../types';

export const MySubmissionsScreen = () => {
  const dispatch = useAppDispatch();
  const { mySubmissions, loading } = useAppSelector(state => state.submissions);

  useEffect(() => {
    dispatch(fetchMySubmissions({ page: 1, limit: 20 }));
  }, [dispatch]);

  const getStatusBadge = (status: NewsItem['status']) => {
    let bgColor: string = Colors.pending;
    let label = 'Pending Review';

    if (status === 'published') {
      bgColor = Colors.published;
      label = 'Published';
    } else if (status === 'rejected') {
      bgColor = Colors.rejected;
      label = 'Rejected';
    }

    return (
      <View style={[styles.badge, { backgroundColor: bgColor }]}>
        <Text style={styles.badgeText}>{label}</Text>
      </View>
    );
  };

  const renderFeedbackMessage = (status: NewsItem['status'], rejectionReason?: string) => {
    if (status === 'pending') {
      return (
        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackIcon}>🛡️</Text>
          <View style={styles.feedbackContent}>
            <Text style={styles.feedbackTitle}>Thank you for contributing!</Text>
            <Text style={styles.feedbackText}>
              Our NGO team is carefully reviewing your submission to ensure it meets community guidelines.
            </Text>
          </View>
        </View>
      );
    }
    if (status === 'rejected') {
      return (
        <View style={[styles.feedbackCard, styles.feedbackCardError]}>
          <Text style={styles.feedbackIcon}>⚠️</Text>
          <View style={styles.feedbackContent}>
            <Text style={styles.feedbackTitleError}>Almost there!</Text>
            <Text style={styles.feedbackTextError}>
              {rejectionReason || 'Your story needs a small tweak before it can be published.'}
            </Text>
          </View>
        </View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header 
        showBack 
        title="My Submissions" 
        subtitle="Track the status of news you've submitted" 
      />
      
      <FlatList
        data={mySubmissions}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading ? (
            <EmptyState 
              title="No submissions yet" 
              description="Share your first story with the community!"
              emoji="📝"
            />
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              {item.media?.[0]?.url ? (
                <Image source={{ uri: item.media[0].url }} style={styles.thumbnail} />
              ) : (
                <View style={[styles.thumbnail, styles.thumbnailPlaceholder]} />
              )}
              <View style={styles.headerInfo}>
                <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.meta}>
                  📍 {item.location} • {format(new Date(item.createdAt), 'MMM d')}
                </Text>
              </View>
              {getStatusBadge(item.status)}
            </View>
            
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>

            <View style={styles.divider} />
            
            <Text style={styles.sectionTitle}>Submission Status</Text>
            <StatusStepper status={item.status} />
            
            {renderFeedbackMessage(item.status, item.rejectionMessage)}

            <View style={styles.helpRow}>
              <Text style={styles.helpText}>Have questions?</Text>
              <Text style={styles.helpArrow}>→</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  listContent: {
    padding: Theme.spacing.md,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
    ...Theme.shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: Theme.spacing.md,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: Theme.borderRadius.md,
    marginRight: Theme.spacing.md,
  },
  thumbnailPlaceholder: {
    backgroundColor: Colors.backgroundGray,
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: Theme.typography.size.md,
    fontWeight: Theme.typography.weight.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  meta: {
    fontSize: Theme.typography.size.xs,
    color: Colors.textMuted,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.full,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: Theme.typography.weight.bold,
  },
  description: {
    fontSize: Theme.typography.size.sm,
    color: Colors.textSecondary,
    marginBottom: Theme.spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Theme.spacing.md,
  },
  sectionTitle: {
    fontSize: Theme.typography.size.sm,
    fontWeight: Theme.typography.weight.bold,
    color: Colors.textPrimary,
    marginBottom: Theme.spacing.md,
  },
  feedbackCard: {
    flexDirection: 'row',
    backgroundColor: Colors.primaryXLight,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginTop: Theme.spacing.md,
  },
  feedbackCardError: {
    backgroundColor: Colors.error + '10',
  },
  feedbackIcon: {
    fontSize: 24,
    marginRight: Theme.spacing.sm,
  },
  feedbackContent: {
    flex: 1,
  },
  feedbackTitle: {
    fontSize: Theme.typography.size.sm,
    fontWeight: Theme.typography.weight.bold,
    color: Colors.primary,
    marginBottom: 4,
  },
  feedbackTitleError: {
    fontSize: Theme.typography.size.sm,
    fontWeight: Theme.typography.weight.bold,
    color: Colors.error,
    marginBottom: 4,
  },
  feedbackText: {
    fontSize: Theme.typography.size.xs,
    color: Colors.primary,
    opacity: 0.9,
  },
  feedbackTextError: {
    fontSize: Theme.typography.size.xs,
    color: Colors.error,
  },
  helpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  helpText: {
    fontSize: Theme.typography.size.sm,
    color: Colors.textSecondary,
  },
  helpArrow: {
    fontSize: 16,
    color: Colors.textMuted,
  },
});
