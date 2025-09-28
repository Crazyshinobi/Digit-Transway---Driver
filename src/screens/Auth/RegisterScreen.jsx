import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';

// Components
import RegistrationHeader from '../../components/common/RegistrationHeader';
import PhoneStep from '../../components/registration/PhoneStep';
import OTPStep from '../../components/registration/OTPStep';
import PersonalInfoStep from '../../components/registration/PersonalInfoStep';
import DocumentStep from '../../components/registration/DocumentStep';
import BankDetailStep from '../../components/registration/BankDetailStep';

// Utils & Config
import { THEME } from '../../themes/colors';
import { API_URL } from '../../config/config';

const RegisterScreen = ({ navigation }) => {
  /* ---------- State ---------- */
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Phone & OTP
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [timerRef, setTimerRef] = useState(null);

  // Consolidated form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    dob: null,
    gender: '',
    emergency_contact: '',
    aadhar_number: '',
    pan_number: '',
    rc_number: '',
    full_address: '',
    state: '',
    city: '',
    pincode: '',
    country: 'India',
    same_address: true,
    aadhaar_front: null,
    bank_name: '',
    account_number: '',
    ifsc: '',
    declaration: false,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState({});
  const [accessToken, setAccessToken] = useState('');

  /* ---------- Animation refs & Effects (unchanged) ---------- */
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (step / getTotalSteps()) * 100,
      duration: 400,
      useNativeDriver: false,
    }).start();
    fadeAnim.setValue(0);
    slideAnim.setValue(20);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay: 100,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [step]);

  useEffect(() => {
    return () => timerRef && clearInterval(timerRef);
  }, [timerRef]);

  /* ---------- Helpers (unchanged) ---------- */
  const formatPhoneNumber = txt =>
    txt.length <= 3
      ? txt
      : txt.length <= 6
      ? `${txt.slice(0, 3)} ${txt.slice(3)}`
      : `${txt.slice(0, 3)} ${txt.slice(3, 6)} ${txt.slice(6)}`;

  const handlePhoneNumberChange = txt => {
    const cleaned = txt.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      setPhoneNumber(cleaned);
      if (cleaned && !isRateLimited) clearFieldError('phoneNumber');
    }
  };

  const formatDate = useCallback(
    d =>
      !d
        ? 'Select Date of Birth'
        : d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
    [],
  );

  const clearFieldError = useCallback(f => {
    setErrors(prev => {
      if (!(f in prev)) return prev;
      const newErrors = { ...prev };
      delete newErrors[f];
      return newErrors;
    });
  }, []);

  const onDateChange = useCallback(
    (_e, selectedDate) => {
      setShowDatePicker(false);
      if (selectedDate) {
        setFormData(p => ({ ...p, dob: selectedDate }));
        clearFieldError('dob');
      }
    },
    [clearFieldError],
  );

  const getTotalSteps = () => 5;

  const getStepInfo = () =>
    [
      { title: 'Phone Verification', subtitle: 'Secure your account' },
      { title: 'Verify Code', subtitle: 'Enter the 6-digit OTP' },
      { title: 'Personal Info', subtitle: 'Tell us about yourself' },
      { title: 'Documents', subtitle: 'Verify your identity' },
      { title: 'Bank Details', subtitle: 'Complete your setup' },
    ][step - 1];

  /* ---------- API calls ---------- */
  const sendOTP = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/vendor/auth/send-otp`, {
        contact_number: phoneNumber,
      });
      if (res.data?.success) {
        setStep(2);
        Alert.alert('OTP Sent', 'Check your mobile for the verification code.');
      } else {
        setErrors(p => ({
          ...p,
          phoneNumber: res.data?.message || 'Failed to send OTP',
        }));
      }
    } catch (err) {
      const m = err.response?.data?.message || 'Failed to send OTP.';
      if (m.includes('60 seconds')) startCountdown(60);
      setErrors(p => ({ ...p, phoneNumber: m }));
    } finally {
      setIsLoading(false);
    }
  };

  // In RegisterScreen.js

  const verifyOTP = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/vendor/auth/verify-otp`, {
        contact_number: phoneNumber,
        otp,
      });

      // 👇 FIX: Update the path to the access token here
      const token = res.data?.data?.access_token;

      if (res.data?.success && token) {
        setAccessToken(token);
        setStep(3);
        Alert.alert('Verified', 'Phone number verified successfully!');
      } else {
        const errorMessage =
          res.data?.message || 'Invalid OTP or server error.';
        setErrors(p => ({ ...p, otp: errorMessage }));
        if (!token && res.data?.success) {
          Alert.alert(
            'Verification Error',
            'Could not retrieve session token. Please try again.',
          );
        }
      }
    } catch (err) {
      setErrors(p => ({
        ...p,
        otp: err.response?.data?.message || 'Failed to verify OTP. Try again.',
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    // 👇 FIX #2: Add a guard clause to ensure the token exists before proceeding
    if (!accessToken) {
      Alert.alert(
        'Session Expired',
        'Your verification token is missing. Please restart the registration process.',
      );
      // Optionally, navigate the user back to the first step or login
      // setStep(1);
      return;
    }

    setIsLoading(true);
    const registrationData = new FormData();

    Object.keys(formData).forEach(key => {
      if (key === 'dob' && formData.dob) {
        registrationData.append(
          'dob',
          formData.dob.toISOString().split('T')[0],
        );
      } else if (key === 'aadhaar_front' && formData.aadhaar_front) {
        registrationData.append('aadhaar_front', {
          uri: formData.aadhaar_front.uri,
          type: formData.aadhaar_front.type,
          name: formData.aadhaar_front.fileName,
        });
      } else if (formData[key] !== null) {
        registrationData.append(key, String(formData[key]));
      }
    });

    // Also append the phone number used for registration
    registrationData.append('contact_number', phoneNumber);

    try {
      const res = await axios.post(
        `${API_URL}/api/vendor/auth/complete-registration`,
        registrationData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (res.data?.success) {
        Alert.alert(
          'Registration Successful!',
          'Your account has been created.',
        );
        navigation.navigate('Login');
      } else {
        Alert.alert(
          'Registration Failed',
          res.data?.message || 'An unknown error occurred.',
        );
      }
    } catch (err) {
      Alert.alert(
        'An Error Occurred',
        err.response?.data?.message ||
          'Please check your connection and try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const startCountdown = (sec = 60) => {
    setIsRateLimited(true);
    setCountdown(sec);
    setErrors(p => ({
      ...p,
      phoneNumber: `Please wait ${sec} seconds before requesting another OTP`,
    }));
    const t = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(t);
          setIsRateLimited(false);
          clearFieldError('phoneNumber');
          return 0;
        }
        const n = c - 1;
        setErrors(p => ({
          ...p,
          phoneNumber: `Please wait ${n} seconds before requesting another OTP`,
        }));
        return n;
      });
    }, 1000);
    setTimerRef(t);
  };

  /* ---------- Validation (unchanged) ---------- */
  const validateStep = () => {
    const e = {};
    if (step === 1) {
      if (!/^[6-9]\d{9}$/.test(phoneNumber))
        e.phoneNumber = 'Valid 10-digit number required';
    } else if (step === 2) {
      if (otp.length !== 6) e.otp = 'Enter the 6-digit OTP';
    } else if (step === 3) {
      if (!formData.name.trim()) e.name = 'Name required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        e.email = 'Valid email required';
      if (formData.password.length < 6) e.password = 'Min 6 characters';
      if (!formData.dob) e.dob = 'Select DOB';
      if (!formData.gender) e.gender = 'Select gender';
      if (!/^[6-9]\d{9}$/.test(formData.emergency_contact))
        e.emergency_contact = 'Valid emergency contact';
    } else if (step === 4) {
      if (!/^\d{12}$/.test(formData.aadhar_number))
        e.aadhar_number = 'Valid 12-digit Aadhaar required';
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan_number))
        e.pan_number = 'Valid PAN format required';
      if (!formData.rc_number.trim()) e.rc_number = 'RC Number required';
      if (!formData.aadhaar_front)
        e.aadhaar_front = 'Aadhaar front image required';
      if (!formData.full_address.trim()) e.full_address = 'Address required';
      if (!formData.state.trim()) e.state = 'State required';
      if (!formData.city.trim()) e.city = 'City required';
      if (!/^\d{6}$/.test(formData.pincode))
        e.pincode = 'Valid 6-digit Pincode required';
    } else if (step === 5) {
      if (!formData.bank_name.trim()) e.bank_name = 'Bank name required';
      if (!/^\d{9,18}$/.test(formData.account_number))
        e.account_number = 'Valid account number required';
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc))
        e.ifsc = 'Valid 11-character IFSC code required';
      if (!formData.declaration) e.declaration = 'You must agree to the terms';
    }
    setErrors(e);
    return !Object.keys(e).length;
  };

  /* ---------- Navigation & Render (unchanged) ---------- */
  const handleNext = () => {
    if (!validateStep()) return;
    switch (step) {
      case 1:
        sendOTP();
        break;
      case 2:
        verifyOTP();
        break;
      case 3:
      case 4:
        setStep(s => s + 1);
        break;
      case 5:
        handleRegister();
        break;
    }
  };

  const handleBack = () =>
    step > 1 && step !== 3 ? setStep(step - 1) : navigation.goBack();

  const renderCurrentStep = () =>
    ({
      1: (
        <PhoneStep
          {...{
            phoneNumber,
            onPhoneChange: handlePhoneNumberChange,
            formatPhoneNumber,
            errors,
            isRateLimited,
            countdown,
          }}
        />
      ),
      2: (
        <OTPStep
          {...{
            otp,
            setOtp,
            phoneNumber,
            formatPhoneNumber,
            errors,
            clearFieldError,
            onChangeNumber: () => {
              setStep(1);
              setOtp('');
              clearFieldError('otp');
            },
          }}
        />
      ),
      3: (
        <PersonalInfoStep
          {...{
            formData,
            setFormData,
            errors,
            clearFieldError,
            showDatePicker,
            setShowDatePicker,
            formatDate,
            onDateChange,
          }}
        />
      ),
      4: (
        <DocumentStep {...{ formData, setFormData, errors, clearFieldError }} />
      ),
      5: (
        <BankDetailStep
          {...{ formData, setFormData, errors, clearFieldError }}
        />
      ),
    })[step] || null;

  const getButtonText = () => {
    if (isLoading) return null;
    if (step === 1)
      return isRateLimited ? `Wait ${countdown}s` : 'Send Verification Code';
    if (step === 2) return 'Verify & Continue';
    if (step === 5) return 'Complete Registration';
    return 'Continue';
  };

  const isButtonDisabled = () => isLoading || (step === 1 && isRateLimited);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.primaryDark} />
      <RegistrationHeader
        onBack={handleBack}
        title={getStepInfo().title}
        subtitle={getStepInfo().subtitle}
        step={step}
        totalSteps={getTotalSteps()}
      />
      <View style={styles.progressContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onPress={Keyboard.dismiss}
          accessible={false}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {renderCurrentStep()}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
      <View style={styles.bottomContainer}>
        <TouchableOpacity onPress={handleNext} disabled={isButtonDisabled()}>
          <LinearGradient
            colors={
              isButtonDisabled()
                ? ['#B0BEC5', '#90A4AE']
                : THEME.primaryGradient
            }
            style={styles.nextButton}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.buttonText}>{getButtonText()}</Text>
                {!isButtonDisabled() && step < 5 && (
                  <Text style={styles.buttonArrow}>→</Text>
                )}
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

/* ---------- Styles (unchanged) ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  flex: { flex: 1 },
  progressContainer: { height: 4, backgroundColor: THEME.borderLight },
  progressBar: { height: '100%', backgroundColor: THEME.primary },
  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 20 },
  bottomContainer: {
    padding: 20,
    backgroundColor: THEME.surface,
    borderTopWidth: 1,
    borderTopColor: THEME.borderLight,
    shadowColor: THEME.shadowLight,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  nextButton: {
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: THEME.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: THEME.textOnPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginRight: 8,
  },
  buttonArrow: {
    color: THEME.textOnPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    paddingBottom: 6,
  },
});

export default RegisterScreen;
