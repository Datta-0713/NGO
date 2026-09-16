import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  showLogo?: boolean;
  rightIcon?: React.ReactNode;
  onRightPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'NEXY Foundation',
  subtitle,
  showBack = false,
  showLogo = false,
  rightIcon,
  onRightPress,
}) => {
  const navigation = useNavigation();

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.container}>
        {/* Left: back button or logo+title */}
        {showBack ? (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.brandRow}>
            {showLogo && (
              <View style={styles.logoContainer}>
                <Ionicons name="leaf" size={22} color={Colors.primary} />
              </View>
            )}
            <View>
              <Text style={styles.title}>{title}</Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
          </View>
        )}

        {/* Right icon */}
        {rightIcon ? (
          <TouchableOpacity onPress={onRightPress} style={styles.rightButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            {rightIcon}
          </TouchableOpacity>
        ) : null}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#fff',
  },
  container: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#D8F3DC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
  },
  backButton: {
    marginRight: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  rightButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
