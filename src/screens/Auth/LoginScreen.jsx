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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { API_URL } from '../../config/config';
import LinearGradient from 'react-native-linear-gradient';
import { Svg, Path } from 'react-native-svg';
import icon from '../../assets/icons/icon.png';
import { getHash } from 'react-native-otp-verify';

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

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef) {
        clearInterval(timerRef);
      }
    };
  }, [timerRef]);

  useEffect(() => {
    // Get the app hash
    getHash()
      .then(hash => {
        console.log('Your App Hash is:', hash);
      })
      .catch(console.log);
  }, []);

  // Start countdown timer
  const startCountdown = (seconds = 60) => {
    setIsRateLimited(true);
    setCountdown(seconds);
    setPhoneError(
      `Please wait ${seconds} seconds before requesting another OTP`,
    );

    const timer = setInterval(() => {
      setCountdown(prevCount => {
        if (prevCount <= 1) {
          clearInterval(timer);
          setIsRateLimited(false);
          setPhoneError('');
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

  const handleLogin = async () => {
    if (!validatePhoneNumber(phoneNumber) || isRateLimited) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/vendor/auth/login-send-otp`,
        {
          contact_number: phoneNumber,
        },
      );

      const { data } = response;
      if (data?.success) {
        navigation.navigate('VerifyOTP', { phoneNumber: phoneNumber });
      } else {
        setPhoneError(data?.message || 'An unknown error occurred.');
      }
    } catch (error) {
      const errorData = error.response?.data;
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

  const isButtonDisabled = isLoading || isRateLimited;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ opacity: fadeAnim, flexGrow: 1 }}>
            <LinearGradient
              colors={['#5A3F9E', '#3C9D8E']}
              style={styles.headerContainer}
            >
              <View style={styles.logoContainer}>
                <Image source={icon} style={styles.logo} />
              </View>
              <Text style={styles.mainTitle}>Digit Transway</Text>
              <Text style={styles.subtitle}>
                Your trusted transport and logistics partner
              </Text>
            </LinearGradient>

            <View style={styles.formContainer}>
              <Text style={styles.welcomeTitle}>Welcome back</Text>
              <Text style={styles.welcomeSubtitle}>
                Sign in with your mobile number
              </Text>

              <Text style={styles.inputLabel}>Mobile Number</Text>
              <View
                style={[
                  styles.inputWrapper,
                  isFocused && styles.inputWrapperFocused,
                  phoneError && styles.inputWrapperError,
                ]}
              >
                <Text style={styles.inputIcon}>📱</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter mobile number"
                  placeholderTextColor="#A9A9A9"
                  value={phoneNumber}
                  onChangeText={handlePhoneNumberChange}
                  keyboardType="phone-pad"
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  maxLength={10}
                  editable={!isRateLimited}
                />
              </View>
              {phoneError ? (
                <Text style={styles.errorText}>{phoneError}</Text>
              ) : null}

              <TouchableOpacity
                style={[
                  styles.button,
                  isButtonDisabled && styles.buttonDisabled,
                ]}
                onPress={handleLogin}
                disabled={isButtonDisabled}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>
                    {isRateLimited
                      ? `Wait ${countdown}s`
                      : 'Send Verification Code'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>
              Don't have an account?{' '}
              <Text
                style={styles.footerLink}
                onPress={() => navigation?.navigate('RoleSelection')}
              >
                Sign up
              </Text>
            </Text>
            <Text style={[styles.footerText, { fontSize: 12, marginTop: 8 }]}>
              By continuing, you agree to our{' '}
              <Text style={styles.footerLink}>Terms of Service</Text> and{' '}
              <Text style={styles.footerLink}>Privacy Policy</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  headerContainer: {
    height: height * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    backgroundColor: '#FFFFFF',
    // padding: 15,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#E0E0E0',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    marginTop: -20,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
  },
  inputWrapperFocused: {
    borderColor: '#3C9D8E',
    backgroundColor: '#FFFFFF',
  },
  inputWrapperError: {
    borderColor: '#EF4444',
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    paddingVertical: 14,
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
    marginTop: 8,
  },
  button: {
    backgroundColor: '#74C6B7',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerContainer: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  footerLink: {
    color: '#3C9D8E',
    fontWeight: '600',
  },
});

export default LoginScreen;
