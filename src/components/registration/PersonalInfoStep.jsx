import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import ModernInput from '../common/ModernInput';
import RadioButton from '../common/RadioButton';
import DateTimePicker from '@react-native-community/datetimepicker';
import { THEME } from '../../themes/colors';

const PersonalInfoStep = ({
  formData,
  setFormData,
  errors,
  clearFieldError,
  showDatePicker,
  setShowDatePicker,
  formatDate,
  onDateChange,
}) => {
  // --- MODIFIED: Re-enabled name change ---
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

  // --- Password field is already commented out ---
  // const handlePasswordChange = useCallback( ... );

  const handleEmergencyContactChange = useCallback(
    text => {
      setFormData(prev => ({ ...prev, emergency_contact: text }));
      clearFieldError('emergency_contact');
    },
    [setFormData, clearFieldError],
  );

  // --- NEW: Added handler for Aadhaar number ---
  const handleAadhaarChange = useCallback(
    text => {
      setFormData(prev => ({ ...prev, aadhar_number: text }));
      clearFieldError('aadhar_number');
    },
    [setFormData, clearFieldError],
  );

  // --- MODIFIED: Always allow date picker to open ---
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

  // --- REMOVED: Check for auto-filled fields is no longer needed ---
  // const isNameAutofilled = !!formData.name;
  // const isDobAutofilled = !!formData.dob;
  // const isAadhaarAutofilled = !!formData.aadhar_number;

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
        {/* --- MODIFIED: Full Name (Editable) --- */}
        <ModernInput
          placeholder="Full Name (from Aadhaar)"
          value={formData.name}
          onChangeText={handleNameChange} // <-- Added
          error={errors.name}
          autoCapitalize="words"
          // editable={!isNameAutofilled} // <-- Removed
          // containerStyle={ // <-- Removed
          //   isNameAutofilled ? styles.disabledInputBackground : null
          // }
        />

        {/* --- MODIFIED: Aadhaar Number (Editable) --- */}
        <ModernInput
          placeholder="Aadhaar Number (from Aadhaar)"
          value={formData.aadhar_number}
          onChangeText={handleAadhaarChange} // <-- Added
          error={errors.aadhar_number}
          keyboardType="numeric"
          // editable={!isAadhaarAutofilled} // <-- Removed
          // containerStyle={ // <-- Removed
          //   isAadhaarAutofilled ? styles.disabledInputBackground : null
          // }
        />

        <ModernInput
          placeholder="Email Address"
          value={formData.email}
          onChangeText={handleEmailChange}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* --- Password field is already commented out --- */}

        {/* --- MODIFIED: Date of Birth (Editable) --- */}
        <TouchableOpacity
          style={[
            styles.datePickerButton,
            errors.dob && styles.inputError,
            // isDobAutofilled && styles.disabledInputBackground, // <-- Removed
          ]}
          onPress={handleDatePickerOpen}
          // activeOpacity={isDobAutofilled ? 1 : 0.7} // <-- Removed
          // disabled={isDobAutofilled} // <-- Removed
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
          {/* {!isDobAutofilled && <Text style={styles.chevronIcon}>›</Text>} <-- Removed */}
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
  // ... (all other styles remain)
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
  // --- REMOVED: Unused style ---
  // disabledInputBackground: {
  //   backgroundColor: THEME.greyLight || '#f0f0f0',
  //   borderColor: THEME.borderLight,
  // },
});

export default React.memo(PersonalInfoStep);
