import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Theme } from '../../constants/theme';
import { Header } from '../../components/common/Header';
import { Avatar } from '../../components/common/Avatar';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { logoutThunk } from '../../store/slices/authSlice';
import { fetchCreditHistory } from '../../store/slices/profileSlice';
import { format } from 'date-fns';
import type { CreditTransaction } from '../../types';

export const ProfileScreen = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { creditHistory } = useAppSelector(state => state.profile);
  
  const [activeTab, setActiveTab] = useState<'Submitted' | 'Published'>('Submitted');

  useEffect(() => {
    dispatch(fetchCreditHistory({ page: 1, limit: 10 }));
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logoutThunk());
  };

  if (!user) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header 
        title="Profile" 
        rightIcon={<Text style={{ fontSize: 24 }}>⚙️</Text>} 
        onRightPress={handleLogout}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Avatar url={user.profilePhoto} name={user.name} size={100} />
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.bio}>{user.bio || 'Community Contributor'}</Text>
          <Text style={styles.location}>📍 {user.location || 'Local Community'}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Stories</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>45</Text>
            <Text style={styles.statLabel}>Likes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{user.credits}</Text>
            <Text style={styles.statLabel}>Credits</Text>
          </View>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Submitted' && styles.activeTab]}
            onPress={() => setActiveTab('Submitted')}
          >
            <Text style={[styles.tabText, activeTab === 'Submitted' && styles.activeTabText]}>
              Submitted
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Published' && styles.activeTab]}
            onPress={() => setActiveTab('Published')}
          >
            <Text style={[styles.tabText, activeTab === 'Published' && styles.activeTabText]}>
              Published
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabContent}>
          {/* Using placeholder text for tabs as per generic mock */}
          <Text style={styles.placeholderText}>
            No {activeTab.toLowerCase()} stories found.
          </Text>
        </View>

        <View style={styles.creditsSection}>
          <Text style={styles.sectionTitle}>Credits History</Text>
          {creditHistory.map((transaction: CreditTransaction) => (
            <View key={transaction._id} style={styles.transactionItem}>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionReason}>{transaction.reason}</Text>
                <Text style={styles.transactionDate}>
                  {format(new Date(transaction.createdAt), 'MMM d, yyyy')}
                </Text>
              </View>
              <Text style={[
                styles.transactionAmount,
                transaction.amount > 0 ? styles.amountPositive : styles.amountNegative
              ]}>
                {transaction.amount > 0 ? '+' : ''}{transaction.amount}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.guidelinesLink}>
          <Text style={styles.guidelinesText}>Community Guidelines</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  scrollContent: {
    padding: Theme.spacing.lg,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Theme.spacing.md,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.white,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.sm,
  },
  editIcon: {
    fontSize: 16,
  },
  name: {
    fontSize: Theme.typography.size.xl,
    fontWeight: Theme.typography.weight.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  bio: {
    fontSize: Theme.typography.size.md,
    color: Colors.textSecondary,
    marginBottom: Theme.spacing.sm,
  },
  location: {
    fontSize: Theme.typography.size.sm,
    color: Colors.textMuted,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
    ...Theme.shadows.sm,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.borderLight,
  },
  statValue: {
    fontSize: Theme.typography.size.xl,
    fontWeight: Theme.typography.weight.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: Theme.typography.size.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.md,
    padding: 4,
    marginBottom: Theme.spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: Theme.spacing.sm,
    alignItems: 'center',
    borderRadius: Theme.borderRadius.sm,
  },
  activeTab: {
    backgroundColor: Colors.accentLight,
  },
  tabText: {
    fontSize: Theme.typography.size.sm,
    fontWeight: Theme.typography.weight.medium,
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.accent,
    fontWeight: Theme.typography.weight.bold,
  },
  tabContent: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.xl,
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  placeholderText: {
    color: Colors.textMuted,
  },
  creditsSection: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
    ...Theme.shadows.sm,
  },
  sectionTitle: {
    fontSize: Theme.typography.size.lg,
    fontWeight: Theme.typography.weight.bold,
    color: Colors.textPrimary,
    marginBottom: Theme.spacing.md,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionReason: {
    fontSize: Theme.typography.size.md,
    color: Colors.textPrimary,
    fontWeight: Theme.typography.weight.medium,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: Theme.typography.size.xs,
    color: Colors.textMuted,
  },
  transactionAmount: {
    fontSize: Theme.typography.size.lg,
    fontWeight: Theme.typography.weight.bold,
  },
  amountPositive: {
    color: Colors.success,
  },
  amountNegative: {
    color: Colors.error,
  },
  guidelinesLink: {
    alignItems: 'center',
    paddingVertical: Theme.spacing.md,
  },
  guidelinesText: {
    color: Colors.primary,
    fontSize: Theme.typography.size.sm,
    fontWeight: Theme.typography.weight.semibold,
  },
});
