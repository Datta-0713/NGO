import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Theme } from '../../constants/theme';

interface StatusStepperProps {
  status: 'pending' | 'under_review' | 'published' | 'rejected';
}

export const StatusStepper: React.FC<StatusStepperProps> = ({ status }) => {
  const steps = [
    { id: 'submitted', label: 'Submitted', sublabel: 'Received' },
    { id: 'review', label: 'Under Review', sublabel: 'Our team is reviewing' },
    { 
      id: 'final', 
      label: status === 'rejected' ? 'Not Published' : 'Published', 
      sublabel: status === 'published' ? 'Live on the feed!' : status === 'rejected' ? 'See feedback below' : 'You will be notified' 
    },
  ];

  const getStepState = (index: number) => {
    const statusOrder = { pending: 1, published: 2, rejected: 2 };
    const currentOrder = (statusOrder as any)[status] ?? 0;
    
    if (index < currentOrder) return 'completed';
    if (index === currentOrder) return 'current';
    return 'pending';
  };

  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const state = getStepState(index);
        const isLast = index === steps.length - 1;
        
        return (
          <React.Fragment key={step.id}>
            <View style={styles.stepContainer}>
              <View style={[
                styles.circle,
                state === 'completed' && styles.circleCompleted,
                state === 'current' && styles.circleCurrent,
                state === 'pending' && styles.circlePending,
                status === 'rejected' && state === 'current' && styles.circleRejected
              ]}>
                {state === 'completed' ? (
                  <Text style={styles.checkIcon}>✓</Text>
                ) : (
                  <View style={[
                    styles.innerDot,
                    state === 'current' && styles.innerDotCurrent,
                    status === 'rejected' && state === 'current' && styles.innerDotRejected
                  ]} />
                )}
              </View>
              <Text style={[
                styles.label,
                state === 'current' && styles.labelCurrent,
                status === 'rejected' && state === 'current' && styles.labelRejected
              ]}>
                {step.label}
              </Text>
            </View>
            
            {!isLast && (
              <View style={[
                styles.line,
                state === 'completed' ? styles.lineCompleted : styles.linePending
              ]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Theme.spacing.md,
  },
  stepContainer: {
    alignItems: 'center',
    width: 80,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: Theme.spacing.xs,
  },
  circleCompleted: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  circleCurrent: {
    backgroundColor: Colors.white,
    borderColor: Colors.accent,
  },
  circleRejected: {
    borderColor: Colors.error,
  },
  circlePending: {
    backgroundColor: Colors.white,
    borderColor: Colors.border,
  },
  innerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'transparent',
  },
  innerDotCurrent: {
    backgroundColor: Colors.accent,
  },
  innerDotRejected: {
    backgroundColor: Colors.error,
  },
  checkIcon: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  label: {
    fontSize: Theme.typography.size.xs,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  labelCurrent: {
    color: Colors.accent,
    fontWeight: Theme.typography.weight.bold,
  },
  labelRejected: {
    color: Colors.error,
  },
  line: {
    flex: 1,
    height: 2,
    marginTop: -20, 
    marginHorizontal: -10,
  },
  lineCompleted: {
    backgroundColor: Colors.success,
  },
  linePending: {
    backgroundColor: Colors.border,
  },
});
