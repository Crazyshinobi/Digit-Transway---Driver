import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
  StatusBar,
  StyleSheet,
} from 'react-native';

// Simplified icon component with only essential icons
const Icon = ({ name, size, style }) => {
  const getIcon = () => {
    switch (name) {
      case 'back':
        return '←';
      case 'camera':
        return '📷';
      default:
        return '';
    }
  };
  return <Text style={[{ fontSize: size }, style]}>{getIcon()}</Text>;
};

const ListVehicleScreen = ({ navigation }) => {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [brandModel, setBrandModel] = useState('');

  const [vehicleImage, setVehicleImage] = useState(null);
  const [rcImage, setRcImage] = useState(null);
  const [insuranceImage, setInsuranceImage] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const scrollAnim = useRef(new Animated.Value(0)).current;

  // Placeholder function for image selection
  const handleImageSelection = (imageSetter, title) => {
    Alert.alert(
      `Upload ${title}`,
      'In a real app, this would open the camera or gallery.',
      [
        {
          text: 'OK',
          onPress: () =>
            imageSetter({
              uri: 'https://placehold.co/600x400/a29bfe/ffffff?text=Image+Preview',
            }),
        },
      ],
    );
  };

  const handleSubmit = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('DriverDashboard');
    }, 1500);
  };

  const headerTranslate = scrollAnim.interpolate({
    inputRange: [0, 80],
    outputRange: [0, -80],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <Animated.View
        style={[styles.header, {
          transform: [{ translateY: headerTranslate }],
        }]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="back" size={24} style={{ fontWeight: 'bold' }} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          List Your Vehicle
        </Text>
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
        >
          <Text style={styles.description}>
            Provide your vehicle details to get started
          </Text>

          {/* Vehicle Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Vehicle Information
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Vehicle Registration Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter registration number"
                placeholderTextColor="#999"
                value={vehicleNumber}
                onChangeText={setVehicleNumber}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Vehicle Type</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Mini Truck"
                placeholderTextColor="#999"
                value={vehicleType}
                onChangeText={setVehicleType}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Brand & Model</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Tata Ace"
                placeholderTextColor="#999"
                value={brandModel}
                onChangeText={setBrandModel}
              />
            </View>
          </View>

          {/* Document Upload Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Upload Documents
            </Text>

            <View style={styles.uploadContainer}>
              <Text style={styles.uploadLabel}>
                Vehicle Image
              </Text>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => handleImageSelection(setVehicleImage, 'Vehicle Image')}
              >
                {vehicleImage ? (
                  <Image
                    source={{ uri: vehicleImage.uri }}
                    style={styles.uploadImage}
                  />
                ) : (
                  <>
                    <Icon name="camera" size={24} style={styles.cameraIcon} />
                    <Text style={styles.uploadText}>Tap to upload vehicle photo</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.uploadContainer}>
              <Text style={styles.uploadLabel}>
                Registration Certificate (RC)
              </Text>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => handleImageSelection(setRcImage, 'RC')}
              >
                {rcImage ? (
                  <Image
                    source={{ uri: rcImage.uri }}
                    style={styles.uploadImage}
                  />
                ) : (
                  <>
                    <Text style={styles.documentIcon}>📄</Text>
                    <Text style={styles.uploadText}>Tap to upload RC</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.uploadContainer}>
              <Text style={styles.uploadLabel}>
                Vehicle Insurance
              </Text>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => handleImageSelection(setInsuranceImage, 'Insurance')}
              >
                {insuranceImage ? (
                  <Image
                    source={{ uri: insuranceImage.uri }}
                    style={styles.uploadImage}
                  />
                ) : (
                  <>
                    <Text style={styles.documentIcon}>📋</Text>
                    <Text style={styles.uploadText}>Tap to upload insurance</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? 'Submitting...' : 'List My Vehicle'}
            </Text>
          </TouchableOpacity>
        </Animated.ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
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
    backgroundColor: '#FFFFFF',
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollContent: {
    paddingTop: 110,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#4b5563',
    marginBottom: 24,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  input: {
    padding: 16,
    fontSize: 16,
    color: '#1f2937',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
  },
  uploadContainer: {
    marginBottom: 20,
  },
  uploadLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  uploadButton: {
    height: 128,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#9ca3af',
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  cameraIcon: {
    color: '#8b5cf6',
    marginBottom: 8,
  },
  documentIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  uploadText: {
    color: '#4b5563',
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#4285f4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginTop: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ListVehicleScreen;