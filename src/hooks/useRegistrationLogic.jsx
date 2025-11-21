import { useState, useRef, useEffect, useCallback } from 'react';
import { Alert, Animated, Platform, Keyboard, StatusBar } from 'react-native';
import axios from 'axios';
import { API_URL } from '../config/config';

import PhoneStep from '../components/registration/PhoneStep';
import OTPStep from '../components/registration/OTPStep';
import AadhaarStep from '../components/registration/AadhaarStep';
import PersonalInfoStep from '../components/registration/PersonalInfoStep';
import DocumentStep from '../components/registration/DocumentStep';
import BankDetailStep from '../components/registration/BankDetailStep';
import VehicleStep from '../components/registration/VehicleStep';

export const useRegistrationLogic = ({ route, navigation }) => {
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
  const AADHAAR_CALLBACK_URL = 'https://digittransway.com/aadhar-callback';
  const [isVerifyingBank, setIsVerifyingBank] = useState(false);
  const [isBankVerified, setIsBankVerified] = useState(false); 

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    dob: null,
    gender: '',
    emergency_contact: '',
    aadhar_number: '', 
    aadhar_number_manual: '',
    pan_number: '',
    rc_number: '',
    rc_number_manual: '',
    full_address: '',
    state: '',
    city: '',
    pincode: '',
    country: 'India',
    same_address: true,
    aadhaar_front: null, 
    aadhaar_back: null, 
    pan_image: null,
    rc_image: null,
    dl_number: '',
    dl_number_manual: '',
    dl_image: null,
    gst_number: '',
    gst_number_manual: '',
    rc_manual: false, 
    dl_manual: false, 
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
  }, [step, fadeAnim, slideAnim, progressAnim]);

  useEffect(() => {
    return () => timerRef && clearInterval(timerRef);
  }, [timerRef]); 

  useEffect(() => {
    const key = route?.params?.user_type_key;
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
  }, [route, navigation]); 

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

  const handleWebViewNavigation = navState => {
    const { url } = navState;
    console.log('WebView URL Changed:', url);

    if (url.startsWith(AADHAAR_CALLBACK_URL)) {
      setVerificationUrl(null); 

      const urlParams = new URLSearchParams(url.split('?')[1] || '');
      const status = urlParams.get('status');
      const clientId = urlParams.get('client_id');
      console.log('Callback Params:', { status, clientId });

      if (status === 'success') {
        if (clientId) {
          fetchAadhaarData(clientId);
        } else {
          Alert.alert('Verification Error', 'Client ID not found in callback.');
          setIsVerified(false);
        }
      } else {
        Alert.alert(
          'Verification Failed',
          'Aadhaar verification was not successful. Please try again.',
        );
        setIsVerified(false);
      }
    }
  };

  const fetchAadhaarData = async clientId => {
    setIsAadhaarLoading(true);
    try {
      if (!accessToken)
        throw new Error('Authentication session expired. Please restart.');

      const response = await axios.post(
        `${API_URL}/api/vendor/auth/aadhaar/verify`,
        { client_id: clientId },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      if (response.data.success) {
        const data = response.data.data;
        setFormData(prev => ({
          ...prev,
          name: data.full_name || prev.name,
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
              : 'other',
          aadhar_number: data.masked_aadhaar
            ? data.masked_aadhaar.replace(/X/g, '')
            : prev.aadhar_number,
        }));
        setIsVerified(true);
        Alert.alert(
          'Aadhaar Verified!',
          'Your data has been pre-filled. Please review and continue.',
          [{ text: 'OK', onPress: () => setStep(4) }],
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
      setIsVerified(false);
    } finally {
      setIsAadhaarLoading(false);
    }
  };

  const handleVerifyBankAccount = async () => {
    if (!accessToken) {
      Alert.alert('Error', 'Authentication session expired. Please restart.');
      return;
    }
    clearFieldError('bank_account');
    clearFieldError('account_number');
    clearFieldError('ifsc'); //digittransway.com/aadhar-callback';
    if (formData.account_number.trim() || formData.ifsc.trim()) {
      if (!formData.account_number.trim() || !formData.ifsc.trim()) {
        setErrors(prev => ({
          ...prev,
          bank_account:
            'Please enter both Account Number and IFSC Code to verify.',
        }));
        return;
      }
    } else {
      //digittransway.com/aadhar-callback';
      setIsBankVerified(false);
      return;
    }

    setIsVerifyingBank(true);
    try {
      const res = await axios.post(
        `${API_URL}/api/vendor/auth/verify-bank-account`,
        { account_number: formData.account_number, ifsc: formData.ifsc },
        { headers: { Authorization: `Bearer ${accessToken}` } },
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
      setErrors(prev => ({ ...prev, bank_account: errorMsg }));
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
      const registrationData = new FormData(); //digittransway.com/aadhar-callback';
      const excludeFields = [
        'password',
        'account_holder_name',
        'rc_manual',
        'dl_manual',
      ];

      Object.keys(formData).forEach(key => {
        if (excludeFields.includes(key)) return;
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
        } else if (key === 'aadhaar_back' && value) {
          registrationData.append('aadhaar_back', {
            uri: value.uri,
            type: value.type,
            name: value.fileName,
          });
        } else if (key === 'pan_image' && value) {
          registrationData.append('pan_image', {
            uri: value.uri,
            type: value.type,
            name: value.fileName,
          });
        } else if (key === 'rc_image' && value) {
          registrationData.append('rc_image', {
            uri: value.uri,
            type: value.type,
            name: value.fileName,
          });
        } else if (key === 'dl_image' && value) {
          registrationData.append('dl_image', {
            uri: value.uri,
            type: value.type,
            name: value.fileName,
          });
        } else if (
          //digittransway.com/aadhar-callback';
          key === 'declaration' ||
          key === 'same_address'
        ) {
          registrationData.append(key, value ? '1' : '0');
        } else if (value !== null && value !== '' && value !== undefined) {
          //digittransway.com/aadhar-callback';
          //digittransway.com/aadhar-callback';
          //digittransway.com/aadhar-callback';
          registrationData.append(key, String(value));
        }
      });

      if (userTypeKey) registrationData.append('user_type_key', userTypeKey);
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

  const fetchLocationData = async pincode => {
    if (!pincode || pincode.length !== 6) return;
    setPincodeLoading(true);
    try {
      if (!accessToken)
        throw new Error('Authentication token not available yet.');
      const response = await axios.get(
        `${API_URL}/api/pincode/location?pincode=${pincode}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
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
    const pincode = formData.pincode || '';
    if (pincode.length === 0) {
      setFormData(prev => ({ ...prev, state: null, city: null }));
    }
    if (pincode.length === 6 && accessToken) {
      fetchLocationData(pincode);
    }
  }, [formData.pincode, accessToken]); //digittransway.com/aadhar-callback';

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
  }; //digittransway.com/aadhar-callback';
  //digittransway.com/aadhar-callback';

  const isStep4ValidPure = () => {
    //digittransway.com/aadhar-callback';
    //digittransway.com/aadhar-callback';

    //digittransway.com/aadhar-callback';
    const effectiveAadharNumber =
      formData.aadhar_number.trim() || formData.aadhar_number_manual.trim();

    //digittransway.com/aadhar-callback';
    const effectiveGstNumber =
      formData.gst_number.trim() || formData.gst_number_manual.trim();

    const isGstValid = !effectiveGstNumber || effectiveGstNumber.length === 15;

    return (
      effectiveAadharNumber && //digittransway.com/aadhar-callback';
      formData.aadhaar_front &&
      formData.aadhaar_back &&
      isGstValid
    );
  };
  const isStep5ValidPure = () => {
    //digittransway.com/aadhar-callback';
    const effectivePanNumber = formData.pan_number.trim();
    const effectiveRcNumber = formData.rc_manual
      ? formData.rc_number_manual.trim()
      : formData.rc_number.trim();
    const effectiveDlNumber = formData.dl_manual
      ? formData.dl_number_manual.trim()
      : formData.dl_number.trim();

    //digittransway.com/aadhar-callback';
    if (effectivePanNumber && !formData.pan_image) return false;
    if (effectiveRcNumber && !formData.rc_image) return false;
    if (effectiveDlNumber && !formData.dl_image) return false;

    //digittransway.com/aadhar-callback';
    return true;
  };

  const isStep6ValidPure = () => {
    //digittransway.com/aadhar-callback';
    if (
      (formData.account_number.trim() || formData.ifsc.trim()) &&
      !isBankVerified
    ) {
      return false;
    }
    return true;
  }; //digittransway.com/aadhar-callback';

  const validateStep = () => {
    const e = {};
    if (step === 1) {
      if (!/^[6-9]\d{9}$/.test(phoneNumber))
        e.phoneNumber = 'Valid 10-digit number required';
    } else if (step === 2) {
      if (otp.length !== 4) e.otp = 'Enter the 4-digit OTP';
    } else if (step === 3) {
      if (!isVerified) e.aadhaar = 'Aadhaar verification must be completed.';
    } else if (step === 4) {
      //digittransway.com/aadhar-callback';
      const effectiveAadharNumber =
        formData.aadhar_number.trim() || formData.aadhar_number_manual.trim();

      if (!effectiveAadharNumber)
        e.aadhar_number = 'Aadhaar Number is required (auto or manual entry).';
      if (!formData.aadhaar_front)
        e.aadhaar_front = 'Aadhaar front image required';
      if (!formData.aadhaar_back)
        e.aadhaar_back = 'Aadhaar back image required';

      //digittransway.com/aadhar-callback';
      const effectiveGstNumber =
        formData.gst_number.trim() || formData.gst_number_manual.trim();

      if (effectiveGstNumber && effectiveGstNumber.length !== 15) {
        e.gst_number = 'GST Number must be 15 alphanumeric characters';
      }
    } else if (step === 5) {
      const effectivePanNumber = formData.pan_number.trim();
      const effectiveRcNumber = formData.rc_manual
        ? formData.rc_number_manual.trim()
        : formData.rc_number.trim();
      const effectiveDlNumber = formData.dl_manual
        ? formData.dl_number_manual.trim()
        : formData.dl_number.trim();

      //digittransway.com/aadhar-callback';
      if (effectivePanNumber && !formData.pan_image)
        e.pan_image = 'PAN image is required if PAN number is entered.';
      if (effectiveRcNumber && !formData.rc_image)
        e.rc_image = 'RC image is required if RC number is entered.';
      if (effectiveDlNumber && !formData.dl_image)
        e.dl_image = 'DL image is required if DL number is entered.';
    } else if (step === 6) {
      //digittransway.com/aadhar-callback';
      if (
        (formData.account_number.trim() || formData.ifsc.trim()) &&
        !isBankVerified
      ) {
        e.bank_account = 'Please verify provided bank account details';
      } //digittransway.com/aadhar-callback';
    } else if (step === 7) {
      //digittransway.com/aadhar-callback';
      if (formData.vehicle_category_id && !formData.vehicle_model_id) {
        e.vehicle_model_id =
          'Vehicle Model is required if Category is selected.';
      }
      if (formData.vehicle_model_id && !formData.vehicle_category_id) {
        e.vehicle_category_id =
          'Vehicle Category is required if Model is selected.';
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }; //digittransway.com/aadhar-callback';

  const isCurrentStepValid = () => {
    //digittransway.com/aadhar-callback';
    if (step === 1) return /^[6-9]\d{9}$/.test(phoneNumber);
    if (step === 2) return otp.length === 4; //digittransway.com/aadhar-callback';

    if (step === 3) return isVerified; //digittransway.com/aadhar-callback';

    if (step === 4) return isStep4ValidPure(); //digittransway.com/aadhar-callback';

    if (step === 5) return isStep5ValidPure(); //digittransway.com/aadhar-callback';

    if (step === 6) return isStep6ValidPure(); //digittransway.com/aadhar-callback';

    if (step === 7) {
      //digittransway.com/aadhar-callback';
      return (
        (!formData.vehicle_category_id && !formData.vehicle_model_id) ||
        (!!formData.vehicle_category_id && !!formData.vehicle_model_id)
      );
    }

    return false;
  }; //digittransway.com/aadhar-callback';

  const handleNext = () => {
    if (!validateStep()) return;
    Keyboard.dismiss();
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
      default:
        break;
    }
  };

  const handleBack = () => (step > 1 ? setStep(step - 1) : navigation.goBack()); //digittransway.com/aadhar-callback';

  const renderCurrentStep = () => {
    switch (step) {
      case 1:
        return <PhoneStep />;
      case 2:
        return <OTPStep />;
      case 3: //digittransway.com/aadhar-callback';
        return <AadhaarStep />;
      case 4:
        return <PersonalInfoStep />;
      case 5:
        return <DocumentStep />;
      case 6:
        return <BankDetailStep />;
      case 7:
        return <VehicleStep />;
      default:
        return null;
    }
  };

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
    return !isCurrentStepValid();
  }; //digittransway.com/aadhar-callback';

  const KEYBOARD_GAP = 30;
  const keyboardVerticalOffset =
    Platform.OS === 'ios'
      ? KEYBOARD_GAP
      : -StatusBar.currentHeight + KEYBOARD_GAP; //digittransway.com/aadhar-callback';

  return {
    //digittransway.com/aadhar-callback';
    step,
    setStep,
    isLoading,
    setIsLoading,
    userTypeKey,
    phoneNumber,
    setPhoneNumber,
    otp,
    setOtp,
    isRateLimited,
    countdown,
    accessToken,
    pincodeLoading,
    isAadhaarLoading,
    isVerified,
    verificationUrl,
    setVerificationUrl,
    isVerifyingBank,
    isBankVerified, //digittransway.com/aadhar-callback';
    formData,
    setFormData,
    showDatePicker,
    setShowDatePicker,
    errors,
    setErrors, //digittransway.com/aadhar-callback';

    fadeAnim,
    slideAnim,
    progressAnim,
    timerRef,
    setTimerRef, //digittransway.com/aadhar-callback';

    handlePhoneNumberChange,
    onDateChange,
    handleBankDetailsChange,
    handleEditBankDetails,
    handleInitializeAadhaar,
    handleWebViewNavigation,
    handleVerifyBankAccount,
    handleRegister,
    handleNext,
    handleBack, //digittransway.com/aadhar-callback';

    formatPhoneNumber,
    formatDate,
    clearFieldError,
    getStepInfo,
    getTotalSteps,
    renderCurrentStep,
    getButtonText,
    isButtonDisabled,
    keyboardVerticalOffset,
    startCountdown,
  };
};
