import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Colors } from '../../constants/colors';
import { Theme } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  rightIcon?: React.ReactNode;
  onRightPress?: () => void;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ 
  title = 'NEXY Foundation', 
  showBack = false, 
  rightIcon, 
  onRightPress,
  subtitle 
}) => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {showBack ? (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
            <Text style={styles.iconText}>←</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.iconPlaceholder} />
        )}

        <View style={styles.centerContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        {rightIcon ? (
          <TouchableOpacity onPress={onRightPress} style={styles.iconButton}>
            {rightIcon}
          </TouchableOpacity>
        ) : (
          <View style={styles.iconPlaceholder} />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Colors.white,
  },
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: Theme.typography.size.lg,
    fontWeight: Theme.typography.weight.bold,
    color: Colors.primary,
  },
  subtitle: {
    fontSize: Theme.typography.size.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 24,
    color: Colors.textPrimary,
  },
  iconPlaceholder: {
    width: 40,
  },
});
