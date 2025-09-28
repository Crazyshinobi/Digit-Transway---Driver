// src/components/registration/DocumentsStep.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import ModernInput from '../common/ModernInput';
import { launchImageLibrary } from 'react-native-image-picker';
import { THEME } from '../../themes/colors';

const DocumentStep = ({ formData, setFormData, errors, clearFieldError }) => {
  const handleImagePick = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        Alert.alert('Error', 'Failed to select image. Please try again.');
      } else if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        setFormData(prev => ({
          ...prev,
          aadhaar_front: {
            uri: asset.uri,
            type: asset.type,
            fileName: asset.fileName || `image_${Date.now()}.jpg`,
          },
        }));
        clearFieldError('aadhaar_front');
      }
    });
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

        <ModernInput
          placeholder="Aadhaar Number (12 digits)"
          value={formData.aadhar_number}
          onChangeText={text => {
            setFormData(prev => ({ ...prev, aadhar_number: text }));
            clearFieldError('aadhar_number');
          }}
          error={errors.aadhar_number}
          icon="🆔"
          keyboardType="numeric"
          maxLength={12}
        />

        <ModernInput
          placeholder="PAN Number (ABCDE1234F)"
          value={formData.pan_number}
          onChangeText={text => {
            setFormData(prev => ({ ...prev, pan_number: text.toUpperCase() }));
            clearFieldError('pan_number');
          }}
          error={errors.pan_number}
          icon="💳"
          autoCapitalize="characters"
          maxLength={10}
        />

        <ModernInput
          placeholder="Vehicle RC Number"
          value={formData.rc_number}
          onChangeText={text => {
            setFormData(prev => ({ ...prev, rc_number: text }));
            clearFieldError('rc_number');
          }}
          error={errors.rc_number}
          icon="📋"
        />

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
                : 'Upload Aadhaar Front'}
            </Text>
            <Text style={styles.uploadSubtitle}>
              {formData.aadhaar_front
                ? formData.aadhaar_front.fileName
                : 'JPG or PNG, max 5MB'}
            </Text>
          </View>
          <Text style={styles.chevronIcon}>›</Text>
        </TouchableOpacity>
        {errors.aadhaar_front && (
          <Text style={styles.errorText}>{errors.aadhaar_front}</Text>
        )}

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
          icon="🏠"
          multiline
          numberOfLines={3}
        />

        <View style={styles.rowContainer}>
          <View style={styles.halfWidth}>
            <ModernInput
              placeholder="State"
              value={formData.state}
              onChangeText={text => {
                setFormData(prev => ({ ...prev, state: text }));
                clearFieldError('state');
              }}
              error={errors.state}
              icon="🗺️"
            />
          </View>
          <View style={styles.halfWidth}>
            <ModernInput
              placeholder="City"
              value={formData.city}
              onChangeText={text => {
                setFormData(prev => ({ ...prev, city: text }));
                clearFieldError('city');
              }}
              error={errors.city}
              icon="🏙️"
            />
          </View>
        </View>

        <View style={styles.rowContainer}>
          <View style={styles.halfWidth}>
            <ModernInput
              placeholder="Pincode"
              value={formData.pincode}
              onChangeText={text => {
                setFormData(prev => ({ ...prev, pincode: text }));
                clearFieldError('pincode');
              }}
              error={errors.pincode}
              icon="📍"
              keyboardType="numeric"
              maxLength={6}
            />
          </View>
          <View style={styles.halfWidth}>
            <ModernInput
              placeholder="Country"
              value={formData.country}
              icon="🌍"
              editable={false}
            />
          </View>
        </View>

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

const styles = StyleSheet.create({
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
    padding: 20,
    borderWidth: 2,
    borderColor: THEME.primary,
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  uploadError: {
    borderColor: THEME.error,
    backgroundColor: `${THEME.error}08`,
  },
  uploadIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: THEME.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: THEME.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  uploadIconText: {
    fontSize: 24,
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
    marginBottom: 8,
  },
  halfWidth: {
    flex: 1,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    marginTop: 4,
  },
  modernCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: THEME.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkedCheckbox: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  checkIcon: {
    color: THEME.textOnPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxText: {
    flex: 1,
    fontSize: 15,
    color: THEME.textPrimary,
    lineHeight: 22,
  },
  errorText: {
    color: THEME.error,
    fontSize: 13,
    marginTop: 6,
    paddingLeft: 8,
    textAlign: 'center',
  },
});

export default DocumentStep;
