import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Alert, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Theme } from '../../constants/theme';
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { submitNewsThunk } from '../../store/slices/submissionsSlice';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../navigation/AppStack';

const CATEGORIES = ['Community', 'Education', 'Environment', 'Health', 'Events'] as const;

interface MediaAsset {
  uri: string;
  type: 'image' | 'video';
  name: string;
  mimeType: string;
}

export const SubmitNewsScreen = () => {
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [title, setTitle]             = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation]       = useState('');
  const [date, setDate]               = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory]       = useState<string>('Community');

  const dispatch   = useAppDispatch();
  const { submitting } = useAppSelector(state => state.submissions);
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  // ── Pick images or videos from device library ────────────────────────────
  const pickMedia = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library to upload media.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All, // images + videos
      allowsMultipleSelection: true,
      selectionLimit: 5,
      quality: 0.8,
      videoMaxDuration: 120,
    });

    if (result.canceled) return;

    const newAssets: MediaAsset[] = result.assets.map(asset => {
      const ext  = asset.uri.split('.').pop() || 'jpg';
      const isVid = asset.type === 'video';
      return {
        uri: asset.uri,
        type: isVid ? 'video' : 'image',
        name: asset.fileName || `media_${Date.now()}.${ext}`,
        mimeType: isVid ? `video/${ext}` : `image/${ext}`,
      };
    });

    setMediaAssets(prev => [...prev, ...newAssets].slice(0, 5));
  };

  const removeAsset = (index: number) => {
    setMediaAssets(prev => prev.filter((_, i) => i !== index));
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !location.trim() || !date) {
      Alert.alert('Missing fields', 'Please fill in all required fields.');
      return;
    }
    if (isNaN(new Date(date).getTime())) {
      Alert.alert('Invalid date', 'Please enter a valid date.');
      return;
    }

    const formData = new FormData();
    formData.append('title',       title.trim());
    formData.append('description', description.trim());
    formData.append('location',    location.trim());
    formData.append('date',        new Date(date).toISOString());
    formData.append('category',    category);

    // Append each media file — React Native FormData needs uri/name/type object
    mediaAssets.forEach(asset => {
      formData.append('media', {
        uri:  asset.uri,
        name: asset.name,
        type: asset.mimeType,
      } as any);
    });

    try {
      await dispatch(submitNewsThunk(formData)).unwrap();
      Alert.alert(
        'Submitted!',
        'Your story has been sent for review. You\'ll be notified once it\'s approved.',
        [{ text: 'OK', onPress: () => navigation.navigate('MySubmissions') }]
      );
    } catch (err: any) {
      const msg = typeof err === 'string' ? err : err?.message || 'Failed to submit. Please try again.';
      Alert.alert('Submission failed', msg);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header showBack title="Submit News" subtitle="Share real stories from your community" />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* ── Media Upload Area ── */}
          <Text style={styles.sectionLabel}>Photos & Videos (up to 5)</Text>
          <View style={styles.mediaRow}>
            {mediaAssets.map((asset, i) => (
              <View key={i} style={styles.mediaThumbnailWrap}>
                <Image source={{ uri: asset.uri }} style={styles.mediaThumbnail} />
                {asset.type === 'video' && (
                  <View style={styles.videoOverlay}>
                    <Ionicons name="play-circle" size={22} color="#fff" />
                  </View>
                )}
                <TouchableOpacity style={styles.removeBtn} onPress={() => removeAsset(i)}>
                  <Ionicons name="close-circle" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}

            {mediaAssets.length < 5 && (
              <TouchableOpacity style={styles.addMediaBtn} onPress={pickMedia} activeOpacity={0.7}>
                <Ionicons name="camera-outline" size={28} color={Colors.primary} />
                <Text style={styles.addMediaText}>Add{'\n'}Media</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.mediaHint}>JPG · PNG · MP4 · MOV · up to 50 MB each</Text>

          {/* ── Form Fields ── */}
          <View style={styles.formSection}>
            <Input
              label="Headline *"
              placeholder="What happened? Write a clear headline"
              value={title}
              onChangeText={setTitle}
              maxLength={120}
            />
            <Text style={styles.charCount}>{title.length}/120</Text>

            <Input
              label="Full Story *"
              placeholder="Describe what happened in detail..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={5}
              maxLength={2000}
              style={{ minHeight: 110 }}
            />
            <Text style={styles.charCount}>{description.length}/2000</Text>

            <Input
              label="Location *"
              placeholder="City, Area or Address"
              value={location}
              onChangeText={setLocation}
            />

            <Input
              label="Date *"
              placeholder="YYYY-MM-DD"
              value={date}
              onChangeText={setDate}
              keyboardType="numeric"
            />
          </View>

          {/* ── Category ── */}
          <View style={styles.formSection}>
            <Text style={styles.sectionLabel}>Category *</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
                  onPress={() => setCategory(cat)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.categoryChipText, category === cat && styles.categoryChipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── Submit ── */}
          <View style={styles.footer}>
            {submitting && (
              <View style={styles.uploadingBanner}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.uploadingText}>
                  {mediaAssets.length > 0
                    ? `Uploading ${mediaAssets.length} file(s) to cloud — please wait…`
                    : 'Submitting your story…'}
                </Text>
              </View>
            )}

            <Button
              title={submitting ? 'Submitting…' : 'Submit for Review'}
              variant="accent"
              onPress={handleSubmit}
              loading={submitting}
              disabled={submitting}
            />
            <Text style={styles.footerNote}>
              Your submission will be reviewed by the NGO team before publishing.
            </Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea:       { flex: 1, backgroundColor: Colors.white },
  scrollContent:  { padding: 18, paddingBottom: 60 },

  sectionLabel: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 10 },

  mediaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  mediaThumbnailWrap: { width: 80, height: 80, borderRadius: 10, overflow: 'hidden', position: 'relative' },
  mediaThumbnail: { width: '100%', height: '100%' },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center', alignItems: 'center',
  },
  removeBtn: {
    position: 'absolute', top: 3, right: 3,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 10,
  },
  addMediaBtn: {
    width: 80, height: 80, borderRadius: 10,
    borderWidth: 2, borderColor: Colors.primary, borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center', gap: 3,
    backgroundColor: Colors.primaryXLight,
  },
  addMediaText: { fontSize: 11, color: Colors.primary, fontWeight: '600', textAlign: 'center' },
  mediaHint: { fontSize: 11, color: '#9CA3AF', marginBottom: 20 },

  formSection: { marginBottom: 20 },
  charCount: { fontSize: 11, color: '#9CA3AF', textAlign: 'right', marginTop: -8, marginBottom: 12 },

  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB',
  },
  categoryChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryXLight },
  categoryChipText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  categoryChipTextActive: { color: Colors.primary, fontWeight: '700' },

  footer: { marginTop: 8, gap: 10 },
  uploadingBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#EFF6FF', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: '#BFDBFE',
  },
  uploadingText: { flex: 1, fontSize: 13, color: '#1D4ED8' },
  footerNote: { fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 4 },
});
