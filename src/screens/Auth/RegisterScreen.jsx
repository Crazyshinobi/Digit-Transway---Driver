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
  Linking,
  KeyboardAvoidingView, // --- IMPORT ---
  ScrollView, // --- IMPORT ---
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
// import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'; // --- REMOVED ---
import { WebView } from 'react-native-webview'; // Import WebView

// Components
import RegistrationHeader from '../../components/common/RegistrationHeader';
import PhoneStep from '../../components/registration/PhoneStep';
import OTPStep from '../../components/registration/OTPStep';
import AadhaarStep from '../../components/registration/AadhaarStep';
import PersonalInfoStep from '../../components/registration/PersonalInfoStep';
import DocumentStep from '../../components/registration/DocumentStep';
import BankDetailStep from '../../components/registration/BankDetailStep';
import VehicleStep from '../../components/registration/VehicleStep';

// Utils & Config
import { THEME } from '../../themes/colors';
import { API_URL } from '../../config/config';

const RegisterScreen = ({ route, navigation }) => {
  // ... (All state variables and hooks remain unchanged) ...
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [userTypeKey, setUserTypeKey] = useState();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [timerRef, setTimerRef] = useState(null);
  const [accessToken, setAccessToken] = useState('');
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [isAadhaarLoading, setIsAadhaarLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationUrl, setVerificationUrl] = useState(null);
  const AADHAAR_CALLBACK_URL = 'https://digittransway.com/aadhaar-callback';
  const [isVerifyingBank, setIsVerifyingBank] = useState(false);
  const [isBankVerified, setIsBankVerified] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '', // <-- This can stay, it just won't be used
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
    account_holder_name: '',
    declaration: false,
    vehicle_category_id: '',
    vehicle_model_id: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState({});
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // ... (All functions from getTotalSteps down to handleRegister remain unchanged) ...
  const getTotalSteps = () => 7;
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
        useNativeDriver: false,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 80,
        useNativeDriver: false,
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
  const handleBankDetailsChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      ...((field === 'account_number' || field === 'ifsc') && {
        bank_name: '',
        account_holder_name: '',
      }),
    }));
    if (field === 'account_number' || field === 'ifsc') {
      setIsBankVerified(false);
      clearFieldError('bank_account');
    }
    clearFieldError(field);
  };
  const handleEditBankDetails = () => {
    setIsBankVerified(false);
    setFormData(prev => ({
      ...prev,
      bank_name: '',
      account_holder_name: '',
      account_number: '',
      ifsc: '',
    }));
    clearFieldError('bank_account');
  };
  const getStepInfo = () =>
    [
      { title: 'Phone Verification', subtitle: 'Secure your account' },
      { title: 'Verify Code', subtitle: 'Enter the 4-digit OTP' },
      { title: 'Aadhaar Verification', subtitle: 'Complete your KYC' },
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
  const handleInitializeAadhaar = async () => {
    if (!accessToken) {
      Alert.alert('Error', 'Authentication token not found.');
      return;
    }
    setIsAadhaarLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/vendor/auth/aadhaar/initialize`,
        { redirect_url: AADHAAR_CALLBACK_URL },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      const urlFromApi =
        response.data?.data?.url || response.data?.data?.verification_url;
      if (response.data?.success && urlFromApi) {
        setVerificationUrl(urlFromApi);
      } else {
        Alert.alert(
          'Error',
          response.data?.message ||
            'Could not initialize Aadhaar verification. Please try again.',
        );
      }
    } catch (error) {
      console.error(
        'Aadhaar init error:',
        error.response?.data || error.message,
      );
      Alert.alert(
        'Error',
        error.response?.data?.message ||
          'An error occurred while starting the verification process.',
      );
    } finally {
      setIsAadhaarLoading(false);
    }
  };

  // --- UPDATED FUNCTION ---
  const handleWebViewNavigation = navState => {
    const { url } = navState;
    console.log('WebView URL Changed:', url);

    if (url.startsWith(AADHAAR_CALLBACK_URL)) {
      setVerificationUrl(null); // Close the WebView

      const urlParams = new URLSearchParams(url.split('?')[1]);
      const status = urlParams.get('status');
      const clientId = urlParams.get('client_id');
      console.log('Callback Params:', { status, clientId });

      if (status === 'success') {
        // --- MODIFICATION ---
        // Instead of just setting success, we now call the new
        // function to fetch the data using the client_id.
        if (clientId) {
          fetchAadhaarData(clientId); // <--- This is the new call
        } else {
          Alert.alert('Verification Error', 'Client ID not found in callback.');
          setIsVerified(false);
        }
        // --- END MODIFICATION ---
      } else {
        // This part remains the same
        Alert.alert(
          'Verification Failed',
          'Aadhaar verification was not successful. Please try again.',
        );
        setIsVerified(false);
      }
    }
  };
  // --- END OF UPDATED FUNCTION ---

  // --- NEW FUNCTION TO ADD ---
  // This function fetches the user's data after a successful Aadhaar redirect
  // and pre-fills the form, just like your reference 'verifyAadhaarData' function.
  const fetchAadhaarData = async clientId => {
    // Use the loading state from the 'Verify' button to show activity
    setIsAadhaarLoading(true);

    try {
      if (!accessToken) {
        throw new Error('Authentication session expired. Please restart.');
      }

      // Call the 'verify' endpoint
      const response = await axios.post(
        `${API_URL}/api/vendor/auth/aadhaar/verify`, // Using the vendor-specific path
        { client_id: clientId },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      if (response.data.success) {
        const data = response.data.data;

        // --- This is the pre-filling logic from your example ---
        setFormData(prev => ({
          ...prev,
          name: data.full_name || prev.name,
          // Convert DOB string from API (e.g., "YYYY-MM-DD") to a Date object
          dob: data.dob ? new Date(data.dob) : prev.dob,
          full_address: data.full_address || prev.full_address,
          pincode: data.zip || prev.pincode,
          state: data.address?.state || prev.state,
          city: data.address?.dist || data.address?.vtc || prev.city,
          gender:
            data.gender === 'M'
              ? 'male'
              : data.gender === 'F'
              ? 'female'
              : 'other', // Uses the exact logic from your reference
          aadhar_number: data.masked_aadhaar
            ? data.masked_aadhaar.replace(/X/g, '') // Gets last 4 digits
            : prev.aadhar_number,
        }));
        // --- End of pre-filling logic ---

        setIsVerified(true); // Mark Aadhaar as verified

        // Notify user and move to the next step
        Alert.alert(
          'Aadhaar Verified!',
          'Your data has been pre-filled. Please review and continue.',
          [{ text: 'OK', onPress: () => setStep(4) }], // Move to Personal Info step
        );
      } else {
        throw new Error(
          response.data.message || 'Failed to retrieve Aadhaar data.',
        );
      }
    } catch (error) {
      console.error(
        'Aadhaar Data Fetch Error:',
        error.response?.data || error.message,
      );
      Alert.alert(
        'Verification Failed',
        error.message ||
          'Could not retrieve your Aadhaar data. Please try again.',
      );
      setIsVerified(false); // Ensure verification is false on error
    } finally {
      setIsAadhaarLoading(false); // Stop loading
    }
  };
  // --- END OF NEW FUNCTION ---

  const handleVerifyBankAccount = async () => {
    if (!accessToken) {
      Alert.alert('Error', 'Authentication session expired. Please restart.');
      return;
    }
    clearFieldError('bank_account');
    clearFieldError('account_number');
    clearFieldError('ifsc');
    if (!formData.account_number.trim() || !formData.ifsc.trim()) {
      setErrors(prev => ({
        ...prev,
        bank_account: 'Please enter both Account Number and IFSC Code.',
      }));
      return;
    }
    setIsVerifyingBank(true);
    try {
      const res = await axios.post(
        `${API_URL}/api/vendor/auth/verify-bank-account`,
        {
          account_number: formData.account_number,
          ifsc: formData.ifsc,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      if (res.data?.success && res.data?.verified) {
        const { account_holder_name, bank_details } = res.data.data;
        const bank_name = bank_details?.bank_name;
        setFormData(prev => ({
          ...prev,
          bank_name: bank_name || 'N/A',
          account_holder_name: account_holder_name || 'N/A',
        }));
        setIsBankVerified(true);
        Alert.alert('Success', res.data.message);
      } else {
        setIsBankVerified(false);
        setErrors(prev => ({
          ...prev,
          bank_account:
            res.data?.message || 'Bank account details are incorrect.',
        }));
        Alert.alert(
          'Verification Failed',
          res.data?.message || 'Bank account details are incorrect.',
        );
      }
    } catch (err) {
      console.error(
        'Bank Verification Error:',
        err.response?.data || err.message,
      );
      setIsBankVerified(false);
      const errorMsg =
        err.response?.data?.message ||
        'Could not verify bank account. Please try again.';
      setErrors(prev => ({
        ...prev,
        bank_account: errorMsg,
      }));
      Alert.alert('Error', errorMsg);
    } finally {
      setIsVerifyingBank(false);
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
      const excludeFields = ['password', 'account_holder_name']; // 'password' is already here
      Object.keys(formData).forEach(key => {
        if (excludeFields.includes(key)) {
          return;
        }
        const value = formData[key];
        if (key === 'dob' && value) {
          const dobString = new Date(value).toISOString().split('T')[0];
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
        Alert.alert(
          'Registration Failed',
          errorMessages || 'An unknown error occurred.',
        );
      }
    } catch (err) {
      const errorMessages = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join('\n')
        : err.response?.data?.message;
      Alert.alert(
        'Registration Error',
        errorMessages || 'Please check your connection and try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ... (fetchLocationData and its useEffect remain unchanged) ...
  const fetchLocationData = async pincode => {
    console.log(
      'RegisterScreen: fetchLocationData initiated with pincode:',
      pincode,
    );
    if (!pincode || pincode.length !== 6) return;
    setPincodeLoading(true);
    try {
      if (!accessToken)
        throw new Error('Authentication token not available yet.');
      console.log(
        'RegisterScreen: Attempting Pincode API call with token:',
        accessToken ? 'Token Found' : 'Token Missing!',
      );
      const response = await axios.get(
        `${API_URL}/api/pincode/location?pincode=${pincode}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      console.log('RegisterScreen: Pincode API Response:', response.data);
      if (response.data.success) {
        const { state, city, district } = response.data.data;
        const locationCity = city || district;
        setFormData(prev => ({
          ...prev,
          state: state || '',
          city: locationCity || '',
        }));
        Alert.alert('Info', 'State and City auto-filled.');
      } else {
        throw new Error(response.data.message || 'Invalid Pincode');
      }
    } catch (err) {
      console.error(
        'RegisterScreen: Pincode API Error:',
        err.response?.data || err.message || err,
      );
      Alert.alert(
        'Error',
        err.response?.data?.message ||
          err.message ||
          'Failed to fetch location data.',
      );
      setFormData(prev => ({ ...prev, state: null, city: null }));
    } finally {
      setPincodeLoading(false);
    }
  };
  useEffect(() => {
    const pincode = formData.pincode;
    console.log(
      'RegisterScreen: Pincode useEffect triggered. Current Pincode:',
      pincode,
    );
    if (pincode.length === 0) {
      setFormData(prev => ({ ...prev, state: null, city: null }));
    }
    if (pincode.length === 6 && accessToken) {
      console.log(
        'RegisterScreen: Pincode is 6 digits & token exists, calling fetchLocationData...',
      );
      fetchLocationData(pincode);
    } else if (pincode.length === 6 && !accessToken) {
      console.log(
        'RegisterScreen: Pincode is 6 digits, but no accessToken yet.',
      );
    }
  }, [formData.pincode, accessToken]);

  // --- PASSWORD VALIDATION COMMENTED OUT ---
  // useEffect(() => {
  //   if (step === 4) {
  //     const { password } = formData;
  //     if (password && password.length < 8) {
  //       setErrors(prev => ({
  //         ...prev,
  //         password: 'Password must be at least 8 characters',
  //       }));
  //     } else {
  //       clearFieldError('password');
  //     }
  //   }
  // }, [formData.password, step, clearFieldError]);
  // --- END ---

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
      // Validation happens via isVerified
    } else if (step === 4) {
      if (!formData.name.trim()) e.name = 'Name required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        e.email = 'Valid email required';
      // --- PASSWORD VALIDATION COMMENTED OUT ---
      // if (!formData.password || formData.password.length < 8)
      //   e.password = 'Password must be at least 8 characters';
      // --- END ---
      if (!formData.dob) e.dob = 'Select DOB';
      if (!formData.gender) e.gender = 'Select gender';
      if (!/^[6-9]\d{9}$/.test(formData.emergency_contact))
        e.emergency_contact = 'Valid emergency contact';
    } else if (step === 5) {
      if (!formData.aadhar_number.trim())
        e.aadhar_number = 'Aadhar number required';
      // if (!formData.pan_number.trim()) e.pan_number = 'PAN number required';
    } else if (step === 6) {
      if (!isBankVerified) {
        e.bank_account = 'Please verify your bank account details';
      }
      if (!formData.declaration) {
        e.declaration = 'Please accept the declaration';
      }
    } else if (step === 7) {
      if (!formData.vehicle_category_id)
        e.vehicle_category_id = 'Please select a category';
      if (!formData.vehicle_model_id)
        e.vehicle_model_id = 'Please select a vehicle model';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const isCurrentStepValid = () => {
    if (step === 1) {
      return /^[6-9]\d{9}$/.test(phoneNumber);
    } else if (step === 2) {
      return otp.length === 4;
    } else if (step === 3) {
      return isVerified;
    } else if (step === 4) {
      return (
        formData.name.trim() &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
        // --- PASSWORD VALIDATION COMMENTED OUT ---
        // formData.password &&
        // formData.password.length >= 8 &&
        // --- END ---
        formData.dob &&
        formData.gender &&
        /^[6-9]\d{9}$/.test(formData.emergency_contact)
      );
    } else if (step === 5) {
      return formData.aadhar_number.trim() && formData.pan_number.trim();
    } else if (step === 6) {
      return isBankVerified && formData.declaration;
    } else if (step === 7) {
      return formData.vehicle_category_id && formData.vehicle_model_id;
    }
    return false;
  };

  // ... (Rest of the file: handleNext, handleBack, renderCurrentStep, etc. remain unchanged) ...
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
        if (isVerified) {
          setStep(s => s + 1);
        } else {
          Alert.alert(
            'Verification Required',
            'Please complete Aadhaar verification first.',
          );
        }
        break;
      case 4:
      case 5:
      case 6:
        setStep(s => s + 1);
        break;
      case 7:
        handleRegister();
        break;
    }
  };
  const handleBack = () => (step > 1 ? setStep(step - 1) : navigation.goBack());
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
        <AadhaarStep
          isVerified={isVerified}
          onVerifyPress={handleInitializeAadhaar}
          isLoading={isAadhaarLoading}
        />
      ),
      4: (
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
      5: (
        <DocumentStep
          {...{ formData, setFormData, errors, clearFieldError }}
          pincodeLoading={pincodeLoading}
        />
      ),
      6: (
        <BankDetailStep
          {...{ formData, setFormData, errors, clearFieldError }}
          onBankDetailsChange={handleBankDetailsChange}
          onVerifyBankAccount={handleVerifyBankAccount}
          onEditBankDetails={handleEditBankDetails}
          isVerifyingBank={isVerifyingBank}
          isBankVerified={isBankVerified}
        />
      ),
      7: (
        <VehicleStep {...{ formData, setFormData, errors, clearFieldError }} />
      ),
    })[step] || null;
  const getButtonText = () => {
    if (isLoading || isAadhaarLoading) return null;
    if (step === 1)
      return isRateLimited ? `Wait ${countdown}s` : 'Send Verification Code';
    if (step === 2) return 'Verify & Continue';
    if (step === 3) return 'Continue';
    if (step === 7) return 'Complete Registration';
    return 'Continue';
  };
  const isButtonDisabled = () => {
    if (isLoading || isAadhaarLoading) return true;
    if (step === 1 && isRateLimited) return true;
    if (step === 3 && !isVerified) return true;
    return !isCurrentStepValid();
  };

  // ... (WebView render logic remains unchanged) ...
  if (verificationUrl) {
    return (
      <SafeAreaView style={styles.container}>
        {' '}
        <View style={styles.webviewHeader}>
          {' '}
          <TouchableOpacity onPress={() => setVerificationUrl(null)}>
            <Text style={styles.webviewHeaderButton}>Cancel</Text>{' '}
          </TouchableOpacity>{' '}
          <Text style={styles.webviewHeaderText}>Aadhaar Verification</Text>
          <View style={{ width: 60 }} />{' '}
        </View>{' '}
        <WebView
          source={{ uri: verificationUrl }}
          onNavigationStateChange={handleWebViewNavigation}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loaderContainer}>
              {' '}
              <ActivityIndicator size="large" color={THEME.primary} />{' '}
            </View>
          )}
        />{' '}
      </SafeAreaView>
    );
  }

  // --- / / / ---
  // --- MODIFICATION: Added a gap to the keyboardVerticalOffset ---
  // --- / / / ---
  const KEYBOARD_GAP = 30; // <-- Define the gap you want

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={THEME.primaryDark}
        translucent={false}
      />
      {/* This KeyboardAvoidingView will push the button up when the keyboard appears */}
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        // --- MODIFIED THIS LINE ---
        keyboardVerticalOffset={
          Platform.OS === 'ios'
            ? KEYBOARD_GAP
            : -StatusBar.currentHeight + KEYBOARD_GAP
        } // Adjust offset
        // --- END MODIFICATION ---
      >
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

        {/* Use a standard ScrollView for the content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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

        {/* The button is now a sibling of the ScrollView, inside the KeyboardAvoidingView */}
        {!(step === 3 && !isVerified) && (
          <View style={styles.bottomContainer}>
            <TouchableOpacity
              onPress={handleNext}
              disabled={isButtonDisabled()}
            >
              <LinearGradient
                colors={
                  isButtonDisabled()
                    ? ['#BDBDBD', '#BDBDBD']
                    : [THEME.primary, THEME.primaryDark]
                }
                style={styles.nextButton}
              >
                {isLoading || isAadhaarLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.buttonText}>{getButtonText()}</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Styles (Unchanged)
// ... (styles remain the same)
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
    flex: 1, // This makes the ScrollView take up the available space
    backgroundColor: THEME.background,
  },
  scrollContent: {
    flexGrow: 1, // Ensures content can grow
    padding: 20, // Padding is now on the scroll content, not the view
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
  webviewHeader: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: THEME.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.borderLight,
  },
  webviewHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.textPrimary,
  },
  webviewHeaderButton: {
    fontSize: 16,
    color: THEME.primary,
    fontWeight: '500',
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
});

export default RegisterScreen;
