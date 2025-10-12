// src/components/registration/PhoneStep.js
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { THEME } from '../../themes/colors';

const PhoneStep = ({
  phoneNumber,
  onPhoneChange,
  formatPhoneNumber,
  errors,
  isRateLimited,
  countdown,
}) => {
  return (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <View style={styles.iconContainer}>
          <Text style={styles.stepIcon}>📱</Text>
        </View>
        <Text style={styles.stepTitle}>Verify Your Number</Text>
        <Text style={styles.stepSubtitle}>
          We'll send a secure verification code to your mobile number
        </Text>
      </View>

      <View style={styles.inputCard}>
        <View
          style={[
            styles.phoneInputContainer,
            errors.phoneNumber && styles.inputError,
          ]}
        >
          <TextInput
            style={[
              styles.phoneInput,
              isRateLimited && { color: THEME.textTertiary },
            ]}
            placeholder="Enter mobile number"
            placeholderTextColor={THEME.placeholder}
            value={formatPhoneNumber(phoneNumber)}
            onChangeText={text => onPhoneChange(text.replace(/\s/g, ''))}
            keyboardType="phone-pad"
            maxLength={12}
            editable={!isRateLimited}
          />
        </View>

        {errors.phoneNumber && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errors.phoneNumber}</Text>
            {isRateLimited && countdown > 0 && (
              <View style={styles.countdownContainer}>
                <Text style={styles.countdownText}>
                  {Math.floor(countdown / 60)}:
                  {(countdown % 60).toString().padStart(2, '0')}
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.securityNote}>
          <Text style={styles.securityIcon}>🛡️</Text>
          <Text style={styles.securityText}>
            Your phone number is encrypted and secure
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
  },
  stepHeader: {
    marginTop: 32,
    alignItems: 'center',
    marginBottom: 32,
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
    fontSize: 26,
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
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.background,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: THEME.border,
    padding: 10,
    marginBottom: 16,
  },
  countrySection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
  },
  flagIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.primary,
  },
  separator: {
    width: 1,
    height: 24,
    backgroundColor: THEME.border,
    marginRight: 12,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: THEME.textPrimary,
    fontWeight: '500',
  },
  inputError: {
    borderColor: THEME.error,
    borderWidth: 2,
    backgroundColor: `${THEME.error}08`,
  },
  errorContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  errorText: {
    color: THEME.error,
    fontSize: 13,
    marginTop: 6,
    paddingLeft: 8,
    textAlign: 'center',
  },
  countdownContainer: {
    backgroundColor: THEME.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  countdownText: {
    color: THEME.textOnPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.primarySurface,
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: THEME.primaryBorder,
  },
  securityIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  securityText: {
    flex: 1,
    fontSize: 13,
    color: THEME.textSecondary,
    lineHeight: 18,
  },
});

export default PhoneStep;
