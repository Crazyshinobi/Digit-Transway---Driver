import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Alert,
  Animated,
  Platform,
  Keyboard,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

// Components
import RegistrationHeader from '../../components/common/RegistrationHeader';
import PhoneStep from '../../components/registration/PhoneStep';
import OTPStep from '../../components/registration/OTPStep';
import PersonalInfoStep from '../../components/registration/PersonalInfoStep';
import DocumentStep from '../../components/registration/DocumentStep';
import BankDetailStep from '../../components/registration/BankDetailStep';
import VehicleStep from '../../components/registration/VehicleStep';


// Utils & Config
import { THEME } from '../../themes/colors';
import { API_URL } from '../../config/config';

const RegisterScreen = ({ route, navigation }) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [userTypeKey, setUserTypeKey] = useState();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [timerRef, setTimerRef] = useState(null);

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
    vehicle_category_id: '',
    vehicle_model_id: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState({});
  const [accessToken, setAccessToken] = useState('');

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

  useEffect(() => {
    const key = route.params?.user_type_key;
    if (key) {
        setUserTypeKey(key);
        console.log('User Type Key received:', key);
    } else {
        console.warn('User Type Key not received!');
        Alert.alert(
        'Error',
        'Could not determine user type. Please go back and select a role.',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
        );
    }
  }, [route.params?.user_type_key]);


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
  
  const getTotalSteps = () => 6;

  const getStepInfo = () =>
    [
      { title: 'Phone Verification', subtitle: 'Secure your account' },
      { title: 'Verify Code', subtitle: 'Enter the 4-digit OTP' },
      { title: 'Personal Info', subtitle: 'Tell us about yourself' },
      { title: 'Documents', subtitle: 'Verify your identity' },
      { title: 'Bank Details', subtitle: 'Complete your setup' },
      { title: 'Vehicle Details', subtitle: 'Add your vehicle information' },
    ][step - 1];

  const sendOTP = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/vendor/auth/send-otp`, {
        user_type_key: userTypeKey,
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

  const verifyOTP = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/vendor/auth/verify-otp`, {
        contact_number: phoneNumber,
        otp,
      });

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
    if (!accessToken) {
      Alert.alert(
        'Session Expired',
        'Your verification token is missing. Please restart the registration process.',
      );
      return;
    }

    setIsLoading(true);

    try {
      const registrationData = new FormData();
      const excludeFields = ['password'];

      Object.keys(formData).forEach(key => {
        if (excludeFields.includes(key)) {
          return;
        }

        const value = formData[key];

        if (key === 'dob' && value) {
          const dobString = new Date(value).toISOString().split('T')[0]; // YYYY-MM-DD
          registrationData.append('dob', dobString);
        } else if (key === 'aadhaar_front' && value) {
          registrationData.append('aadhaar_front', {
            uri: value.uri,
            type: value.type,
            name: value.fileName,
          });
        } else if (key === 'declaration' || key === 'same_address') {
          registrationData.append(key, value ? '1' : '0');
        } else if (value !== null && value !== '' && value !== undefined) {
          registrationData.append(key, String(value));
        }
      });
      
      // --- MODIFIED: Add userTypeKey to the submission data ---
      if (userTypeKey) {
          registrationData.append('user_type_key', userTypeKey);
      }
      registrationData.append('contact_number', phoneNumber);

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
          'Your account has been created successfully.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }],
        );
      } else {
          const errorMessages = res.data?.errors 
              ? Object.values(res.data.errors).flat().join('\n')
              : res.data?.message;
        Alert.alert('Registration Failed', errorMessages || 'An unknown error occurred.');
      }
    } catch (err) {
        const errorMessages = err.response?.data?.errors 
            ? Object.values(err.response.data.errors).flat().join('\n')
            : err.response?.data?.message;
      Alert.alert('Registration Error', errorMessages || 'Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const startCountdown = (sec = 60) => {
    setIsRateLimited(true);
    setCountdown(sec);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsRateLimited(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setTimerRef(timer);
  };
  
  const validateStep = () => {
    const e = {};
    if (step === 1) {
      if (!/^[6-9]\d{9}$/.test(phoneNumber))
        e.phoneNumber = 'Valid 10-digit number required';
    } else if (step === 2) {
      if (otp.length !== 4) e.otp = 'Enter the 4-digit OTP';
    } else if (step === 3) {
      if (!formData.name.trim()) e.name = 'Name required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        e.email = 'Valid email required';
      if (!formData.password || formData.password.length < 8)
        e.password = 'Password must be at least 8 characters';
      if (!formData.dob) e.dob = 'Select DOB';
      if (!formData.gender) e.gender = 'Select gender';
      if (!/^[6-9]\d{9}$/.test(formData.emergency_contact))
        e.emergency_contact = 'Valid emergency contact';
    } else if (step === 4) {
      if (!formData.aadhar_number.trim())
        e.aadhar_number = 'Aadhar number required';
      if (!formData.pan_number.trim()) e.pan_number = 'PAN number required';
    } else if (step === 5) {
      if (!formData.bank_name.trim()) e.bank_name = 'Bank name required';
      if (!formData.account_number.trim())
        e.account_number = 'Account number required';
      if (!formData.ifsc.trim()) e.ifsc = 'IFSC code required';
      if (!formData.declaration)
        e.declaration = 'Please accept the declaration';
    } else if (step === 6) {
        if (!formData.vehicle_category_id) e.vehicle_category_id = 'Please select a category';
        if (!formData.vehicle_model_id) e.vehicle_model_id = 'Please select a vehicle model';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const isCurrentStepValid = () => {
    if (step === 1) {
      return /^[6-9]\d{9}$/.test(phoneNumber);
    } else if (step === 2) {
      // --- MODIFIED: Changed OTP length check to 4 ---
      return otp.length === 4;
    } else if (step === 3) {
      return (
        formData.name.trim() &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
        formData.password &&
        formData.password.length >= 8 &&
        formData.dob &&
        formData.gender &&
        /^[6-9]\d{9}$/.test(formData.emergency_contact)
      );
    } else if (step === 4) {
      return formData.aadhar_number.trim() && formData.pan_number.trim();
    } else if (step === 5) {
      return (
        formData.bank_name.trim() &&
        formData.account_number.trim() &&
        formData.ifsc.trim() &&
        formData.declaration
      );
    } else if (step === 6) {
        return formData.vehicle_category_id && formData.vehicle_model_id;
    }
    return false;
  };
  
  // --- MODIFIED: Update next button logic ---
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
      case 5: // Now step 5 just proceeds to the next step
        setStep(s => s + 1);
        break;
      case 6: // Final submission is now on step 6
        handleRegister();
        break;
    }
  };

  const handleBack = () =>
    step > 1 && step !== 3 ? setStep(step - 1) : navigation.goBack();

  // --- MODIFIED: Add the new VehicleStep to the renderer ---
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
      6: (
          <VehicleStep
            {...{ formData, setFormData, errors, clearFieldError }}
          />
      )
    })[step] || null;

  const getButtonText = () => {
    if (isLoading) return null;
    if (step === 1)
      return isRateLimited ? `Wait ${countdown}s` : 'Send Verification Code';
    if (step === 2) return 'Verify & Continue';
    // --- MODIFIED: Update button text for the final step ---
    if (step === 6) return 'Complete Registration';
    return 'Continue';
  };

  const isButtonDisabled = () => {
    if (isLoading) return true;
    if (step === 1 && isRateLimited) return true;
    return !isCurrentStepValid();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={THEME.primaryDark}
        translucent={false}
      />
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

      <KeyboardAwareScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {renderCurrentStep()}
        </Animated.View>
      </KeyboardAwareScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity onPress={handleNext} disabled={isButtonDisabled()}>
          <LinearGradient
            colors={
              isButtonDisabled()
                ? ['#BDBDBD', '#BDBDBD']
                : [THEME.primary, THEME.primaryDark]
            }
            style={styles.nextButton}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.buttonText}>{getButtonText()}</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  progressContainer: {
    height: 4,
    backgroundColor: THEME.borderLight,
  },
  progressBar: {
    height: '100%',
    backgroundColor: THEME.primary,
  },
  scrollView: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  bottomContainer: {
    padding: 20,
    backgroundColor: THEME.background,
    borderTopWidth: 1,
    borderTopColor: THEME.borderLight,
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
  },
});

export default RegisterScreen;