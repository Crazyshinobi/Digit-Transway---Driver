import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { API_URL } from '../../config/config';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  // Rate limiting states
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [timerRef, setTimerRef] = useState(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const iconSlideAnim = useRef(new Animated.Value(-30)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const timerPulse = useRef(new Animated.Value(1)).current;

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
      Animated.spring(iconSlideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef) {
        clearInterval(timerRef);
      }
    };
  }, [timerRef]);

  // Start countdown timer
  const startCountdown = (seconds = 60) => {
    setIsRateLimited(true);
    setCountdown(seconds);
    setPhoneError(
      `Please wait ${seconds} seconds before requesting another OTP`,
    );

    // Animate timer pulse
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(timerPulse, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(timerPulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    pulseAnimation.start();

    const timer = setInterval(() => {
      setCountdown(prevCount => {
        if (prevCount <= 1) {
          clearInterval(timer);
          setIsRateLimited(false);
          setPhoneError('');
          pulseAnimation.stop();
          timerPulse.setValue(1);
          return 0;
        }
        const newCount = prevCount - 1;
        setPhoneError(
          `Please wait ${newCount} seconds before requesting another OTP`,
        );
        return newCount;
      });
    }, 1000);

    setTimerRef(timer);
  };

  const validatePhoneNumber = number => {
    const indianPhoneRegex = /^[6-9]\d{9}$/;
    if (!number) {
      setPhoneError('Mobile number is required.');
      return false;
    }
    if (!indianPhoneRegex.test(number)) {
      setPhoneError('Please enter a valid 10-digit mobile number.');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handlePhoneNumberChange = text => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      setPhoneNumber(cleaned);
      if (cleaned.length > 0 && !isRateLimited) {
        setPhoneError('');
      }
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (phoneNumber.length > 0 && !isRateLimited) {
      validatePhoneNumber(phoneNumber);
    }
  };

  const handleLogin = async () => {
    if (!validatePhoneNumber(phoneNumber) || isRateLimited) {
      return;
    }

    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start(() => {
      Animated.spring(buttonScale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    });

    setIsLoading(true);

    try {
      // 👇 *** API Endpoint Updated Here ***
      const response = await axios.post(`${API_URL}/api/vendor/auth/login-send-otp`, {
        contact_number: phoneNumber,
      });

      const { data } = response;
      console.log('API Response Data:', data);

      if (data?.success) {
        navigation.navigate('VerifyOTP', { phoneNumber: phoneNumber });
      } else {
        setPhoneError(data?.message || 'An unknown error occurred.');
      }
    } catch (error) {
      console.log('Full error object:', error);
      console.log('Error response:', error.response?.data);

      const errorData = error.response?.data;

      // Check for rate limiting error
      if (
        errorData?.status === 'rate_limited' &&
        errorData?.message?.includes('Please wait 60 seconds')
      ) {
        startCountdown(60);
      } else {
        setPhoneError(errorData?.message || 'Failed to connect to the server.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhoneNumber = text => {
    if (text.length <= 3) return text;
    if (text.length <= 6) return `${text.slice(0, 3)} ${text.slice(3)}`;
    return `${text.slice(0, 3)} ${text.slice(3, 6)} ${text.slice(6)}`;
  };

  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isButtonDisabled =
    isLoading || phoneNumber.length !== 10 || !!phoneError || isRateLimited;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <Animated.View
            style={[
              styles.headerSection,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Animated.View
              style={[
                styles.iconContainer,
                { transform: [{ translateY: iconSlideAnim }] },
              ]}
            >
              <View style={styles.truckIcon}>
                <View style={styles.truckCab}>
                  <View style={styles.truckWindow} />
                </View>
                <View style={styles.truckTrailer} />
                <View style={styles.truckWheels}>
                  <View style={styles.wheel} />
                  <View style={styles.wheel} />
                  <View style={styles.wheel} />
                </View>
              </View>
            </Animated.View>
            <Text style={styles.appTitle}>Welcome Back!</Text>
            <Text style={styles.appSubtitle}>
              Sign in to your Digit Transway account
            </Text>
          </Animated.View>

          {/* Form Section */}
          <Animated.View
            style={[
              styles.formSection,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Mobile Number</Text>
              <View
                style={[
                  styles.inputWrapper,
                  isFocused && styles.inputWrapperFocused,
                  phoneError && styles.inputWrapperError,
                  isRateLimited && styles.inputWrapperRateLimited,
                ]}
              >
                <View style={styles.phoneIconContainer}>
                  <Text style={styles.phoneIcon}>📱</Text>
                </View>
                <View style={styles.countryCodeContainer}>
                  <Text style={styles.countryCode}>+91</Text>
                </View>
                <TextInput
                  style={[
                    styles.textInput,
                    isRateLimited && styles.textInputDisabled,
                  ]}
                  placeholder="Enter mobile number"
                  placeholderTextColor="#999"
                  value={formatPhoneNumber(phoneNumber)}
                  onChangeText={text =>
                    handlePhoneNumberChange(text.replace(/\s/g, ''))
                  }
                  keyboardType="phone-pad"
                  onFocus={() => setIsFocused(true)}
                  onBlur={handleBlur}
                  maxLength={12}
                  autoComplete="tel"
                  textContentType="telephoneNumber"
                  editable={!isRateLimited}
                />
              </View>

              {/* Error/Timer Display */}
              {phoneError ? (
                <View style={styles.errorContainer}>
                  <Animated.Text
                    style={[
                      styles.errorText,
                      isRateLimited && styles.rateLimitText,
                    ]}
                  >
                    {isRateLimited ? (
                      <>🕐 Please wait before requesting another OTP</>
                    ) : (
                      phoneError
                    )}
                  </Animated.Text>

                  {/* Countdown Timer */}
                  {isRateLimited && countdown > 0 && (
                    <Animated.View
                      style={[
                        styles.timerContainer,
                        { transform: [{ scale: timerPulse }] },
                      ]}
                    >
                      <Text style={styles.timerText}>
                        {formatTime(countdown)}
                      </Text>
                    </Animated.View>
                  )}
                </View>
              ) : null}
            </View>

            <Animated.View
              style={[
                styles.buttonContainer,
                { transform: [{ scale: buttonScale }] },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  isButtonDisabled && styles.loginButtonDisabled,
                  isRateLimited && styles.loginButtonRateLimited,
                ]}
                onPress={handleLogin}
                disabled={isButtonDisabled}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : isRateLimited ? (
                  <>
                    <Text style={styles.loginButtonText}>
                      Wait {countdown}s
                    </Text>
                    <Text style={styles.timerIcon}>⏱️</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.loginButtonText}>
                      Send Verification Code
                    </Text>
                    <Text style={styles.arrowIcon}>→</Text>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.additionalOptions}>
              <TouchableOpacity style={styles.helpButton}>
                <Text style={styles.helpText}>Having trouble signing in?</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Footer Section */}
          <Animated.View style={[styles.footerSection, { opacity: fadeAnim }]}>
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation?.navigate('RoleSelection')}
              >
                <Text style={styles.signupLink}>Sign up</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.termsText}>
              By continuing, you agree that you have read and accept our{' '}
              <Text style={styles.termsLink}>T&Cs</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
    justifyContent: 'space-between',
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: height * 0.05,
  },
  iconContainer: {
    backgroundColor: '#4285f4',
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: '#4285f4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  truckIcon: { width: 48, height: 32, position: 'relative' },
  truckCab: {
    position: 'absolute',
    left: 0,
    top: 6,
    width: 16,
    height: 20,
    backgroundColor: '#fff',
    borderRadius: 2,
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
  },
  truckWindow: {
    position: 'absolute',
    top: 3,
    left: 2,
    width: 10,
    height: 8,
    backgroundColor: '#e3f2fd',
    borderRadius: 1,
  },
  truckTrailer: {
    position: 'absolute',
    right: 0,
    top: 8,
    width: 32,
    height: 16,
    backgroundColor: '#fff',
    borderRadius: 2,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  truckWheels: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  wheel: {
    width: 8,
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#fff',
  },
  appTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  formSection: {
    flex: 1,
    justifyContent: 'center',
  },
  inputContainer: {
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    paddingHorizontal: 10,
    paddingVertical: 3,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.1,
    // shadowRadius: 12,
    elevation: 8,
  },
  inputWrapperFocused: {
    // borderColor: '#4285f4',
    shadowColor: '#4285f4',
    shadowOpacity: 0.2,
  },
  inputWrapperError: {
    borderColor: '#ff4757',
    shadowColor: '#ff4757',
  },
  inputWrapperRateLimited: {
    borderColor: '#ff4757',
    backgroundColor: '#fff',
    shadowColor: '#ff4757',
    shadowOpacity: 0.2,
  },
  phoneIconContainer: {
    backgroundColor: '#e8f4fd',
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  phoneIcon: { fontSize: 16 },
  countryCodeContainer: {
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    marginRight: 12,
  },
  countryCode: { fontSize: 16, fontWeight: '600', color: '#4285f4' },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    paddingVertical: 16,
  },
  textInputDisabled: {
    color: '#999',
  },
  errorContainer: {
    marginTop: 8,
    marginLeft: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#ff4757',
  },
  rateLimitText: {
    color: '#ff4757',
    fontWeight: '600',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#4285f4',
  },
  timerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4285f4',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  buttonContainer: {
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: '#4285f4',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4285f4',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonDisabled: {
    backgroundColor: '#e0e0e0',
    shadowOpacity: 0.1,
    shadowColor: '#000',
  },
  loginButtonRateLimited: {
    backgroundColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOpacity: 0.1,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  arrowIcon: {
    color: '#fff',
    fontSize: 20,
    paddingBottom: 6,
    fontWeight: 'bold',
  },
  timerIcon: {
    fontSize: 18,
    marginLeft: 4,
  },
  additionalOptions: {
    alignItems: 'center',
    marginBottom: 32,
  },
  helpButton: {
    paddingVertical: 8,
  },
  helpText: { fontSize: 14, color: '#4285f4', fontWeight: '500' },
  footerSection: {
    paddingBottom: 20,
    paddingTop: 16,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  signupText: { fontSize: 14, color: '#666' },
  signupLink: { fontSize: 14, fontWeight: '600', color: '#4285f4' },
  termsText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 16,
  },
  termsLink: { color: '#4285f4', fontWeight: '500' },
});

export default LoginScreen;