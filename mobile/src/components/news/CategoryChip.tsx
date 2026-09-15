import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Theme } from '../../constants/theme';

interface CategoryChipProps {
  label: string;
  icon?: string;
  selected?: boolean;
  onPress: () => void;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({ label, icon, selected, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    backgroundColor: Colors.backgroundGray,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },
  chipSelected: {
    backgroundColor: Colors.accentLight,
    borderColor: Colors.accent,
  },
  icon: {
    marginRight: Theme.spacing.xs,
    fontSize: Theme.typography.size.md,
  },
  label: {
    fontSize: Theme.typography.size.sm,
    fontWeight: Theme.typography.weight.medium,
    color: Colors.textSecondary,
  },
  labelSelected: {
    color: Colors.accent,
    fontWeight: Theme.typography.weight.bold,
  },
});
