import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/config';
import { THEME } from '../../themes/colors';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

const VerifyOTPScreen = ({ navigation, route }) => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');

  const phoneNumber = route?.params?.phoneNumber || '9876543210';

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const inputRefs = useRef([]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [canResend]);

  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (value, index) => {
    if (error) setError('');
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    const finalOtp = newOtp.join('');
    if (finalOtp.length === 4) {
      Keyboard.dismiss();
      setTimeout(() => handleVerifyOTP(finalOtp), 100);
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const shakeAnimation = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleVerifyOTP = async (otpToVerify = otp.join('')) => {
    if (otpToVerify.length !== 4) {
      setError('Please enter a complete 4-digit OTP');
      shakeAnimation();
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${API_URL}/api/vendor/auth/login-verify-otp`,
        {
          contact_number: phoneNumber,
          otp: otpToVerify,
        },
      );

      if (response.data?.success) {
        const accessToken = response.data.data?.access_token;
        const vendorId = response.data.data?.vendor?.id;
        if (accessToken) {
          try {
            await AsyncStorage.setItem('@user_token', accessToken);
            await AsyncStorage.setItem('@user_phone_number', phoneNumber);
            await AsyncStorage.setItem('@vendor_id', vendorId.toString());
            navigation.navigate('AuthLoading');
          } catch (e) {
            console.error('Failed to save session:', e);
            setError('Login successful, but failed to save your session.');
            shakeAnimation();
          }
        } else {
          setError('Verification successful, but failed to create a session.');
          shakeAnimation();
        }
      } else {
        setError(response.data?.message || 'Invalid OTP. Please try again.');
        setOtp(['', '', '', '']);
        shakeAnimation();
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Verification failed. Please try again.',
      );
      shakeAnimation();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    setResendLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${API_URL}/api/vendor/auth/login-send-otp`,
        {
          contact_number: phoneNumber,
        },
      );

      if (response.data?.success) {
        Alert.alert(
          'OTP Sent!',
          'A new 4-digit OTP has been sent to your number.',
        );
        setCanResend(false);
        setTimeLeft(60);
      } else {
        Alert.alert('Error', response.data?.message || 'Failed to resend OTP.');
      }
    } catch (err) {
      Alert.alert(
        'Error',
        err.response?.data?.message ||
          'Failed to resend OTP. Please try again.',
      );
    } finally {
      setResendLoading(false);
    }
  };

  const formatPhoneNumber = phone => {
    if (phone.length === 10) {
      return `+91 ${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;
    }
    return `+91 ${phone}`;
  };

  const onBackPress = () => navigation.goBack();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <LinearGradient
          colors={THEME.primaryGradient || ['#74C6B7', '#4A9B8E']}
          style={styles.header}
        >
          <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Animated.View
            style={[
              styles.headerContent,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.otpIcon}>📱</Text>
            </View>
            <Text style={styles.mainTitle}>Verify Your Phone</Text>
            <Text style={styles.subtitle}>
              We've sent a 4-digit code to {'\n'}
              <Text style={styles.phoneNumber}>
                {formatPhoneNumber(phoneNumber)}
              </Text>
            </Text>
          </Animated.View>
        </LinearGradient>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.contentWrapper}>
              <Animated.View
                style={[
                  styles.formContainer,
                  {
                    opacity: fadeAnim,
                    transform: [
                      { translateY: slideAnim },
                      { translateX: shakeAnim },
                    ],
                  },
                ]}
              >
                <Text style={styles.otpLabel}>Enter Verification Code</Text>
                <View style={styles.otpInputContainer}>
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={ref => (inputRefs.current[index] = ref)}
                      style={[
                        styles.otpInput,
                        digit && styles.otpInputFilled,
                        error && styles.otpInputError,
                      ]}
                      value={digit}
                      onChangeText={value => handleOtpChange(value, index)}
                      onKeyPress={e => handleKeyPress(e, index)}
                      keyboardType="numeric"
                      maxLength={1}
                      selectTextOnFocus
                      autoFocus={index === 0}
                    />
                  ))}
                </View>

                {error ? (
                  <Text style={styles.errorText}>{error}</Text>
                ) : (
                  <View style={styles.errorPlaceholder} />
                )}

                <View style={styles.resendContainer}>
                  {!canResend ? (
                    <Text style={styles.timerText}>
                      Resend code in {formatTime(timeLeft)}
                    </Text>
                  ) : (
                    <TouchableOpacity
                      onPress={handleResendOTP}
                      disabled={resendLoading}
                      style={styles.resendButton}
                    >
                      {resendLoading ? (
                        <ActivityIndicator size="small" color={THEME.primary} />
                      ) : (
                        <Text style={styles.resendText}>Resend Code</Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </Animated.View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>

        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[
              styles.verifyButton,
              (otp.join('').length !== 4 || isLoading) &&
                styles.verifyButtonDisabled,
            ]}
            onPress={() => handleVerifyOTP()}
            disabled={otp.join('').length !== 4 || isLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                otp.join('').length !== 4 || isLoading
                  ? ['#BDBDBD', '#BDBDBD']
                  : ['#74C6B7', '#74C6B7']
              }
              style={styles.buttonGradient}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.verifyButtonText}>Verify & Continue</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    height: height * 0.32,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 28,
    color: THEME.textOnPrimary || '#FFFFFF',
    fontWeight: 'bold',
  },
  headerContent: {
    alignItems: 'center',
    paddingTop: 20,
  },
  iconContainer: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.background,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 16,
  },
  otpIcon: {
    fontSize: 36,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: THEME.textOnPrimary || '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },
  phoneNumber: {
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  scrollContent: {
    paddingBottom: 20,
    minHeight: height * 0.4,
  },
  contentWrapper: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  formContainer: {
    backgroundColor: THEME.surface || THEME.background,
    borderRadius: 20,
    padding: 28,
    marginTop: 0,
    shadowColor: THEME.shadow || '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: THEME.borderLight || 'rgba(0,0,0,0.1)',
    marginBottom: 20,
  },
  otpLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.textPrimary,
    marginBottom: 28,
    textAlign: 'center',
    paddingTop: 4,
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  otpInput: {
    width: (width - 160) / 4,
    height: 56,
    borderWidth: 1.5,
    borderColor: THEME.border,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '600',
    color: THEME.textPrimary,
    backgroundColor: THEME.surface || '#FFFFFF',
  },
  otpInputFilled: {
    borderColor: THEME.primary,
  },
  otpInputError: {
    borderColor: THEME.error,
    backgroundColor: `${THEME.error}1A`,
  },
  errorText: {
    fontSize: 14,
    color: THEME.error,
    textAlign: 'center',
    lineHeight: 18,
    minHeight: 40,
    paddingTop: 10,
  },
  errorPlaceholder: {
    height: 40,
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingBottom: 24,
  },
  timerText: {
    fontSize: 14,
    color: THEME.textSecondary,
    textAlign: 'center',
  },
  resendButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  resendText: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME.primary,
  },
  bottomContainer: {
    padding: 20,
    paddingTop: 16,
    backgroundColor: THEME.background,
    borderTopWidth: 1,
    borderTopColor: THEME.borderLight || 'rgba(0,0,0,0.1)',
  },
  verifyButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: THEME.shadow || '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  verifyButtonDisabled: {
    shadowOpacity: 0.1,
    elevation: 2,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VerifyOTPScreen;
