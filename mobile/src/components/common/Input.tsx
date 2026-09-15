import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { Colors } from '../../constants/colors';
import { Theme } from '../../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  style,
  ...props
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.inputContainer, 
        error ? styles.inputError : null,
        props.multiline && styles.multilineContainer
      ]}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          style={[styles.input, props.multiline && styles.multilineInput, style]}
          placeholderTextColor={Colors.textMuted}
          {...props}
        />
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Theme.spacing.lg,
  },
  label: {
    fontSize: Theme.typography.size.sm,
    fontWeight: Theme.typography.weight.medium,
    color: Colors.textPrimary,
    marginBottom: Theme.spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Colors.white,
    minHeight: 48,
  },
  inputError: {
    borderColor: Colors.error,
  },
  multilineContainer: {
    alignItems: 'flex-start',
  },
  leftIcon: {
    paddingLeft: Theme.spacing.md,
  },
  rightIcon: {
    paddingRight: Theme.spacing.md,
  },
  input: {
    flex: 1,
    paddingHorizontal: Theme.spacing.md,
    fontSize: Theme.typography.size.md,
    color: Colors.textPrimary,
    minHeight: 48,
  },
  multilineInput: {
    minHeight: 120,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.md,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: Theme.typography.size.xs,
    color: Colors.error,
    marginTop: Theme.spacing.xs,
  },
});
