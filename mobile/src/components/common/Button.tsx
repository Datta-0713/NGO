import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { Theme } from '../../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'accent' | 'outline' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return Colors.border;
    switch (variant) {
      case 'primary': return Colors.primary;
      case 'accent': return Colors.accent;
      case 'danger': return Colors.error;
      case 'outline': return 'transparent';
      default: return Colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return Colors.textMuted;
    if (variant === 'outline') return Colors.primary;
    return Colors.white;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        variant === 'outline' && styles.outlineButton,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: Theme.borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.xl,
    gap: Theme.spacing.sm,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  text: {
    fontSize: Theme.typography.size.md,
    fontWeight: Theme.typography.weight.semibold,
  },
});
