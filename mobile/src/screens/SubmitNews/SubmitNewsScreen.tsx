import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../constants/colors';
import { Theme } from '../../constants/theme';
import { Config } from '../../constants/config';
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { CategoryChip } from '../../components/news/CategoryChip';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { submitNewsThunk } from '../../store/slices/submissionsSlice';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../navigation/AppStack';

export const SubmitNewsScreen = () => {
  const [image, setImage] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('Community');
  
  const dispatch = useAppDispatch();
  const { submitting } = useAppSelector(state => state.submissions);
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  const categoryIcons: Record<string, string> = {
    Community: '👥',
    Education: '📚',
    Environment: '🌱',
    Health: '🏥',
    Events: '📅'
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !location || !date) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (isNaN(new Date(date).getTime())) {
      Alert.alert('Error', 'Invalid date format');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('location', location);
    formData.append('date', new Date(date).toISOString());
    formData.append('category', category);
    
    if (image) {
      const filename = image.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;
      
      formData.append('media', {
        uri: image,
        name: filename,
        type,
      } as any);
    }

    try {
      await dispatch(submitNewsThunk(formData)).unwrap();
      Alert.alert('Success', 'Your news has been submitted for review!', [
        { text: 'OK', onPress: () => navigation.navigate('MySubmissions') }
      ]);
    } catch (err: any) {
      const msg = typeof err === 'string' ? err : err?.message || 'Failed to submit news';
      Alert.alert('Error', msg);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header 
        showBack 
        title="Submit News" 
        subtitle="Share real stories from your community" 
      />
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity style={styles.uploadArea} onPress={pickImage}>
            {image ? (
              <Image source={{ uri: image }} style={styles.previewImage} />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Text style={styles.uploadIcon}>📷</Text>
                <Text style={styles.uploadTitle}>Add Photo</Text>
                <Text style={styles.uploadSubtitle}>Tap to upload</Text>
                <Text style={styles.uploadFormat}>JPG, PNG, MP4 up to 50MB</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.formSection}>
            <Input
              label="Headline *"
              placeholder="What's the main story?"
              value={title}
              onChangeText={setTitle}
            />

            <Input
              label="What happened? *"
              placeholder="Describe the event or situation..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              maxLength={1000}
            />
            <Text style={styles.charCount}>{description.length}/1000</Text>

            <Input
              label="Location *"
              placeholder="Where did this happen?"
              value={location}
              onChangeText={setLocation}
              leftIcon={<Text>📍</Text>}
            />

            <Input
              label="Date *"
              placeholder="YYYY-MM-DD"
              value={date}
              onChangeText={setDate}
              leftIcon={<Text>📅</Text>}
              keyboardType="numbers-and-punctuation"
            />

            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryGrid}>
              {Config.CATEGORIES.map(cat => (
                <CategoryChip
                  key={cat}
                  label={cat}
                  icon={categoryIcons[cat]}
                  selected={category === cat}
                  onPress={() => setCategory(cat)}
                />
              ))}
            </View>
          </View>

          <View style={styles.footer}>
            <Button
              title="Submit for Review"
              variant="accent"
              onPress={handleSubmit}
              loading={submitting}
              icon={<Text style={{ color: Colors.white, marginRight: 8 }}>📤</Text>}
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
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Theme.spacing.lg,
  },
  uploadArea: {
    height: 200,
    backgroundColor: Colors.backgroundGray,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: Theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  uploadPlaceholder: {
    alignItems: 'center',
  },
  uploadIcon: {
    fontSize: 40,
    marginBottom: Theme.spacing.sm,
  },
  uploadTitle: {
    fontSize: Theme.typography.size.lg,
    fontWeight: Theme.typography.weight.bold,
    color: Colors.textPrimary,
  },
  uploadSubtitle: {
    fontSize: Theme.typography.size.md,
    color: Colors.primary,
    marginTop: Theme.spacing.xs,
  },
  uploadFormat: {
    fontSize: Theme.typography.size.xs,
    color: Colors.textMuted,
    marginTop: Theme.spacing.xs,
  },
  formSection: {
    marginBottom: Theme.spacing.xl,
  },
  charCount: {
    fontSize: Theme.typography.size.xs,
    color: Colors.textMuted,
    textAlign: 'right',
    marginTop: -Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  label: {
    fontSize: Theme.typography.size.sm,
    fontWeight: Theme.typography.weight.medium,
    color: Colors.textPrimary,
    marginBottom: Theme.spacing.sm,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  footer: {
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.xxxl,
  },
  footerNote: {
    fontSize: Theme.typography.size.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Theme.spacing.md,
  },
});
