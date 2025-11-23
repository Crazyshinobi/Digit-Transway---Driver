import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  Button,
} from 'react-native';
import ModernInput from '../common/ModernInput';
import RadioButton from '../common/RadioButton';
import DateTimePicker from '@react-native-community/datetimepicker';
import { THEME } from '../../themes/colors';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { useRegistrationContext } from '../../context/RegistrationContext';

const PersonalInfoStep = () => {
  const {
    formData,
    setFormData,
    errors,
    clearFieldError,
    showDatePicker,
    setShowDatePicker,
    formatDate,
    onDateChange,
  } = useRegistrationContext();
  const imageOptions = {
    mediaType: 'photo',
    includeBase64: false,
    maxHeight: 2000,
    maxWidth: 2000,
    quality: 0.8,
  };
  const [aadhaarFirst8, setAadhaarFirst8] = useState('');
  const [aadhaarInput, setAadhaarInput] = useState('');
  const aadhaarLast4 = (formData.aadhar_number || '').slice(-4);

  const createResponseHandler = useCallback(
    imageKey => response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
        return;
      }

      if (response.error || response.errorMessage) {
        Alert.alert(
          'Error',
          `ImagePicker Error: ${response.errorMessage || response.error}`,
        );
        return;
      }

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        setFormData(prev => ({
          ...prev,
          [imageKey]: {
            uri: asset.uri,
            type: asset.type,
            fileName: asset.fileName || `${imageKey}_${Date.now()}.jpg`,
          },
        }));
        clearFieldError(imageKey);
      }
    },
    [setFormData, clearFieldError],
  );

  const handleImagePick = useCallback(
    (imageKey, title) => {
      const responseHandler = createResponseHandler(imageKey);
      Alert.alert(
        title || 'Select Image Source',
        'Choose an option to upload your document.',
        [
          {
            text: 'Take Photo',
            onPress: () => launchCamera(imageOptions, responseHandler),
          },
          {
            text: 'Choose from Gallery',
            onPress: () => launchImageLibrary(imageOptions, responseHandler),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ],
        { cancelable: true },
      );
    },
    [createResponseHandler],
  );

  const pickAadhaarFront = useCallback(
    () => handleImagePick('aadhaar_front', 'Upload Aadhaar Front'),
    [handleImagePick],
  );

  const pickAadhaarBack = useCallback(
    () => handleImagePick('aadhaar_back', 'Upload Aadhaar Back'),
    [handleImagePick],
  );

  const handleNameChange = useCallback(
    text => {
      setFormData(prev => ({ ...prev, name: text }));
      clearFieldError('name');
    },
    [setFormData, clearFieldError],
  );

  const handleEmailChange = useCallback(
    text => {
      setFormData(prev => ({ ...prev, email: text }));
      clearFieldError('email');
    },
    [setFormData, clearFieldError],
  );

  const handleEmergencyContactChange = useCallback(
    text => {
      setFormData(prev => ({ ...prev, emergency_contact: text }));
      clearFieldError('emergency_contact');
    },
    [setFormData, clearFieldError],
  );

  // const handleAadhaarChange = useCallback(
  //   text => {
  //     setFormData(prev => ({ ...prev, aadhar_number_manual: text }));
  //     clearFieldError('aadhar_number');
  //   },
  //   [setFormData, clearFieldError],
  // );

  const handleAadhaarChange = text => {
    const first8 = text.replace(/\D/g, '').slice(0, 8);

    // Store what user types (for showing in input)
    setAadhaarInput(first8);

    // Build complete Aadhaar without showing it
    const last4 = (formData.aadhar_number || '').slice(-4);

    const full12 = first8 + last4;

    setFormData(prev => ({
      ...prev,
      aadhar_number: full12,
    }));

    clearFieldError('aadhar_number');
  };

  const handleGSTChange = useCallback(
    text => {
      const formattedText = text.toUpperCase();
      setFormData(prev => ({ ...prev, gst_number_manual: formattedText }));
      clearFieldError('gst_number');
    },
    [setFormData, clearFieldError],
  );

  const handleDatePickerOpen = useCallback(() => {
    setShowDatePicker(true);
  }, [setShowDatePicker]);

  const handleGenderSelect = useCallback(
    gender => {
      setFormData(prev => ({ ...prev, gender }));
      clearFieldError('gender');
    },
    [setFormData, clearFieldError],
  );

  const handleMaleSelect = useCallback(
    () => handleGenderSelect('male'),
    [handleGenderSelect],
  );
  const handleFemaleSelect = useCallback(
    () => handleGenderSelect('female'),
    [handleGenderSelect],
  );
  const handleOtherSelect = useCallback(
    () => handleGenderSelect('other'),
    [handleGenderSelect],
  );

  const formattedDate = useMemo(
    () => formatDate(formData.dob),
    [formatDate, formData.dob],
  );

  return (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <View style={styles.iconContainer}>
          <Text style={styles.stepIcon}>👤</Text>
        </View>

        <Text style={styles.stepTitle}>Personal Information</Text>
        <Text style={styles.stepSubtitle}>
          Please fill in or confirm your details
        </Text>
      </View>

      <View style={styles.inputCard}>
        <ModernInput
          placeholder="Full Name"
          value={formData.name}
          onChangeText={handleNameChange}
          error={errors.name}
          autoCapitalize="words"
        />

        <ModernInput
          placeholder="First 8-digits of Aadhaar*"
          value={aadhaarInput}
          onChangeText={handleAadhaarChange}
          maxLength={8}
          keyboardType="numeric"
        />

        {/* Aadhaar front upload */}
        <TouchableOpacity
          style={[
            styles.uploadButton,
            errors.aadhaar_front && styles.uploadError,
          ]}
          onPress={pickAadhaarFront}
          activeOpacity={0.7}
        >
          <View style={styles.uploadIcon}>
            <Text style={styles.uploadIconText}>
              {formData.aadhaar_front ? '✓' : '📷'}
            </Text>
          </View>

          <View style={styles.uploadContent}>
            <Text
              style={[
                styles.uploadTitle,
                formData.aadhaar_front && { color: THEME.success },
              ]}
            >
              {formData.aadhaar_front
                ? 'Aadhaar Front Uploaded'
                : 'Upload Aadhaar Front*'}
            </Text>

            <Text
              style={styles.uploadSubtitle}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {formData.aadhaar_front?.fileName || 'JPG or PNG, max 5MB'}
            </Text>
          </View>

          <Text style={styles.chevronIcon}>›</Text>
        </TouchableOpacity>

        {errors.aadhaar_front && (
          <Text style={styles.uploadErrorText}>{errors.aadhaar_front}</Text>
        )}

        {/* Aadhaar back upload */}
        <TouchableOpacity
          style={[
            styles.uploadButton,
            errors.aadhaar_back && styles.uploadError,
          ]}
          onPress={pickAadhaarBack}
          activeOpacity={0.7}
        >
          <View style={styles.uploadIcon}>
            <Text style={styles.uploadIconText}>
              {formData.aadhaar_back ? '✓' : '📷'}
            </Text>
          </View>

          <View style={styles.uploadContent}>
            <Text
              style={[
                styles.uploadTitle,
                formData.aadhaar_back && { color: THEME.success },
              ]}
            >
              {formData.aadhaar_back
                ? 'Aadhaar Back Uploaded'
                : 'Upload Aadhaar Back*'}
            </Text>

            <Text
              style={styles.uploadSubtitle}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {formData.aadhaar_back?.fileName || 'JPG or PNG, max 5MB'}
            </Text>
          </View>

          <Text style={styles.chevronIcon}>›</Text>
        </TouchableOpacity>

        {errors.aadhaar_back && (
          <Text style={styles.uploadErrorText}>{errors.aadhaar_back}</Text>
        )}

        <ModernInput
          placeholder="Email Address"
          value={formData.email}
          onChangeText={handleEmailChange}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <ModernInput
          placeholder="GST Number"
          value={formData.gst_number_manual || formData.gst_number}
          onChangeText={handleGSTChange}
          error={errors.gst_number}
          autoCapitalize="characters"
          maxLength={15}
        />

        <TouchableOpacity
          style={[styles.datePickerButton, errors.dob && styles.inputError]}
          onPress={handleDatePickerOpen}
        >
          <Text
            style={[
              styles.dateText,
              !formData.dob && { color: THEME.placeholder },
            ]}
          >
            {formattedDate}
          </Text>
          <Text style={styles.chevronIcon}>›</Text>
        </TouchableOpacity>

        {errors.dob && <Text style={styles.errorText}>{errors.dob}</Text>}

        <View style={styles.genderContainer}>
          <Text style={styles.sectionLabel}>Gender</Text>
          <View style={styles.radioContainer}>
            <RadioButton
              label="Male"
              selected={formData.gender === 'male'}
              onSelect={handleMaleSelect}
            />
            <RadioButton
              label="Female"
              selected={formData.gender === 'female'}
              onSelect={handleFemaleSelect}
            />
            <RadioButton
              label="Other"
              selected={formData.gender === 'other'}
              onSelect={handleOtherSelect}
            />
          </View>
        </View>

        {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}

        <ModernInput
          placeholder="Emergency Contact Number"
          value={formData.emergency_contact}
          onChangeText={handleEmergencyContactChange}
          error={errors.emergency_contact}
          keyboardType="phone-pad"
          maxLength={10}
        />
        {/* <Text>{formData}</Text> */}

        {/* <Button
          title="Next"
          onPress={() => {
            console.log('User Input (8 digits):', aadhaarInput);
            console.log('Full Aadhaar (12 digits):', formData.aadhar_number);
            console.log('last 4 digits from API:', aadhaarLast4);
          }}
        /> */}
        <View style={styles.bottomSpacer} />
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={formData.dob || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          maximumDate={new Date()}
          minimumDate={new Date(1950, 0, 1)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
    minHeight: 650,
  },
  stepHeader: {
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
    padding: 24,
    shadowColor: THEME.shadowLight,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: THEME.borderLight,
    marginBottom: 20,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.background,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: THEME.border,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 20,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: THEME.textPrimary,
    marginLeft: 12,
  },
  chevronIcon: {
    fontSize: 20,
    color: THEME.textSecondary,
    fontWeight: 'bold',
  },
  genderContainer: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.textPrimary,
    marginBottom: 16,
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  inputError: {
    borderColor: THEME.error,
    borderWidth: 2,
    backgroundColor: `${THEME.error}08`,
  },
  errorText: {
    color: THEME.error,
    fontSize: 13,
    marginTop: 6,
    paddingLeft: 8,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 40,
  },

  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.primarySurface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.borderLight,
    marginBottom: 16,
  },
  uploadError: {
    borderColor: THEME.error,
    backgroundColor: `${THEME.error}08`,
  },
  uploadIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: THEME.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  uploadIconText: {
    fontSize: 20,
    color: THEME.primary,
  },
  uploadContent: {
    flex: 1,
  },
  uploadTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME.primary,
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 12,
    color: THEME.textSecondary,
  },
  uploadErrorText: {
    color: THEME.error,
    fontSize: 13,
    marginTop: -8,
    marginBottom: 8,
    paddingLeft: 4,
  },
});

export default React.memo(PersonalInfoStep);
