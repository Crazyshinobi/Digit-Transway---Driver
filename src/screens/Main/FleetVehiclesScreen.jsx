import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { THEME } from '../../themes/colors';
import { API_URL } from '../../config/config';

const FleetVehiclesScreen = ({ navigation }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchVehicles = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const token = await AsyncStorage.getItem('@user_token');

      const res = await axios.get(`${API_URL}/api/vendor/fleet/vehicles`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (res.data?.success) {
        setVehicles(res.data.data.vehicles || []);
      } else {
        setVehicles([]);
      }
    } catch (e) {
      console.log('Error fetching vehicles:', e?.response?.data || e.message);
    } finally {
      if (isRefresh) setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles(false);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchVehicles(true);
  }, []);

  const renderItem = ({ item }) => {
    const statusColor =
      item.status === 'pending' ? '#F59E0B' :
      item.status === 'active' ? '#10B981' :
      item.status === 'rejected' ? '#EF4444' : '#6B7280';

    const statusText = item.status?.toUpperCase() || 'UNKNOWN';

    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            borderLeftWidth: 4,
            borderLeftColor: statusColor,
          },
        ]}
        activeOpacity={0.8}
        onPress={() => {
          // navigate to details
          // navigation.navigate('FleetVehicleDetails', { vehicle: item });
        }}
      >
        <View style={styles.cardHeaderRow}>
          <View>
            <Text style={styles.regNo}>{item.vehicle_registration_number}</Text>
            <Text style={styles.statusBadge}>{statusText}</Text>
          </View>
          <View style={styles.availabilityBadge}>
            <Text style={styles.availabilityText}>
              {item.is_available ? 'AVAILABLE' : 'OFFLINE'}
            </Text>
          </View>
        </View>

        <Text style={styles.modelText}>
          {item.vehicle_model?.name || 'Model N/A'}
        </Text>

        <Text style={styles.categoryText}>
          {item.vehicle_category?.name || 'Category N/A'}
        </Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoText}>
            Capacity: {item.vehicle_model?.capacity_tons || '-'}T
          </Text>
          <Text style={styles.infoText}>
            Length: {item.vehicle_model?.body_length || '-'}ft
          </Text>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>
            {item.rc_verified ? 'RC ✓' : 'RC ✗'}
          </Text>
          <Text style={styles.footerText}>
            {item.dl_verified ? 'DL ✓' : 'DL ✗'}
          </Text>
          <Text style={styles.footerText}>
            {item.is_listed ? 'Listed ✓' : 'Listed ✗'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const listEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No vehicles found</Text>
        <Text style={styles.emptySub}>
          Add a vehicle to see it listed here.
        </Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddFleetVehicleScreen')}
        >
          <Text style={styles.addBtnText}>Add Vehicle</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FD" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Fleet Vehicles</Text>
        <TouchableOpacity
          style={styles.headerAddBtn}
          onPress={() => navigation.navigate('AddFleetVehicleScreen')}
        >
          <Text style={styles.headerAddText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={THEME.primary} />
        </View>
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            vehicles.length === 0 && { flex: 1 },
          ]}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[THEME.primary]}
            />
          }
          ListEmptyComponent={listEmpty}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FD' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  headerAddBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: THEME.primary,
    borderRadius: 20,
  },
  headerAddText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  loaderContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  regNo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  statusBadge: {
    backgroundColor: '#F59E0B20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  availabilityBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  availabilityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
  },
  modelText: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  categoryText: {
    marginTop: 2,
    fontSize: 13,
    color: '#374151',
  },
  infoRow: {
    flexDirection: 'row',
    marginTop: 8,
    justifyContent: 'space-between',
  },
  infoText: {
    fontSize: 12,
    color: '#6B7280',
  },
  footerRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 12,
  },
  footerText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  emptySub: {
    marginTop: 6,
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  addBtn: {
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: THEME.primary,
  },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});

export default FleetVehiclesScreen;
