import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import OTPInput from '../common/OTPInput';
import { THEME } from '../../themes/colors';
import { useRegistrationContext } from '../../context/RegistrationContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375 || screenHeight < 667;

const OTPStep = () => {
  const {
    otp,
    setOtp,
    phoneNumber,
    formatPhoneNumber,
    errors,
    clearFieldError,
    onChangeNumber,
  } = useRegistrationContext();
  return (
    <View style={styles.stepContainer}>
      <View
        style={[styles.stepHeader, isSmallScreen && styles.stepHeaderSmall]}
      >
        <View
          style={[
            styles.iconContainer,
            isSmallScreen && styles.iconContainerSmall,
          ]}
        >
          <Text
            style={[styles.stepIcon, isSmallScreen && styles.stepIconSmall]}
          >
            🔐
          </Text>
        </View>
        <Text
          style={[styles.stepTitle, isSmallScreen && styles.stepTitleSmall]}
        >
          Enter Verification Code
        </Text>
        {/* --- MODIFIED: Changed text to "4-digit" --- */}
        <Text
          style={[
            styles.stepSubtitle,
            isSmallScreen && styles.stepSubtitleSmall,
          ]}
        >
          A 4-digit code was sent to{'\n'}+91 {formatPhoneNumber(phoneNumber)}
        </Text>
      </View>

      <View style={[styles.inputCard, isSmallScreen && styles.inputCardSmall]}>
        <View style={styles.otpContainer}>
          <OTPInput
            code={otp}
            setCode={setOtp}
            maxLength={4}
            error={!!errors.otp}
            clearError={() => clearFieldError('otp')}
          />
        </View>

        {errors.otp && (
          <Text
            style={[styles.errorText, isSmallScreen && styles.errorTextSmall]}
          >
            {errors.otp}
          </Text>
        )}

        <TouchableOpacity
          style={[
            styles.resendContainer,
            isSmallScreen && styles.resendContainerSmall,
          ]}
          onPress={onChangeNumber}
        >
          <Text
            style={[styles.resendText, isSmallScreen && styles.resendTextSmall]}
          >
            Didn't receive the code?
          </Text>
          <Text
            style={[styles.resendLink, isSmallScreen && styles.resendLinkSmall]}
          >
            Change number
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
    paddingHorizontal: 4,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 20,
    paddingHorizontal: 16,
  },
  stepHeaderSmall: {
    marginBottom: 20,
    marginTop: 12,
    paddingHorizontal: 12,
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
  iconContainerSmall: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 16,
    shadowRadius: 8,
    elevation: 6,
  },
  stepIcon: {
    fontSize: 32,
  },
  stepIconSmall: {
    fontSize: 28,
  },
  stepTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: THEME.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  stepTitleSmall: {
    fontSize: 22,
    marginBottom: 6,
    lineHeight: 28,
    paddingHorizontal: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: THEME.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  stepSubtitleSmall: {
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  inputCard: {
    backgroundColor: THEME.surface,
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 4,
    shadowColor: THEME.shadowLight,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: THEME.borderLight,
  },
  inputCardSmall: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 0,
    shadowRadius: 12,
    elevation: 6,
  },
  otpContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: isSmallScreen ? 8 : 16,
  },
  errorText: {
    color: THEME.error,
    fontSize: 13,
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  errorTextSmall: {
    fontSize: 12,
    marginTop: 12,
    lineHeight: 16,
    paddingHorizontal: 4,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 24,
    paddingHorizontal: 8,
    flexWrap: 'wrap',
  },
  resendContainerSmall: {
    paddingTop: 18,
    paddingHorizontal: 4,
  },
  resendText: {
    color: THEME.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  resendTextSmall: {
    fontSize: 13,
  },
  resendLink: {
    color: THEME.primary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  resendLinkSmall: {
    fontSize: 13,
  },
});

export default OTPStep;
