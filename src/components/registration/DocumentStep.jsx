import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert, 
} from 'react-native';
import ModernInput from '../common/ModernInput';
import { THEME } from '../../themes/colors';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker'; 
import RadioButton from '../common/RadioButton'; 
import { useRegistrationContext } from '../../context/RegistrationContext';

const DocumentStep = () => {
  const { formData, setFormData, errors, clearFieldError, pincodeLoading } =
    useRegistrationContext();
  
  const imageOptions = {
    mediaType: 'photo',
    includeBase64: false,
    maxHeight: 2000,
    maxWidth: 2000,
    quality: 0.8,
  };

  const createResponseHandler = useCallback(
    imageKey => response => {
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

  const pickPanImage = useCallback(
    () => handleImagePick('pan_image', 'Upload PAN Image'),
    [handleImagePick],
  );
  const pickRcImage = useCallback(
    () => handleImagePick('rc_image', 'Upload RC Image'),
    [handleImagePick],
  );
  const pickDlImage = useCallback(
    () => handleImagePick('dl_image', 'Upload DL Image'),
    [handleImagePick],
  ); 

  const handleDlNumberChange = useCallback(
    text => {
      setFormData(prev => ({
        ...prev,
        [prev.dl_manual ? 'dl_number_manual' : 'dl_number']: text,
      }));
      clearFieldError('dl_number');
    },
    [setFormData, clearFieldError],
  );

  const handleRcModeChange = useCallback(
    isManual => {
      setFormData(prev => ({ ...prev, rc_manual: isManual }));
    },
    [setFormData],
  );

  const handleDlModeChange = useCallback(
    isManual => {
      setFormData(prev => ({ ...prev, dl_manual: isManual }));
    },
    [setFormData],
  );

  const handleRcNumberChange = useCallback(
    text => {
      setFormData(prev => ({
        ...prev,
        [prev.rc_manual ? 'rc_number_manual' : 'rc_number']: text,
      }));
      clearFieldError('rc_number');
    },
    [setFormData, clearFieldError],
  );

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
        {/* --- PAN SECTION --- */}
        <Text style={styles.sectionLabel}>Identity Documents</Text>
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
        <UploadButton
          title="Upload PAN Image"
          file={formData.pan_image}
          error={errors.pan_image}
          onPress={pickPanImage}
        />
        {/* --- RC SECTION --- */}
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>
          Vehicle RC Details
        </Text>
        <View style={styles.radioRow}>
          <RadioButton
            label="Auto-Verify"
            selected={!formData.rc_manual}
            onSelect={() => handleRcModeChange(false)}
          />
          <RadioButton
            label="Manual Upload"
            selected={formData.rc_manual}
            onSelect={() => handleRcModeChange(true)}
          />
        </View>
        <ModernInput
          placeholder="Vehicle RC Number"
          value={
            formData.rc_manual ? formData.rc_number_manual : formData.rc_number
          }
          onChangeText={handleRcNumberChange}
          error={errors.rc_number}
        />
        <UploadButton
          title="Upload RC Image"
          file={formData.rc_image}
          error={errors.rc_image}
          onPress={pickRcImage}
        />
        {/* --- DL SECTION --- */}
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>
          Driving License Details
        </Text>
        <View style={styles.radioRow}>
          <RadioButton
            label="Auto-Verify"
            selected={!formData.dl_manual}
            onSelect={() => handleDlModeChange(false)}
          />
          <RadioButton
            label="Manual Upload"
            selected={formData.dl_manual}
            onSelect={() => handleDlModeChange(true)}
          />
        </View>
        <ModernInput
          placeholder="Driving License Number"
          value={
            formData.dl_manual ? formData.dl_number_manual : formData.dl_number
          }
          onChangeText={handleDlNumberChange}
          error={errors.dl_number}
          autoCapitalize="characters"
        />
        <UploadButton
          title="Upload DL Image"
          file={formData.dl_image}
          error={errors.dl_image}
          onPress={pickDlImage}
        />
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


const UploadButton = ({ title, file, error, onPress }) => (
  <>
    <TouchableOpacity
      style={[styles.uploadButton, error && styles.uploadError]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.uploadIcon}>
        <Text style={styles.uploadIconText}>{file ? '✓' : '📷'}</Text>
      </View>
      <View style={styles.uploadContent}>
        <Text style={[styles.uploadTitle, file && { color: THEME.success }]}>
          {file ? `${title.split(' ')[1]} Uploaded` : `${title}*`}
        </Text>
        <Text
          style={styles.uploadSubtitle}
          numberOfLines={1}
          ellipsizeMode="middle"
        >
          {file?.fileName || 'JPG or PNG, max 5MB'}
        </Text>
      </View>
      <Text style={styles.chevronIcon}>›</Text>
    </TouchableOpacity>
    {error && <Text style={styles.errorText}>{error}</Text>}
  </>
);


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
    marginTop: -12,
  },
  disabledInputBackground: {
    backgroundColor: THEME.greyLight || '#f0f0f0',
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
    marginTop: -12, 
    marginBottom: 8,
    paddingLeft: 4,
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
  radioRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 24,
    marginBottom: 16,
    marginLeft: 8,
  },
});

export default DocumentStep;
