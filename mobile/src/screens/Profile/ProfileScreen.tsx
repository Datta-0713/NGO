import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { Avatar } from '../../components/common/Avatar';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { logoutThunk, updateProfileThunk } from '../../store/slices/authSlice';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../navigation/AppStack';
import { fetchCreditHistory } from '../../store/slices/profileSlice';
import { isValid } from 'date-fns';
import { format } from 'date-fns';
import type { CreditTransaction } from '../../types';

export const ProfileScreen = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { user, loading: authLoading } = useAppSelector(state => state.auth);
  const { creditHistory, loading: creditsLoading, error: creditsError } = useAppSelector(state => state.profile);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchCreditHistory({ page: 1, limit: 20 }));
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchCreditHistory({ page: 1, limit: 20 }));
    }, [dispatch])
  );

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!user) return null;

  // Sync edit fields from user data
  const handleFocusEditName = () => { setEditName(user.name); setEditBio(user.bio || ''); setEditModalOpen(true); };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => dispatch(logoutThunk()) },
    ]);
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const formData = new FormData();
      const asset = result.assets[0];
      formData.append('profilePhoto', {
        uri: asset.uri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      } as any);
      setSaving(true);
      await dispatch(updateProfileThunk(formData));
      setSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) { Alert.alert('Error', 'Name cannot be empty'); return; }
    setSaving(true);
    const formData = new FormData();
    formData.append('name', editName.trim());
    formData.append('bio', editBio.trim());
    await dispatch(updateProfileThunk(formData));
    setSaving(false);
    setEditModalOpen(false);
  };

  const safeDate = (d: string) => {
    const parsed = new Date(d);
    return isValid(parsed) ? format(parsed, 'MMM d, yyyy') : '';
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.screenTitle}>Profile</Text>
        <TouchableOpacity onPress={handleLogout} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="log-out-outline" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Profile header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Avatar url={user.profilePhoto} name={user.name} size={96} />
            <TouchableOpacity style={styles.cameraButton} onPress={handlePickImage}>
              {saving ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <Ionicons name="camera" size={16} color={Colors.primary} />
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.name}>{user.name}</Text>
          {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color="#9CA3AF" />
            <Text style={styles.location}>{user.location || 'Local Community'}</Text>
          </View>

          <TouchableOpacity
            style={styles.editProfileBtn}
            onPress={handleFocusEditName}
          >
            <Ionicons name="pencil-outline" size={14} color={Colors.primary} />
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{user.storiesCount ?? 0}</Text>
            <Text style={styles.statLabel}>STORIES</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{user.likesReceived ?? 0}</Text>
            <Text style={styles.statLabel}>LIKES</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{user.credits ?? 0}</Text>
            <Text style={styles.statLabel}>CREDITS</Text>
          </View>
        </View>

        {/* Activity shortcuts */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('MySubmissions')}>
            <View style={styles.actionIcon}><Ionicons name="document-text-outline" size={19} color={Colors.primary} /></View>
            <View style={styles.actionCopy}><Text style={styles.actionTitle}>My Submissions</Text><Text style={styles.actionSubtitle}>Track, revise, and resubmit your stories</Text></View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('SavedStories')}>
            <View style={styles.actionIcon}><Ionicons name="bookmark-outline" size={19} color={Colors.primary} /></View>
            <View style={styles.actionCopy}><Text style={styles.actionTitle}>Saved Stories</Text><Text style={styles.actionSubtitle}>Read the stories you bookmarked</Text></View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Credits Loading */}
        {creditsLoading && creditHistory.length === 0 && (
          <View style={styles.creditsSection}>
            <Text style={styles.sectionTitle}>Credits History</Text>
            {[1, 2, 3].map(i => (
              <View key={i} style={styles.creditSkeleton}>
                <View style={{ flex: 1 }}>
                  <LoadingSkeleton width="60%" height={14} />
                  <LoadingSkeleton width="40%" height={12} style={{ marginTop: 6 }} />
                </View>
                <LoadingSkeleton width={40} height={16} />
              </View>
            ))}
          </View>
        )}

        {/* Credits Error */}
        {creditsError && creditHistory.length === 0 && (
          <View style={styles.creditsSection}>
            <Text style={styles.sectionTitle}>Credits History</Text>
            <EmptyState
              title="Failed to load credits"
              description={creditsError}
              emoji="💳"
              actionLabel="Retry"
              onActionPress={() => dispatch(fetchCreditHistory({ page: 1, limit: 20 }))}
            />
          </View>
        )}

        {/* Credits History */}
        {creditHistory.length > 0 && !creditsLoading && (
          <View style={styles.creditsSection}>
            <Text style={styles.sectionTitle}>Credits History</Text>
            {creditHistory.map((t: CreditTransaction) => (
              <View key={t._id} style={styles.transactionItem}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionReason}>{t.reason?.replace(/_/g, ' ')}</Text>
                  <Text style={styles.transactionDate}>{safeDate(t.createdAt)}</Text>
                </View>
                <Text style={[styles.transactionAmount, t.type === 'credit' ? styles.amountPositive : styles.amountNegative]}>
                  {t.type === 'credit' ? '+' : '-'}{t.amount}
                </Text>
              </View>
            ))}
            {creditsError && (
              <TouchableOpacity onPress={() => dispatch(fetchCreditHistory({ page: 1, limit: 20 }))} style={styles.retryLink}>
                <Text style={styles.retryLinkText}>Something went wrong. Tap to retry.</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editModalOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setEditModalOpen(false)}>
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEditModalOpen(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={handleSaveProfile} disabled={saving}>
              {saving ? <ActivityIndicator size="small" color={Colors.primary} /> : <Text style={styles.modalSave}>Save</Text>}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.fieldLabel}>Full Name</Text>
            <TextInput
              style={styles.fieldInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Your name"
              placeholderTextColor="#9CA3AF"
            />
            <Text style={styles.fieldLabel}>Bio</Text>
            <TextInput
              style={[styles.fieldInput, styles.bioInput]}
              value={editBio}
              onChangeText={setEditBio}
              placeholder="Tell the community about yourself..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FA' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  screenTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A2E' },
  scrollContent: { paddingBottom: 40 },

  profileHeader: { alignItems: 'center', backgroundColor: '#fff', paddingTop: 28, paddingBottom: 20, marginBottom: 12 },
  avatarContainer: { position: 'relative', marginBottom: 14 },
  cameraButton: {
    position: 'absolute', bottom: 2, right: 2,
    backgroundColor: '#fff', width: 30, height: 30,
    borderRadius: 15, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 3, elevation: 3,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  name: { fontSize: 20, fontWeight: '700', color: '#1A1A2E', marginBottom: 4 },
  bio: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 6, paddingHorizontal: 32 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 14 },
  location: { fontSize: 13, color: '#9CA3AF' },
  editProfileBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: Colors.primary,
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 7,
  },
  editProfileText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },

  statsContainer: {
    flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 16,
    borderRadius: 14, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: '#F3F4F6' },
  statValue: { fontSize: 22, fontWeight: '700', color: '#1A1A2E', marginBottom: 3 },
  statLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '600', letterSpacing: 0.5 },

  tabsContainer: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 10,
    padding: 4, marginHorizontal: 16, marginBottom: 12,
  },
  tab: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: '#EDE9FE' },
  tabText: { fontSize: 14, fontWeight: '500', color: '#9CA3AF' },
  activeTabText: { color: '#6C3FC6', fontWeight: '700' },

  actionsSection: { backgroundColor: '#fff', borderRadius: 14, marginHorizontal: 16, marginBottom: 12, overflow: 'hidden', },
  actionRow: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  actionIcon: { width: 38, height: 38, borderRadius: 11, backgroundColor: '#F0FDF4', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  actionCopy: { flex: 1 },
  actionTitle: { fontSize: 14, fontWeight: '700', color: '#1A1A2E' },
  actionSubtitle: { fontSize: 11, color: '#9CA3AF', marginTop: 3 },

  tabContent: {
    backgroundColor: '#fff', borderRadius: 14, marginHorizontal: 16,
    paddingVertical: 32, alignItems: 'center', gap: 8, marginBottom: 12,
  },
  placeholderText: { color: '#9CA3AF', fontSize: 14 },

  creditsSection: {
    backgroundColor: '#fff', borderRadius: 14, marginHorizontal: 16,
    padding: 18, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A2E', marginBottom: 14 },
  transactionItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F9FAFB',
  },
  transactionInfo: { flex: 1 },
  transactionReason: { fontSize: 14, color: '#374151', fontWeight: '500', marginBottom: 2, textTransform: 'capitalize' },
  transactionDate: { fontSize: 12, color: '#9CA3AF' },
  transactionAmount: { fontSize: 16, fontWeight: '700' },
  amountPositive: { color: '#22C55E' },
  amountNegative: { color: '#EF4444' },
  creditSkeleton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  retryLink: { paddingVertical: 10, alignItems: 'center' },
  retryLinkText: { color: Colors.primary, fontSize: 13, fontWeight: '600' },

  modalSafe: { flex: 1, backgroundColor: '#fff' },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A2E' },
  modalCancel: { fontSize: 15, color: '#9CA3AF' },
  modalSave: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  modalContent: { padding: 20 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 16 },
  fieldInput: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#1A1A2E', backgroundColor: '#FAFAFA',
  },
  bioInput: { minHeight: 100, textAlignVertical: 'top' },
});
