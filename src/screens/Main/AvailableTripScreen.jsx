import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StatusBar,
  StyleSheet,
  SafeAreaView,
  Switch,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { THEME } from '../../themes/colors';
import { API_URL } from '../../config/config';
import axios from 'axios';

const Icon = ({ name, size, style }) => {
  const getIcon = () => {
    switch (name) {
      case 'back': return '⬅️';
      case 'map': return '🗺️';
      case 'filter': return '📊';
      case 'distance': return '↔️';
      default: return '';
    }
  };
  return <Text style={[{ fontSize: size }, style]}>{getIcon()}</Text>;
};

const mockTrips = [
  { id: '1', from: 'Noida Sec 62', to: 'Gurgaon Sec 29', distance: '45 km', vehicle: 'Mini Truck', payout: 'Quote Now' },
  { id: '2', from: 'Delhi Cantt', to: 'Faridabad', distance: '35 km', vehicle: 'Small Truck', payout: 'Quote Now' },
  { id: '3', from: 'Ghaziabad', to: 'Meerut', distance: '70 km', vehicle: 'Medium Truck', payout: 'Quote Now' },
  { id: '4', from: 'Noida City Center', to: 'Greater Noida', distance: '25 km', vehicle: 'Mini Truck', payout: 'Quote Now' },
  { id: '5', from: 'South Delhi', to: 'Sonipat', distance: '60 km', vehicle: 'Large Truck', payout: 'Quote Now' },
];

const AvailableTripScreen = ({ navigation, route }) => {
  const [trips] = useState(mockTrips);
  const [isAutoSearch, setIsAutoSearch] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    const token = route.params?.accessToken;
    if (token) {
      setAccessToken(token);
    } else {
      Alert.alert("Authentication Error", "Your session is invalid. Please log in again.");
      navigation.navigate('Login');
    }
  }, [route.params]);

  const handleToggleAutoSearch = () => {
    if (!isAutoSearch) {
      setModalVisible(true);
    } else {
      setIsAutoSearch(false);
      Alert.alert("Auto-Search Stopped", "You will no longer be automatically matched with trips.");
    }
  };
  
  const startAutoSearch = async () => {
    if (!accessToken) {
        Alert.alert("Authentication Error", "Cannot start auto-search without a valid session.");
        return;
    }
    setModalVisible(false);
    setIsSubmitting(true);
    
    try {
        console.log("Starting auto-search...");
        
        await axios.post(`${API_URL}/api/truck-booking/create-auto-search`, {}, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        setIsAutoSearch(true);
        Alert.alert(
            "Auto-Search Activated!",
            "We will now automatically search for trips that match your profile and notify you."
        );
    } catch (error) {
        console.error("Failed to start auto-search:", error.response?.data || error.message);
        Alert.alert("Error", "Could not start auto-search. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const renderTripItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.tripCard}
      onPress={() => navigation.navigate('TripDetail', { trip: item })}
      activeOpacity={0.8}
    >
      <View style={styles.tripHeader}>
        <Text style={styles.routeText} numberOfLines={1}>{item.from} → {item.to}</Text>
        <View style={styles.vehicleBadge}>
          <Text style={styles.vehicleText}>{item.vehicle}</Text>
        </View>
      </View>
      <View style={styles.divider} />
      <View style={styles.tripFooter}>
        <View style={styles.distanceContainer}>
          <Icon name="distance" size={16} style={styles.distanceIcon} />
          <Text style={styles.distanceText}>{item.distance}</Text>
        </View>
        <View style={styles.quoteButton}>
          <Text style={styles.quoteText}>{item.payout}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="back" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Available Trips</Text>
        <View style={styles.autoSearchContainer}>
            <Text style={styles.autoSearchLabel}>Auto-Search</Text>
            <Switch
                value={isAutoSearch}
                onValueChange={handleToggleAutoSearch}
                trackColor={{ false: THEME.border, true: THEME.primaryLight }}
                thumbColor={isAutoSearch ? THEME.primary : THEME.surface}
            />
        </View>
      </View>

      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Start Auto-Search?</Text>
                <Text style={styles.modalSubtitle}>
                    This will automatically find and notify you about new trips matching your vehicle and preferred routes.
                </Text>
                {isSubmitting ? (
                    <ActivityIndicator style={{marginTop: 20}} color={THEME.primary} size="large" />
                ) : (
                    <View style={styles.modalActions}>
                        <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
                            <Text style={styles.modalButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalButton, styles.modalButtonPrimary]} onPress={startAutoSearch}>
                            <Text style={[styles.modalButtonText, styles.modalButtonPrimaryText]}>Start Searching</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
      </Modal>

      <FlatList
        data={trips}
        renderItem={renderTripItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  listContent: {
    padding: 20,
  },
  tripCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
    marginRight: 10,
  },
  vehicleBadge: {
    backgroundColor: '#e8f0fe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  vehicleText: {
    color: '#4285f4',
    fontWeight: '600',
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 8,
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceIcon: {
    color: '#6b7280',
    marginRight: 6,
  },
  distanceText: {
    fontSize: 16,
    color: '#4b5563',
    fontWeight: '500',
  },
  quoteButton: {
    backgroundColor: '#34a853',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  quoteText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  autoSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  autoSearchLabel: {
    marginRight: 8,
    fontSize: 12,
    fontWeight: '600',
    color: THEME.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: THEME.background,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.textPrimary,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: THEME.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: THEME.surface,
    marginHorizontal: 8,
  },
  modalButtonPrimary: {
    backgroundColor: THEME.primary,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.textPrimary,
  },
  modalButtonPrimaryText: {
    color: THEME.textOnPrimary,
  },
});

export default AvailableTripScreen;