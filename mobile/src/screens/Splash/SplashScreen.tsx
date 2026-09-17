import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { Colors } from '../../constants/colors';

interface Props {
  onFinish: () => void;
}

export const SplashScreen: React.FC<Props> = ({ onFinish }) => {
  const logoScale   = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // Logo pops in
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, useNativeDriver: true, tension: 80, friction: 7 }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      // Name fades in
      Animated.timing(textOpacity, { toValue: 1, duration: 350, delay: 100, useNativeDriver: true }),
      // Hold for 1s
      Animated.delay(900),
      // Fade everything out
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 0, duration: 350, useNativeDriver: true }),
        Animated.timing(textOpacity, { toValue: 0, duration: 350, useNativeDriver: true }),
      ]),
    ]).start(() => onFinish());
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoWrap, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <Image
          source={require('../../../assets/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
      <Animated.Text style={[styles.appName, { opacity: textOpacity }]}>
        Asian News Bureau
      </Animated.Text>
      <Animated.Text style={[styles.tagline, { opacity: textOpacity }]}>
        Real stories. Real people.
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    marginBottom: 20,
  },
  logo: {
    width: 110,
    height: 110,
    borderRadius: 24,
  },
  appName: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '400',
    letterSpacing: 0.3,
  },
});
