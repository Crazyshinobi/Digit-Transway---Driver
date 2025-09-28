import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StatusBar,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

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

// Mock data for available trips
const mockTrips = [
  { id: '1', from: 'Noida Sec 62', to: 'Gurgaon Sec 29', distance: '45 km', vehicle: 'Mini Truck', payout: 'Quote Now' },
  { id: '2', from: 'Delhi Cantt', to: 'Faridabad', distance: '35 km', vehicle: 'Small Truck', payout: 'Quote Now' },
  { id: '3', from: 'Ghaziabad', to: 'Meerut', distance: '70 km', vehicle: 'Medium Truck', payout: 'Quote Now' },
  { id: '4', from: 'Noida City Center', to: 'Greater Noida', distance: '25 km', vehicle: 'Mini Truck', payout: 'Quote Now' },
  { id: '5', from: 'South Delhi', to: 'Sonipat', distance: '60 km', vehicle: 'Large Truck', payout: 'Quote Now' },
];

const AvailableTripScreen = ({ navigation }) => {
  const [trips] = useState(mockTrips);

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
        <TouchableOpacity style={styles.filterButton}>
          <Icon name="filter" size={22} style={styles.filterIcon} />
        </TouchableOpacity>
      </View>

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
  filterButton: {
    padding: 8,
  },
  filterIcon: {
    color: '#4b5563',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  quoteText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default AvailableTripScreen;