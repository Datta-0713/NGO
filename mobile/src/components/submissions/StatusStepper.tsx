import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

interface StatusStepperProps {
  status: 'pending' | 'under_review' | 'published' | 'rejected';
}

export const StatusStepper: React.FC<StatusStepperProps> = ({ status }) => {
  const steps = [
    { id: 'submitted', label: 'Submitted' },
    { id: 'review',    label: 'Under Review' },
    { id: 'final',     label: status === 'rejected' ? 'Not Published' : 'Published' },
  ];

  const currentStep = status === 'pending' ? 1 : 2;
  const isRejected = status === 'rejected';

  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const completed = index < currentStep;
        const current   = index === currentStep;
        const isLast    = index === steps.length - 1;
        const rejected  = isRejected && index === 2;

        return (
          <React.Fragment key={step.id}>
            <View style={styles.stepWrap}>
              <View style={[
                styles.circle,
                completed && styles.circleCompleted,
                current   && styles.circleCurrent,
                rejected  && styles.circleRejected,
              ]}>
                {completed ? (
                  <Ionicons name="checkmark" size={13} color="#fff" />
                ) : (
                  <View style={[
                    styles.dot,
                    current && (rejected ? styles.dotRejected : styles.dotCurrent),
                  ]} />
                )}
              </View>
              <Text style={[
                styles.label,
                current   && styles.labelCurrent,
                rejected  && styles.labelRejected,
              ]}>
                {step.label}
              </Text>
            </View>
            {!isLast && (
              <View style={[styles.line, completed ? styles.lineCompleted : styles.linePending]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  stepWrap: { alignItems: 'center', width: 80 },
  circle: {
    width: 26, height: 26, borderRadius: 13,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#E5E7EB',
    backgroundColor: '#fff', marginBottom: 6,
  },
  circleCompleted: { backgroundColor: Colors.success, borderColor: Colors.success },
  circleCurrent:   { borderColor: Colors.accent },
  circleRejected:  { borderColor: Colors.error },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'transparent' },
  dotCurrent:  { backgroundColor: Colors.accent },
  dotRejected: { backgroundColor: Colors.error },
  label: { fontSize: 11, color: '#9CA3AF', textAlign: 'center' },
  labelCurrent:  { color: Colors.accent, fontWeight: '700' },
  labelRejected: { color: Colors.error,  fontWeight: '700' },
  line: { flex: 1, height: 2, marginTop: -20, marginHorizontal: -10 },
  lineCompleted: { backgroundColor: Colors.success },
  linePending:   { backgroundColor: '#E5E7EB' },
});
