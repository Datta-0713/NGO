import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { loginThunk } from '../../store/slices/authSlice';
import { Colors } from '../../constants/colors';
import { Theme } from '../../constants/theme';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/AuthStack';
import { SafeAreaView } from 'react-native-safe-area-context';

export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  const handleLogin = () => {
    dispatch(loginThunk({ email, password }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.logoText}>NEXY</Text>
            <Text style={styles.logoSubtext}>Foundation</Text>
            <Text style={styles.heading}>Welcome Back</Text>
            <Text style={styles.subheading}>Log in to share your community stories</Text>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.form}>
            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Button
              title="Log In"
              onPress={handleLogin}
              loading={loading}
              style={styles.submitButton}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <Text 
                style={styles.linkText}
                onPress={() => navigation.navigate('Register')}
              >
                Register
              </Text>
            </View>
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
    flexGrow: 1,
    padding: Theme.spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Theme.spacing.giant,
  },
  logoText: {
    fontSize: 40,
    fontWeight: Theme.typography.weight.bold,
    color: Colors.primary,
    letterSpacing: 2,
  },
  logoSubtext: {
    fontSize: Theme.typography.size.lg,
    fontWeight: Theme.typography.weight.medium,
    color: Colors.primaryLight,
    marginBottom: Theme.spacing.xl,
  },
  heading: {
    fontSize: Theme.typography.size.xxl,
    fontWeight: Theme.typography.weight.bold,
    color: Colors.textPrimary,
    marginBottom: Theme.spacing.xs,
  },
  subheading: {
    fontSize: Theme.typography.size.md,
    color: Colors.textMuted,
  },
  errorContainer: {
    backgroundColor: Colors.error + '20',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.lg,
  },
  errorText: {
    color: Colors.error,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  submitButton: {
    marginTop: Theme.spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Theme.spacing.xxxl,
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: Theme.typography.size.md,
  },
  linkText: {
    color: Colors.primary,
    fontSize: Theme.typography.size.md,
    fontWeight: Theme.typography.weight.bold,
  },
});
