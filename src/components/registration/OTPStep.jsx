// src/components/registration/OTPStep.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import OTPInput from '../common/OTPInput';
import { THEME } from '../../themes/colors';

const OTPStep = ({
  otp,
  setOtp,
  phoneNumber,
  formatPhoneNumber,
  errors,
  clearFieldError,
  onChangeNumber,
}) => {
  return (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <View style={styles.iconContainer}>
          <Text style={styles.stepIcon}>🔐</Text>
        </View>
        <Text style={styles.stepTitle}>Enter Verification Code</Text>
        <Text style={styles.stepSubtitle}>
          6-digit code sent to +91 {formatPhoneNumber(phoneNumber)}
        </Text>
      </View>

      <View style={styles.inputCard}>
        <OTPInput
          code={otp}
          setCode={setOtp}
          maxLength={6}
          onComplete={() => {}}
          error={!!errors.otp}
          clearError={() => clearFieldError('otp')}
        />

        {errors.otp && <Text style={styles.errorText}>{errors.otp}</Text>}

        <TouchableOpacity
          style={styles.resendContainer}
          onPress={onChangeNumber}
        >
          <Text style={styles.resendText}>Didn't receive the code? </Text>
          <Text style={styles.resendLink}>Change number</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 32,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: THEME.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: THEME.shadowLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: THEME.borderLight,
  },
  stepIcon: {
    fontSize: 32,
  },
  stepTitle: {
    fontSize: 25,
    fontWeight: '700',
    color: THEME.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  stepSubtitle: {
    fontSize: 16,
    color: THEME.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  inputCard: {
    backgroundColor: THEME.surface,
    borderRadius: 20,
    padding: 18,
    shadowColor: THEME.shadowLight,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: THEME.borderLight,
  },
  errorText: {
    color: THEME.error,
    fontSize: 13,
    marginTop: 6,
    paddingLeft: 8,
    textAlign: 'center',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  resendText: {
    color: THEME.textSecondary,
    fontSize: 14,
  },
  resendLink: {
    color: THEME.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default OTPStep;
