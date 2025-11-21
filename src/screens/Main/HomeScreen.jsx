import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Sound from 'react-native-sound';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';

import { API_URL } from '../../config/config';
import { THEME } from '../../themes/colors';

Sound.setCategory('Playback');

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const isFocused = useIsFocused();
  const [pendingBookings, setPendingBookings] = useState([]);

  const prevCountRef = useRef(0);
  const isFirstLoad = useRef(true);
  const notificationSound = useRef(null);

  useEffect(() => {
    console.log('[Sound] Initializing sound object...');
    notificationSound.current = new Sound(
      'notification.mp3',
      Sound.MAIN_BUNDLE,
      error => {
        if (error) {
          console.log('[Sound] Failed to load the sound', error);
          return;
        }
        console.log(
          `[Sound] Sound loaded successfully. Duration: ${notificationSound.current.getDuration()}s`,
        );
      },
    );

    return () => {
      if (notificationSound.current) {
        console.log('[Sound] Releasing sound resources...');
        notificationSound.current.release();
      }
    };
  }, []);

  const playNotificationSound = () => {
    if (notificationSound.current) {
      console.log('[Sound] Attempting to play sound...');
      notificationSound.current.play(success => {
        if (success) {
          console.log('[Sound] Playback finished successfully');
        } else {
          console.log('[Sound] Playback failed due to audio decoding errors');
        }
      });
    } else {
      console.log('[Sound] Sound object is null, cannot play');
    }
  };

  const checkForNewBookings = async () => {
    try {
      const token = await AsyncStorage.getItem('@user_token');
      if (!token) return;

      const response = await axios.get(
        `${API_URL}/api/vendor/booking-requests`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data?.success) {
        const currentRequests = response.data.data?.requests || [];
        const currentCount = currentRequests.length;

        setPendingBookings(currentRequests);

        if (currentCount > prevCountRef.current && !isFirstLoad.current) {
          console.log(
            `[Sound Trigger] New booking detected! Previous: ${prevCountRef.current}, Current: ${currentCount}`,
          );
          playNotificationSound();
          Alert.alert('New Booking!', 'You have a new pending request.');
        }

        prevCountRef.current = currentCount;
        isFirstLoad.current = false;
      }
    } catch (error) {
      console.error('[Polling] Error fetching bookings:', error.message);
    }
  };

  useEffect(() => {
    let intervalId;

    if (isFocused) {
      checkForNewBookings();
      intervalId = setInterval(() => {
        checkForNewBookings();
      }, 10000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isFocused]);

  const formatDisplayDate = dateString => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
      });
    } catch (e) {
      return dateString;
    }
  };

  const renderNewBookingItem = ({ item }) => (
    <View style={styles.bookingCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.priceText}>
          ₹{item.pricing.final_amount || item.pricing.estimated_price}
        </Text>
        <Text style={styles.statusBadge}>NEW</Text>
      </View>

      <View style={styles.routeContainer}>
        <Text style={styles.locationLabel}>Pickup:</Text>
        <Text style={styles.locationText} numberOfLines={1}>
          {item.pickup_location.address}
        </Text>

        <Text style={styles.locationLabel}>Drop:</Text>
        <Text style={styles.locationText} numberOfLines={1}>
          {item.drop_location.address}
        </Text>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.dateText}>
          {formatDisplayDate(item.schedule.pickup_datetime)}
        </Text>
        <Text style={styles.materialText}>{item.material.name}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome!</Text>
        <Button
          title="Logout"
          color="red"
          onPress={async () => {
            await AsyncStorage.removeItem('@user_token');
            navigation.replace('RoleSelection');
          }}
        />
      </View>

      {/* New Bookings Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>New Bookings</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('BookingHistoryScreen')}
          >
            <Text style={styles.seeAllText}>See All / Manage</Text>
          </TouchableOpacity>
        </View>

        {pendingBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No new bookings available</Text>
            <Text style={styles.emptySubText}>Waiting for requests...</Text>
          </View>
        ) : (
          <FlatList
            data={pendingBookings}
            renderItem={renderNewBookingItem}
            keyExtractor={item => item.request_id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            style={styles.listStyle}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    color: THEME.primary || '#007AFF',
    fontWeight: '600',
  },
  listStyle: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'green',
  },
  statusBadge: {
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  routeContainer: {
    marginBottom: 10,
  },
  locationLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  materialText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default HomeScreen;
