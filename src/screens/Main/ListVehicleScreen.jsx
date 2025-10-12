import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import { THEME } from '../../themes/colors';
import { API_URL } from '../../config/config';
import axios from 'axios';

const Icon = ({ name, size, style }) => {
  const getIcon = () => {
    switch (name) {
      case 'back': return '←';
      case 'camera': return '📷';
      case 'check': return '✓';
      default: return '';
    }
  };
  return <Text style={[{ fontSize: size }, style]}>{getIcon()}</Text>;
};

const ListVehicleScreen = ({ navigation, route }) => {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [brandModel, setBrandModel] = useState('');
  // --- MODIFIED: Added state for new fields ---
  const [vehicleLength, setVehicleLength] = useState('');
  const [tyreCount, setTyreCount] = useState('');
  const [weightCapacity, setWeightCapacity] = useState('');
  
  const [vehicleImage, setVehicleImage] = useState(null);
  const [rcImage, setRcImage] = useState(null);
  const [insuranceImage, setInsuranceImage] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  // --- MODIFIED: Added state for auth token ---
  const [accessToken, setAccessToken] = useState(null);

  const scrollAnim = useRef(new Animated.Value(0)).current;

  // --- MODIFIED: Get access token from route params ---
  useEffect(() => {
    const token = route.params?.accessToken;
    if (token) {
      console.log(accessToken)
      setAccessToken(token);
    } else {
      Alert.alert(
        "Authentication Error",
        "Your session is invalid. Please log in again.",
        [{ text: "OK", onPress: () => navigation.navigate('Login') }]
      );
    }
  }, [route.params?.accessToken]);


  const clearFieldError = (field) => {
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleImageSelection = (imageSetter, title, field) => {
    const options = {
      title: `Select ${title}`,
      quality: 0.7,
      maxWidth: 1024,
      maxHeight: 1024,
      storageOptions: { skipBackup: true, path: 'images' },
    };

    Alert.alert(
      `Upload ${title}`, 'Choose an option',
      [
        { text: 'Camera', onPress: () => launchCamera(options, (res) => handleImageResponse(res, imageSetter, field)) },
        { text: 'Gallery', onPress: () => launchImageLibrary(options, (res) => handleImageResponse(res, imageSetter, field)) },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  };

  const handleImageResponse = (response, imageSetter, field) => {
    if (response.didCancel) return;
    if (response.errorCode) {
      Alert.alert('Error', 'Could not select image. Please try again.');
      return;
    }
    if (response.assets && response.assets[0]) {
      imageSetter(response.assets[0]);
      clearFieldError(field);
    }
  };

  // --- MODIFIED: Updated validation to include new fields ---
  const validateForm = () => {
    const newErrors = {};
    if (!vehicleNumber.trim()) newErrors.vehicleNumber = 'Vehicle number is required';
    if (!vehicleType.trim()) newErrors.vehicleType = 'Vehicle type is required';
    if (!brandModel.trim()) newErrors.brandModel = 'Brand & model is required';
    if (!vehicleLength.trim()) newErrors.vehicleLength = 'Vehicle length is required';
    if (!tyreCount.trim()) newErrors.tyreCount = 'Tyre count is required';
    if (!weightCapacity.trim()) newErrors.weightCapacity = 'Weight capacity is required';
    if (!vehicleImage) newErrors.vehicleImage = 'Vehicle image is required';
    if (!rcImage) newErrors.rcImage = 'RC document is required';
    if (!insuranceImage) newErrors.insuranceImage = 'Insurance document is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // --- MODIFIED: Implemented the actual API call ---
  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Please fill all required fields correctly.');
      return;
    }
    if (!accessToken) {
        Alert.alert('Authentication Error', 'Cannot submit without a valid session.');
        return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append('vehicle_registration_number', vehicleNumber.toUpperCase().replace(/\s/g, ''));
    formData.append('vehicle_type', vehicleType);
    formData.append('vehicle_brand_model', brandModel);
    formData.append('vehicle_length', vehicleLength);
    formData.append('vehicle_tyre_count', tyreCount);
    formData.append('weight_capacity', weightCapacity);

    // Append images
    if (vehicleImage) {
        formData.append('vehicle_image', {
            uri: vehicleImage.uri,
            type: vehicleImage.type,
            name: vehicleImage.fileName,
        });
    }
    if (rcImage) {
        formData.append('vehicle_rc_document', {
            uri: rcImage.uri,
            type: rcImage.type,
            name: rcImage.fileName,
        });
    }
    if (insuranceImage) {
        formData.append('vehicle_insurance_document', {
            uri: insuranceImage.uri,
            type: insuranceImage.type,
            name: insuranceImage.fileName,
        });
    }

    try {
      await axios.post(
        `${API_URL}/api/vendor-vehicle/list`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      Alert.alert(
        'Success!',
        'Your vehicle has been submitted for approval.',
        [ { text: 'OK', onPress: () => navigation.navigate('Dashboard', { accessToken }) } ],
      );
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Something went wrong. Please try again.';
      Alert.alert('Submission Error', errorMessage);
      console.error('Submit error:', error.response?.data || error);
    } finally {
      setIsLoading(false);
    }
  };


  const headerTranslate = scrollAnim.interpolate({
    inputRange: [0, 80],
    outputRange: [0, -80],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.background} />
      
      <Animated.View
        style={[styles.header, { transform: [{ translateY: headerTranslate }] }]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="back" size={24} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>List Your Vehicle</Text>
        <View style={styles.headerPlaceholder} />
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex1}
      >
        <Animated.ScrollView
          contentContainerStyle={styles.scrollContent}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollAnim } } }],
            { useNativeDriver: true },
          )}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.introSection}>
            <Text style={styles.description}>
              Provide your vehicle details to get started with deliveries
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚛 Vehicle Information</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Vehicle Registration Number *</Text>
              <TextInput
                style={[styles.input, errors.vehicleNumber && styles.inputError]}
                placeholder="e.g., MH12AB1234"
                placeholderTextColor={THEME.placeholder}
                value={vehicleNumber}
                onChangeText={(text) => {
                  setVehicleNumber(text.toUpperCase());
                  clearFieldError('vehicleNumber');
                }}
                autoCapitalize="characters"
                maxLength={13}
              />
              {errors.vehicleNumber && <Text style={styles.errorText}>{errors.vehicleNumber}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Vehicle Type *</Text>
              <TextInput
                style={[styles.input, errors.vehicleType && styles.inputError]}
                placeholder="e.g., Mini Truck, Pickup Van"
                placeholderTextColor={THEME.placeholder}
                value={vehicleType}
                onChangeText={(text) => {
                  setVehicleType(text);
                  clearFieldError('vehicleType');
                }}
              />
              {errors.vehicleType && <Text style={styles.errorText}>{errors.vehicleType}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Brand & Model *</Text>
              <TextInput
                style={[styles.input, errors.brandModel && styles.inputError]}
                placeholder="e.g., Tata Ace, Mahindra Bolero"
                placeholderTextColor={THEME.placeholder}
                value={brandModel}
                onChangeText={(text) => {
                  setBrandModel(text);
                  clearFieldError('brandModel');
                }}
              />
              {errors.brandModel && <Text style={styles.errorText}>{errors.brandModel}</Text>}
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Vehicle Length (in feet) *</Text>
              <TextInput
                style={[styles.input, errors.vehicleLength && styles.inputError]}
                placeholder="e.g., 8"
                placeholderTextColor={THEME.placeholder}
                value={vehicleLength}
                onChangeText={(text) => {
                  setVehicleLength(text.replace(/[^0-9.]/g, ''));
                  clearFieldError('vehicleLength');
                }}
                keyboardType="numeric"
              />
              {errors.vehicleLength && <Text style={styles.errorText}>{errors.vehicleLength}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Tyre Count *</Text>
              <TextInput
                style={[styles.input, errors.tyreCount && styles.inputError]}
                placeholder="e.g., 4"
                placeholderTextColor={THEME.placeholder}
                value={tyreCount}
                onChangeText={(text) => {
                  setTyreCount(text.replace(/[^0-9]/g, ''));
                  clearFieldError('tyreCount');
                }}
                keyboardType="numeric"
              />
              {errors.tyreCount && <Text style={styles.errorText}>{errors.tyreCount}</Text>}
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Weight Capacity (in tons) *</Text>
              <TextInput
                style={[styles.input, errors.weightCapacity && styles.inputError]}
                placeholder="e.g., 2"
                placeholderTextColor={THEME.placeholder}
                value={weightCapacity}
                onChangeText={(text) => {
                  setWeightCapacity(text.replace(/[^0-9.]/g, ''));
                  clearFieldError('weightCapacity');
                }}
                keyboardType="numeric"
              />
              {errors.weightCapacity && <Text style={styles.errorText}>{errors.weightCapacity}</Text>}
            </View>

          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Upload Documents</Text>

            <View style={styles.uploadContainer}>
              <Text style={styles.uploadLabel}>Vehicle Image *</Text>
              <TouchableOpacity
                style={[styles.uploadButton, errors.vehicleImage && styles.uploadButtonError]}
                onPress={() => handleImageSelection(setVehicleImage, 'Vehicle Image', 'vehicleImage')}
              >
                {vehicleImage ? (
                  <View style={styles.imageContainer}>
                    <Image source={{ uri: vehicleImage.uri }} style={styles.uploadImage} />
                    <View style={styles.imageOverlay}><Icon name="check" size={20} style={styles.checkIcon} /></View>
                  </View>
                ) : (
                  <>
                    <Icon name="camera" size={32} style={styles.cameraIcon} />
                    <Text style={styles.uploadText}>Tap to upload vehicle photo</Text>
                  </>
                )}
              </TouchableOpacity>
              {errors.vehicleImage && <Text style={styles.errorText}>{errors.vehicleImage}</Text>}
            </View>

            <View style={styles.uploadContainer}>
              <Text style={styles.uploadLabel}>Registration Certificate (RC) *</Text>
              <TouchableOpacity
                style={[styles.uploadButton, errors.rcImage && styles.uploadButtonError]}
                onPress={() => handleImageSelection(setRcImage, 'RC Document', 'rcImage')}
              >
                {rcImage ? (
                  <View style={styles.imageContainer}>
                    <Image source={{ uri: rcImage.uri }} style={styles.uploadImage} />
                    <View style={styles.imageOverlay}><Icon name="check" size={20} style={styles.checkIcon} /></View>
                  </View>
                ) : (
                  <>
                    <Text style={styles.documentIcon}>📄</Text>
                    <Text style={styles.uploadText}>Tap to upload RC</Text>
                  </>
                )}
              </TouchableOpacity>
              {errors.rcImage && <Text style={styles.errorText}>{errors.rcImage}</Text>}
            </View>

            <View style={styles.uploadContainer}>
              <Text style={styles.uploadLabel}>Vehicle Insurance *</Text>
              <TouchableOpacity
                style={[styles.uploadButton, errors.insuranceImage && styles.uploadButtonError]}
                onPress={() => handleImageSelection(setInsuranceImage, 'Insurance Document', 'insuranceImage')}
              >
                {insuranceImage ? (
                  <View style={styles.imageContainer}>
                    <Image source={{ uri: insuranceImage.uri }} style={styles.uploadImage} />
                    <View style={styles.imageOverlay}><Icon name="check" size={20} style={styles.checkIcon} /></View>
                  </View>
                ) : (
                  <>
                    <Text style={styles.documentIcon}>📋</Text>
                    <Text style={styles.uploadText}>Tap to upload insurance</Text>
                  </>
                )}
              </TouchableOpacity>
              {errors.insuranceImage && <Text style={styles.errorText}>{errors.insuranceImage}</Text>}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton]}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isLoading ? ['#BDBDBD', '#BDBDBD'] : [THEME.primary, THEME.primary]}
              style={styles.submitButtonGradient}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>List My Vehicle</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  flex1: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: THEME.surface,
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.borderLight,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  backIcon: {
    fontWeight: 'bold',
    color: THEME.textPrimary,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.textPrimary,
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollContent: {
    paddingTop: 110,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  introSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: THEME.textSecondary,
    lineHeight: 22,
  },
  section: {
    backgroundColor: THEME.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.textPrimary,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textPrimary,
    marginBottom: 8,
  },
  input: {
    padding: 16,
    fontSize: 16,
    color: THEME.textPrimary,
    borderWidth: 2,
    borderColor: THEME.border,
    borderRadius: 12,
    backgroundColor: THEME.background,
  },
  inputError: {
    borderColor: THEME.error,
  },
  errorText: {
    fontSize: 12,
    color: THEME.error,
    marginTop: 4,
  },
  uploadContainer: {
    marginBottom: 20,
  },
  uploadLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textPrimary,
    marginBottom: 8,
  },
  uploadButton: {
    height: 140,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: THEME.border,
    backgroundColor: THEME.background,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  uploadButtonError: {
    borderColor: THEME.error,
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  uploadImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  imageOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: THEME.primary,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  cameraIcon: {
    color: THEME.primary,
    marginBottom: 8,
  },
  documentIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  uploadText: {
    color: THEME.textPrimary,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  submitButton: {
    borderRadius: 16,
    marginTop: 12,
  },
  submitButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ListVehicleScreen;