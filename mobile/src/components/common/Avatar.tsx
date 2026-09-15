import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Theme } from '../../constants/theme';

interface AvatarProps {
  url?: string;
  name: string;
  size?: number;
}

export const Avatar: React.FC<AvatarProps> = ({ url, name, size = 40 }) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}>
      {url ? (
        <Image source={{ uri: url }} style={[styles.image, { borderRadius: size / 2 }]} />
      ) : (
        <Text style={[styles.initials, { fontSize: size * 0.4 }]}>{initials}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initials: {
    color: Colors.white,
    fontWeight: Theme.typography.weight.bold,
  },
});
