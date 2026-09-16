import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

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
  secureTextEntry,
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPassword = secureTextEntry === true;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, error ? styles.inputError : null, props.multiline && styles.multilineContainer]}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <TextInput
          style={[styles.input, props.multiline && styles.multilineInput, style]}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={isPassword && !isPasswordVisible}
          {...props}
        />

        {isPassword ? (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(v => !v)}
            style={styles.eyeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye' : 'eye-off'}
              size={20}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        ) : (
          rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#fff',
    minHeight: 48,
  },
  inputError: { borderColor: Colors.error },
  multilineContainer: { alignItems: 'flex-start' },
  leftIcon: { paddingLeft: 14 },
  rightIcon: { paddingRight: 14 },
  eyeButton: {
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    height: 48,
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#1A1A2E',
    minHeight: 48,
  },
  multilineInput: {
    minHeight: 120,
    paddingTop: 14,
    paddingBottom: 14,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 4,
  },
});
