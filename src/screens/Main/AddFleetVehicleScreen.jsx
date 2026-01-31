import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  Switch,
  StatusBar,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { THEME } from '../../themes/colors';
import { API_URL } from '../../config/config';

const CustomPicker = ({
  label,
  data,
  onSelect,
  selectedValue,
  placeholder,
  error,
  enabled = true,
}) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const selectedItem = data.find(item => item.value === selectedValue);
  const displayLabel = selectedItem ? selectedItem.label : placeholder;

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[
          styles.pickerButton,
          error && styles.errorBorder,
          !enabled && { opacity: 0.5 },
        ]}
        onPress={() => enabled && setModalVisible(true)}
        disabled={!enabled}
      >
        <Text
          style={[
            styles.pickerButtonText,
            !selectedItem && styles.placeholderText,
          ]}
        >
          {displayLabel}
        </Text>
        <Text style={styles.pickerIcon}>▼</Text>
      </TouchableOpacity>

      <Modal
        transparent
        visible={isModalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
          activeOpacity={1}
        >
          <View style={styles.modalContent}>
            <FlatList
              data={data}
              keyExtractor={item => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() => {
                    onSelect(item.value);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const AddFleetVehicleScreen = ({ navigation }) => {

  
  const [loading, setLoading] = useState(false);
  const [isModelsLoading, setIsModelsLoading] = useState(false);
  const [vehicleModels, setVehicleModels] = useState([]);

  const showImagePickerOptions = field => {
    Alert.alert(
      'Select Image Source',
      'Choose an option',
      [
        {
          text: 'Camera',
          onPress: () => openCamera(field),
        },
        {
          text: 'Gallery',
          onPress: () => openGallery(field),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true },
    );
  };

  const openCamera = field => {
    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.7,
        saveToPhotos: false,
      },
      response => {
        if (response.assets && response.assets[0]) {
          setDocs(prev => ({
            ...prev,
            [field]: response.assets[0],
          }));
        }
      },
    );
  };

  const openGallery = field => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.7,
      },
      response => {
        if (response.assets && response.assets[0]) {
          setDocs(prev => ({
            ...prev,
            [field]: response.assets[0],
          }));
        }
      },
    );
  };

  const pickImage = field => {
    showImagePickerOptions(field);
  };

  const vehicleCategories = [
    { label: 'Open Truck', value: '1' },
    { label: 'Container', value: '2' },
  ];

  const [form, setForm] = useState({
    vehicle_category_id: '',
    vehicle_model_id: '',
    vehicle_registration_number: '',
    vehicle_name: '',
    owner_name: '',
    rc_number: '',
    manufacturing_year: '',
    vehicle_color: '',
    chassis_number: '',
    engine_number: '',
    insurance_number: '',
    insurance_expiry: '2026-12-31',
    fitness_expiry: '2027-06-30',
    permit_expiry: '2026-10-15',
    dl_number: '',
    description: '',
    // has_gps: true,
  });

  const [docs, setDocs] = useState({
    vehicle_image: null,
    rc_front_image: null,
    rc_back_image: null,
    insurance_image: null,
    fitness_certificate: null,
    permit_image: null,
    dl_image: null,
  });

  const handleCategoryChange = async categoryId => {
    setForm(prev => ({
      ...prev,
      vehicle_category_id: categoryId,
      vehicle_model_id: '',
    }));
    setVehicleModels([]);
    if (!categoryId) return;

    setIsModelsLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/vehicle/get-by-category`,
        {
          category_id: categoryId,
        },
      );
      if (response.data?.success) {
        setVehicleModels(response.data.data.vehicles || []);
      }
    } catch (error) {
      console.error('Error fetching models:', error);
    } finally {
      setIsModelsLoading(false);
    }
  };

  const vehicleModelOptions = vehicleModels.map(v => ({
    label: v.model_name,
    value: String(v.id),
  }));

  const handleSubmit = async () => {
    console.log('--- SUBMIT START ---');
    console.log('FORM:', form);
    console.log('DOCS:', docs);

    if (
      !form.vehicle_category_id ||
      !form.vehicle_model_id ||
      !form.vehicle_registration_number
    ) {
      Alert.alert(
        'Error',
        'Please fill required fields and select vehicle model.',
      );
      console.log('Client-side required validation failed');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('@user_token');
      console.log('TOKEN:', token);

      const formData = new FormData();

      Object.keys(form).forEach(key => {
        // let value = form[key];

        // if (key === 'has_gps') {
        //   // convert boolean to "1"/"0"
        //   value = form.has_gps ? 1 : 0;
        // }

        console.log('FD FIELD:', key, form[key]);
        formData.append(key, form[key]);
      });

      Object.keys(docs).forEach(key => {
        if (docs[key]) {
          console.log('FD FILE:', key, {
            uri: docs[key].uri,
            type: docs[key].type,
            name: docs[key].fileName || `${key}.jpg`,
          });

          formData.append(key, {
            uri: docs[key].uri,
            type: docs[key].type,
            name: docs[key].fileName || `${key}.jpg`,
          });
        }
      });

      // Optional: inspect formData entries in dev
      if (formData.entries) {
        for (const pair of formData.entries()) {
          console.log('FORMDATA ENTRY:', pair[0], pair[1]);
        }
      }

      const res = await axios.post(
        `${API_URL}/api/vendor/fleet/add-vehicle`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
          validateStatus: status => status < 500, // let 422/400 come in then() instead of throwing
        },
      );

      console.log('RESPONSE STATUS:', res.status);
      console.log('RESPONSE DATA:', res.data);

      if (!res.data.success) {
        if (res.status === 422 && res.data.errors) {
          const firstKey = Object.keys(res.data.errors)[0];
          const firstMsg = res.data.errors[firstKey][0];
          Alert.alert('Validation Error', firstMsg || 'Validation failed.');
        } else {
          Alert.alert('Error', res.data.message || 'Validation failed.');
        }
        return;
      }

      Alert.alert('Success', res.data.message || 'Vehicle added.');
      navigation.goBack();
    } catch (error) {
      console.log('AXIOS ERROR OBJECT:', JSON.stringify(error, null, 2));
      if (error.response) {
        console.log('ERROR STATUS:', error.response.status);
        console.log('ERROR DATA:', error.response.data);
      }
      const msg =
        error.response?.data?.message ||
        (error.response?.data &&
          typeof error.response.data === 'object' &&
          error.response.data.errors &&
          Object.values(error.response.data.errors)[0][0]) ||
        'Failed to add vehicle';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
      console.log('--- SUBMIT END ---');
    }
  };

  const renderInput = (label, field, placeholder, keyboard = 'default') => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#999"
        value={(form[field] || '').toString()}
        onChangeText={txt =>
          setForm(prev => ({
            ...prev,
            [field]: txt,
          }))
        }
        keyboardType={keyboard}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FD" />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Fleet Vehicle</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Text style={styles.subTitle}>Select category and model to begin</Text>

        <View style={styles.card}>
          <CustomPicker
            label="Vehicle Category *"
            data={vehicleCategories}
            onSelect={handleCategoryChange}
            selectedValue={form.vehicle_category_id}
            placeholder="Select Category"
          />

          <CustomPicker
            label="Vehicle Model *"
            data={vehicleModelOptions}
            onSelect={val =>
              setForm(prev => ({ ...prev, vehicle_model_id: val }))
            }
            selectedValue={form.vehicle_model_id}
            placeholder={isModelsLoading ? 'Loading models...' : 'Select Model'}
            enabled={!isModelsLoading && form.vehicle_category_id !== ''}
          />
          {isModelsLoading && (
            <ActivityIndicator
              size="small"
              color={THEME.primary}
              style={{ marginBottom: 10 }}
            />
          )}
        </View>

        <Text style={styles.sectionTitle}>Registration Details</Text>
        {renderInput(
          'Vehicle Registration Number *',
          'vehicle_registration_number',
          'e.g. DL02AB5678',
        )}
        {renderInput('Owner Name (as per RC) *', 'owner_name', 'John Doe')}
        {renderInput('RC Number *', 'rc_number', 'RC123456789')}

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            {renderInput('Mfg. Year', 'manufacturing_year', '2022', 'numeric')}
          </View>
          <View style={{ flex: 1 }}>
            {renderInput('Vehicle Color', 'vehicle_color', 'White')}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Required Documents</Text>
        <View style={styles.docGrid}>
          {[
            'vehicle_image',
            'rc_front_image',
            'rc_back_image',
            'insurance_image',
            'fitness_certificate',
            'permit_image',
            'dl_image',
          ].map(field => (
            <TouchableOpacity
              key={field}
              style={styles.docPicker}
              onPress={() => pickImage(field)}
            >
              <Text style={styles.docLabel}>
                {field.replace(/_/g, ' ').toUpperCase()}
              </Text>
              {docs[field] ? (
                <Image
                  source={{ uri: docs[field].uri }}
                  style={styles.preview}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.placeholder}>
                  <Text style={{ color: THEME.primary }}>+ Upload</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, loading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Submit for Admin Review</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FD' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  backBtn: { padding: 5 },
  backText: { fontSize: 24, color: '#333' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  container: { flex: 1, padding: 20 },
  subTitle: { fontSize: 14, color: '#666', marginBottom: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 15,
    color: '#333',
  },
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 14, color: '#444', marginBottom: 6, fontWeight: '600' },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 14,
    color: '#333',
  },
  row: { flexDirection: 'row' },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  helperText: { fontSize: 12, color: '#64748B', marginTop: 4 },
  docGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  docPicker: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
  },
  docLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 5,
  },
  preview: { width: '100%', height: 80, borderRadius: 8 },
  placeholder: { height: 80, justifyContent: 'center' },
  submitBtn: {
    backgroundColor: THEME.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  pickerButton: {
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 12,
    backgroundColor: THEME.background,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  pickerButtonText: { fontSize: 16, color: THEME.textPrimary },
  placeholderText: { color: THEME.placeholder },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: THEME.surface,
    borderRadius: 12,
    width: '80%',
    maxHeight: '50%',
    padding: 10,
  },
  optionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: THEME.borderLight,
  },
  optionText: { fontSize: 16, color: THEME.textPrimary },
  errorBorder: { borderColor: 'red' },
  pickerIcon: { fontSize: 12, color: THEME.textPrimary },
});

export default AddFleetVehicleScreen;
