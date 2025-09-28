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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { API_URL } from '../../config/config'; // Make sure this path is correct

const { width } = Dimensions.get('window');

const VerifyOTPScreen = ({ navigation, route }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');

  const phoneNumber = route?.params?.phoneNumber || '9876543210';

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const otpSlideAnim = useRef(new Animated.Value(30)).current;

  const inputRefs = useRef([]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(otpSlideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer); // Stop the interval when time is up
          setCanResend(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [canResend]); // Rerun timer logic if canResend changes (e.g., after resending)

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

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    const finalOtp = newOtp.join('');
    if (finalOtp.length === 6) {
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
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const handleVerifyOTP = async (otpToVerify = otp.join('')) => {
    if (otpToVerify.length !== 6) {
      setError('Please enter a complete 6-digit OTP');
      shakeAnimation();
      return;
    }

    setIsLoading(true);
    setError('');

    Animated.spring(buttonScale, { toValue: 0.95, useNativeDriver: true }).start(() => {
      Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true }).start();
    });

    try {
      const response = await axios.post(`${API_URL}/api/vendor/auth/login-verify-otp`, {
        contact_number: phoneNumber,
        otp: otpToVerify,
      });

      if (response.data?.success) {
        // Handle successful login, e.g., store token, navigate to home
        // For now, navigating to 'Subscription' as per original code
        navigation.navigate('Subscription');
      } else {
        setError(response.data?.message || 'Invalid OTP. Please try again.');
        setOtp(['', '', '', '', '', '']);
        shakeAnimation();
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
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
      // Calling the login OTP endpoint to resend the code
      const response = await axios.post(`${API_URL}/api/vendor/auth/login-send-otp`, {
        contact_number: phoneNumber,
      });

      if (response.data?.success) {
        Alert.alert('OTP Sent!', `A new 6-digit OTP has been sent to your number.`);
        setCanResend(false);
        setTimeLeft(60); // Restart the timer
      } else {
        Alert.alert('Error', response.data?.message || 'Failed to resend OTP.');
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to resend OTP. Please try again.');
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

  const onBackPress = () => {
    navigation.goBack();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <View style={styles.content}>
          <Animated.View
            style={[
              styles.headerSection,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <View style={styles.iconContainer}>
              <Text style={styles.otpIcon}>📱</Text>
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.mainTitle}>Verify Your Phone</Text>
              <Text style={styles.subtitle}>
                We've sent a 6-digit code to{'\n'}
                <Text style={styles.phoneNumber}>
                  {formatPhoneNumber(phoneNumber)}
                </Text>
              </Text>
            </View>
          </Animated.View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}
          >
            <Animated.View
              style={[
                styles.otpSection,
                {
                  opacity: fadeAnim,
                  transform: [
                    { translateY: otpSlideAnim },
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
                <View style={{ height: 34 }} /> // Placeholder for consistent spacing
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
                      <ActivityIndicator size="small" color="#4285f4" />
                    ) : (
                      <Text style={styles.resendText}>Resend Code</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>
          </KeyboardAvoidingView>

          <Animated.View
            style={[
              styles.bottomSection,
              {
                opacity: fadeAnim,
                transform: [{ scale: buttonScale }, { translateY: slideAnim }],
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.verifyButton,
                (otp.join('').length !== 6 || isLoading) &&
                  styles.verifyButtonDisabled,
              ]}
              onPress={() => handleVerifyOTP()}
              disabled={otp.join('').length !== 6 || isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Text style={styles.verifyButtonText}>Verify & Continue</Text>
                  <Text style={styles.arrowIcon}>→</Text>
                </>
              )}
            </TouchableOpacity>
            <Text style={styles.helpText}>
              Didn't receive the code?{' '}
              <Text style={styles.linkText}>Contact Support</Text>
            </Text>
          </Animated.View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

// --- STYLES (UNMODIFIED) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
    justifyContent: 'space-between',
  },
  headerSection: {
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
    padding: 8,
  },
  backIcon: {
    fontSize: 28,
    color: '#1a1a1a',
    fontWeight: 'bold',
  },
  iconContainer: {
    width: width * 0.25,
    height: width * 0.25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 32,
    marginTop: 80,
  },
  otpIcon: {
    fontSize: width * 0.12,
  },
  titleContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  mainTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  phoneNumber: {
    color: '#4285f4',
    fontWeight: '600',
  },
  keyboardAvoidingView: {
    flex: 0.4,
  },
  otpSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 32,
    textAlign: 'center',
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    width: '100%',
    maxWidth: 280,
  },
  otpInput: {
    width: 42,
    height: 52,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    backgroundColor: '#fff',
  },
  otpInputFilled: {
    borderColor: '#4285f4',
    backgroundColor: '#fff',
  },
  otpInputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16,
    height: 34, // Keep height consistent
    lineHeight: 18,
  },
  resendContainer: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  resendButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resendText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4285f4',
  },
  bottomSection: {
    flex: 0.2,
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  verifyButton: {
    backgroundColor: '#4285f4',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4285f4',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 32,
  },
  verifyButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0.1,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  arrowIcon: {
    color: '#fff',
    fontSize: 20,
    paddingBottom: 3,
    fontWeight: 'bold',
  },
  helpText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 16,
  },
  linkText: {
    color: '#4285f4',
    fontWeight: '500',
  },
});


export default VerifyOTPScreen;