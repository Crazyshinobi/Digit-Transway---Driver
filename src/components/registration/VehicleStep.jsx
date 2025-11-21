import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  FlatList,
  SafeAreaView,
} from 'react-native';
import axios from 'axios';
import { THEME } from '../../themes/colors';
import { API_URL } from '../../config/config';
import { useRegistrationContext } from '../../context/RegistrationContext';

const CustomPicker = ({ label, data, onSelect, selectedValue, placeholder, error, enabled = true }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const selectedItem = data.find(item => item.value === selectedValue);
  const displayLabel = selectedItem ? selectedItem.label : placeholder;

  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.pickerButton, error && styles.errorBorder]}
        onPress={() => enabled && setModalVisible(true)}
        disabled={!enabled}
      >
        <Text style={[styles.pickerButtonText, !selectedItem && styles.placeholderText]}>
          {displayLabel}
        </Text>
        <Text style={styles.pickerIcon}>▼</Text>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <FlatList
              data={data}
              keyExtractor={(item) => item.value}
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
    </>
  );
};


const VehicleStep = () => {
  const { formData, setFormData, errors, clearFieldError } = useRegistrationContext();
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const vehicleCategories = [
    { label: 'Select Vehicle Category', value: '' },
    { label: 'Open Truck', value: '1' },
    { label: 'Container', value: '2' },
  ];

  const handleCategoryChange = async (categoryId) => {
    setFormData(prev => ({
      ...prev,
      vehicle_category_id: categoryId,
      vehicle_model_id: '',
    }));
    clearFieldError('vehicle_category_id');
    setVehicles([]);

    if (!categoryId) return;

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/vehicle/get-by-category`, {
        category_id: categoryId,
      });
      if (response.data?.success) {
        setVehicles(response.data.data.vehicles || []);
      } else {
        console.error("Failed to fetch vehicles:", response.data?.message);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVehicleChange = (vehicleId) => {
    setFormData(prev => ({ ...prev, vehicle_model_id: vehicleId }));
    clearFieldError('vehicle_model_id');
  };
  
  const vehicleModelOptions = vehicles.map(vehicle => ({
    label: vehicle.model_name,
    value: String(vehicle.id),
  }));

  return (
    <View style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.icon}>🚚</Text>
            <Text style={styles.title}>Vehicle Details</Text>
            <Text style={styles.subtitle}>
            Finally, tell us about the vehicle you'll be using.
            </Text>
      </View>

      <View style={styles.card}>
        <CustomPicker
          label="Vehicle Category"
          data={vehicleCategories}
          onSelect={handleCategoryChange}
          selectedValue={formData.vehicle_category_id}
          placeholder="Select Vehicle Category"
          error={errors.vehicle_category_id}
        />

        <CustomPicker
          label="Vehicle Model"
          data={vehicleModelOptions}
          onSelect={handleVehicleChange}
          selectedValue={formData.vehicle_model_id}
          placeholder={isLoading ? "Loading..." : "Select Vehicle Model"}
          error={errors.vehicle_model_id}
          enabled={!isLoading && formData.vehicle_category_id !== ''}
        />
        {isLoading && <ActivityIndicator style={{marginTop: -10, marginBottom: 10}} size="small" color={THEME.primary} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 40,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: THEME.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: THEME.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: THEME.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.textPrimary,
    marginBottom: 8,
  },
  errorText: {
    color: THEME.error,
    fontSize: 12,
    marginTop: 4,
    marginBottom: 12,
  },
  errorBorder: {
    borderColor: THEME.error,
  },
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
    marginBottom: 16,
  },
  pickerButtonText: {
    fontSize: 16,
    color: THEME.textPrimary,
  },
  placeholderText: {
    color: THEME.placeholder,
  },
  pickerIcon: {
    fontSize: 12,
    color: THEME.textSecondary,
  },
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
  optionText: {
    fontSize: 16,
    color: THEME.textPrimary,
  },
});

export default VehicleStep;