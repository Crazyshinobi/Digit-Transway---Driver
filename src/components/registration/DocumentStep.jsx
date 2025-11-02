import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import ModernInput from '../common/ModernInput';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { THEME } from '../../themes/colors';

const DocumentStep = ({
  formData,
  setFormData,
  errors,
  clearFieldError,
  pincodeLoading,
}) => {
  // ... (imageOptions, handleImageResponse, handleImagePick functions are unchanged) ...
  const imageOptions = {
    mediaType: 'photo',
    includeBase64: false,
    maxHeight: 2000,
    maxWidth: 2000,
    quality: 0.8,
  };

  const handleImageResponse = response => {
    if (response.didCancel) {
      console.log('User cancelled image picker');
    } else if (response.error) {
      Alert.alert(
        'Error',
        `ImagePicker Error: ${response.errorMessage || response.error}`,
      );
    } else if (response.assets && response.assets[0]) {
      const asset = response.assets[0];
      setFormData(prev => ({
        ...prev,
        aadhaar_front: {
          uri: asset.uri,
          type: asset.type,
          fileName: asset.fileName || `aadhaar_front_${Date.now()}.jpg`,
        },
      }));
      clearFieldError('aadhaar_front');
    }
  };

  const handleImagePick = () => {
    Alert.alert(
      'Select Image Source',
      'Choose an option to upload your document.',
      [
        {
          text: 'Take Photo',
          onPress: () => launchCamera(imageOptions, handleImageResponse),
        },
        {
          text: 'Choose from Gallery',
          onPress: () => launchImageLibrary(imageOptions, handleImageResponse),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <View style={styles.iconContainer}>
          <Text style={styles.stepIcon}>📄</Text>
        </View>
        <Text style={styles.stepTitle}>Documents & Address</Text>
        <Text style={styles.stepSubtitle}>Verify your identity securely</Text>
      </View>

      <View style={styles.inputCard}>
        <Text style={styles.sectionLabel}>Identity Documents</Text>

        {/* --- AADHAAR NUMBER INPUT REMOVED --- */}

        <ModernInput
          placeholder="PAN Number (ABCDE1234F)"
          value={formData.pan_number}
          onChangeText={text => {
            setFormData(prev => ({ ...prev, pan_number: text }));
            clearFieldError('pan_number');
          }}
          error={errors.pan_number}
          autoCapitalize="characters"
          maxLength={10}
        />

        <ModernInput
          placeholder="Vehicle RC Number"
          autoCapitalize="characters"
          value={formData.rc_number}
          onChangeText={text => {
            setFormData(prev => ({ ...prev, rc_number: text }));
            clearFieldError('rc_number');
          }}
          error={errors.rc_number}
        />

        {/* --- Aadhaar Front Upload Button (Unchanged) --- */}
        <TouchableOpacity
          style={[
            styles.uploadButton,
            errors.aadhaar_front && styles.uploadError,
          ]}
          onPress={handleImagePick}
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
                ? 'Aadhaar Uploaded Successfully'
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
          <Text style={styles.errorText}>{errors.aadhaar_front}</Text>
        )}

        {/* --- ADDRESS SECTION (Unchanged) --- */}
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>
          Address Information
        </Text>

        <ModernInput
          placeholder="Complete Address"
          value={formData.full_address}
          onChangeText={text => {
            setFormData(prev => ({ ...prev, full_address: text }));
            clearFieldError('full_address');
          }}
          error={errors.full_address}
          multiline
          numberOfLines={3}
          inputStyle={{ minHeight: 80, textAlignVertical: 'top' }}
        />

        <View style={styles.rowContainer}>
          <View style={styles.halfWidth}>
            <ModernInput
              placeholder="State (Auto-filled)"
              value={formData.state || ''}
              editable={false}
              containerStyle={
                !formData.state ? styles.disabledInputBackground : null
              }
            />
          </View>
          <View style={styles.halfWidth}>
            <ModernInput
              placeholder="City (Auto-filled)"
              value={formData.city || ''}
              editable={false}
              containerStyle={
                !formData.city ? styles.disabledInputBackground : null
              }
            />
          </View>
        </View>

        <View style={styles.rowContainer}>
          <View style={[styles.halfWidth, styles.pincodeContainer]}>
            <ModernInput
              placeholder="Pincode"
              value={formData.pincode}
              onChangeText={text => {
                const numericText = text.replace(/[^0-9]/g, '');
                setFormData(prev => ({ ...prev, pincode: numericText }));
                clearFieldError('pincode');
              }}
              error={errors.pincode}
              keyboardType="numeric"
              maxLength={6}
            />
            {pincodeLoading && (
              <ActivityIndicator
                style={styles.pincodeSpinner}
                color={THEME.primary}
                size="small"
              />
            )}
          </View>
          <View style={styles.halfWidth}>
            <ModernInput
              placeholder="Country"
              value={formData.country}
              editable={false}
              containerStyle={styles.disabledInputBackground}
            />
          </View>
        </View>

        {/* --- Checkbox (Unchanged) --- */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() =>
            setFormData(prev => ({ ...prev, same_address: !prev.same_address }))
          }
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.modernCheckbox,
              formData.same_address && styles.checkedCheckbox,
            ]}
          >
            {formData.same_address && <Text style={styles.checkIcon}>✓</Text>}
          </View>
          <Text style={styles.checkboxText}>
            Use this address as permanent address
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// --- Styles (Unchanged, but disabledInputBackground is used) ---
const styles = StyleSheet.create({
  // ... (all other styles)
  disabledInputBackground: {
    backgroundColor: THEME.greyLight || '#f0f0f0', // Provide a fallback color
  },
  // ... (all other styles)
  stepContainer: {
    flex: 1,
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
    fontSize: 25,
    fontWeight: '700',
    color: THEME.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  stepSubtitle: {
    fontSize: 15,
    color: THEME.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  inputCard: {
    backgroundColor: THEME.surface,
    borderRadius: 20,
    padding: 20,
    shadowColor: THEME.shadowLight,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: THEME.borderLight,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.textPrimary,
    marginBottom: 16,
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
  chevronIcon: {
    fontSize: 20,
    color: THEME.textSecondary,
    fontWeight: 'bold',
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 0,
  },
  halfWidth: {
    flex: 1,
  },
  pincodeContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  pincodeSpinner: {
    position: 'absolute',
    right: 15,
    top: '50%',
    marginTop: -12, // Adjust based on input height if needed
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  modernCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: THEME.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkedCheckbox: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  checkIcon: {
    color: THEME.textOnPrimary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: THEME.textPrimary,
    lineHeight: 20,
  },
  errorText: {
    color: THEME.error,
    fontSize: 13,
    marginTop: -8,
    marginBottom: 8,
    paddingLeft: 4,
  },
});

export default DocumentStep;
