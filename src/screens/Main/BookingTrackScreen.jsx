import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Alert,
  Dimensions,
  ScrollView,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME } from '../../themes/colors';
import { API_URL } from '../../config/config';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

const { width } = Dimensions.get('window');

const Icon = ({ name, size = 24, color, style }) => {
  const getIcon = () => {
    switch (name) {
      case 'back':
        return '←';
      default:
        return '';
    }
  };
  return <Text style={[{ fontSize: size, color }, style]}>{getIcon()}</Text>;
};

const BookingTrackScreen = ({ navigation, route }) => {
  const { bookingId, locationType } = route.params;
  const [loading, setLoading] = useState(true);
  const [locationData, setLocationData] = useState(null);
  const mapRef = useRef(null);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    const fetchLocationData = async () => {
      const token = await AsyncStorage.getItem('@user_token');
      setAccessToken(token);

      if (!token) {
        Alert.alert('Auth Error', 'Session expired.', [
          { text: 'OK', onPress: () => navigation.replace('Login') },
        ]);
        return;
      }

      setLoading(true);
      try {
        const endpoint = `/api/booking-location/${bookingId}/${locationType}`;
        const response = await axios.get(`${API_URL}${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data?.success) {
          const data = response.data.data;
          setLocationData(data);

          console.log(
            `[BookingTrackScreen] Fetched ${locationType} data.`,
            data,
          );
        } else {
          throw new Error(
            response.data.message || 'Failed to fetch location data',
          );
        }
      } catch (error) {
        console.error(
          `[BookingTrackScreen] Failed to fetch ${locationType} data:`,
          error.response?.data || error.message,
        );
        Alert.alert('Error', `Could not load ${locationType} tracking data.`);
      } finally {
        setLoading(false);
      }
    };

    fetchLocationData();
  }, [bookingId, locationType, navigation]);

  useEffect(() => {
    if (mapRef.current && locationData) {
      const driverLocation = locationData.distance.driver_location;
      const targetLocation = {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      };

      const markers = [targetLocation];

      if (driverLocation.latitude !== 0 && driverLocation.longitude !== 0) {
        markers.push({
          latitude: driverLocation.latitude,
          longitude: driverLocation.longitude,
        });
      }

      if (markers.length > 0) {
        mapRef.current.fitToCoordinates(markers, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }
    }
  }, [locationData]);

  const handleOpenGoogleMaps = url => {
    if (url) {
      Linking.openURL(url).catch(err =>
        console.error('Failed to open URL:', err),
      );
    } else {
      Alert.alert('Error', 'Google Maps link not available.');
    }
  };

  const renderMap = () => {
    if (!locationData) return null;

    const targetCoords = {
      latitude: locationData.latitude,
      longitude: locationData.longitude,
    };

    const driverLocation = locationData.distance.driver_location;
    const driverCoords = {
      latitude: driverLocation.latitude,
      longitude: driverLocation.longitude,
    };
    const isDriverLocationValid =
      driverCoords.latitude !== 0 && driverCoords.longitude !== 0;

    const initialRegion = {
      ...targetCoords,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };

    return (
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation={false}
        >
          {/* Target Location Marker (Pickup or Drop) */}
          <Marker
            coordinate={targetCoords}
            title={locationData.label}
            description={locationData.address}
            pinColor={locationType === 'pickup' ? THEME.success : THEME.error}
          />

          {/* Driver Marker */}
          {isDriverLocationValid && (
            <Marker
              coordinate={driverCoords}
              title="Your Truck Location"
              description={driverLocation.address}
            >
              <View style={styles.driverMarker}>
                <Text>🚛</Text>
              </View>
            </Marker>
          )}

          {/* Add Polyline connecting Driver to Target Location (Only if driver location is valid) */}
          {isDriverLocationValid && (
            <Polyline
              coordinates={[driverCoords, targetCoords]}
              strokeColor={THEME.primary}
              strokeWidth={4}
              lineDashPattern={[20, 10]}
            />
          )}
        </MapView>
      </View>
    );
  };

  const renderInfoPanel = () => {
    if (!locationData) return null;

    const distanceKey =
      locationType === 'pickup' ? 'driver_to_pickup' : 'pickup_to_drop';
    const distanceInfo = locationData.distance[distanceKey];
    const driverLocation = locationData.distance.driver_location;

    return (
      <ScrollView style={styles.infoContainer}>
        <Text style={styles.sectionTitle}>{locationData.label} Tracking</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Address</Text>
          <Text style={[styles.infoValue, styles.addressText]}>
            {locationData.address}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Distance to Destination</Text>
          <Text style={styles.infoValue}>
            {locationType === 'pickup'
              ? distanceInfo?.road_km
              : distanceInfo?.truck_route_km}{' '}
            km
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Current Driver Location</Text>
          <Text style={styles.infoValue}>
            {driverLocation.address || 'N/A'}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonGroupContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.googleMapsButton]}
            onPress={() =>
              handleOpenGoogleMaps(locationData.google_maps_direction_url)
            }
          >
            <Text style={styles.googleMapsButtonText}>
              Get Directions on Maps 🗺️
            </Text>
          </TouchableOpacity>

          {/* This button should link to the full trip route, available in the pickup data */}
          {locationType === 'pickup' &&
            locationData.distance?.pickup_to_drop_route_url && (
              <TouchableOpacity
                style={[styles.actionButton, styles.fullTripButton]}
                onPress={() =>
                  handleOpenGoogleMaps(
                    locationData.distance.pickup_to_drop_route_url,
                  )
                }
              >
                <Text style={styles.fullTripButtonText}>
                  View Full Trip Route
                </Text>
              </TouchableOpacity>
            )}
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.background} />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="back" size={24} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {locationType === 'pickup' ? 'Track Pickup' : 'Track Drop'}
        </Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={THEME.primary}
          style={styles.loader}
        />
      ) : (
        <View style={{ flex: 1 }}>
          {renderMap()}
          {renderInfoPanel()}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: THEME.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.borderLight,
  },
  backButton: { padding: 8 },
  backIcon: { fontWeight: 'bold', color: THEME.textPrimary },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: THEME.textPrimary },
  headerPlaceholder: { width: 40 },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    width: '100%',
    height: '50%',
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  driverMarker: {
    backgroundColor: THEME.primary,
    padding: 5,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: THEME.surface,
  },
  infoContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.textPrimary,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.borderLight,
  },
  infoLabel: {
    fontSize: 14,
    color: THEME.textSecondary,
    flex: 1,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME.textPrimary,
    textAlign: 'right',
    flex: 2,
    marginLeft: 10,
  },
  addressText: {
    fontSize: 14,
    fontWeight: 'normal',
  },

  buttonGroupContainer: {
    marginTop: 20,
    flexDirection: 'column',
  },
  actionButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  googleMapsButton: {
    backgroundColor: THEME.primary,
  },
  googleMapsButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.surface,
  },
  fullTripButton: {
    backgroundColor: THEME.primarySurface || `${THEME.primary}1A`,
    borderColor: THEME.primary,
    borderWidth: 1,
  },
  fullTripButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.primary,
  },
});

export default BookingTrackScreen;
