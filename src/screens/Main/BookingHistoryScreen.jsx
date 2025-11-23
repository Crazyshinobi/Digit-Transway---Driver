import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  StatusBar,
  Alert,
  Linking,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME } from '../../themes/colors';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const API_URL = 'http://digittransway.com';

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

const BookingHistoryScreen = ({ navigation, route }) => {
  const [activeTab, setActiveTab] = useState('pending');
  const [accessToken, setAccessToken] = useState(null);
  const [bookings, setBookings] = useState({
    active: [],
    pending: [],
    completed: [],
  });
  const [isLoading, setIsLoading] = useState({
    active: true,
    pending: true,
    completed: true,
  });
  const [processingId, setProcessingId] = useState(null);

  const fetchDataForTab = useCallback(async (tab, token) => {
    if (!token) return;

    let endpoint = '';
    switch (tab) {
      case 'active':
        endpoint = '/api/vendor/booking-history/active';
        break;
      case 'pending':
        endpoint = '/api/vendor/booking-requests';
        break;
      case 'completed':
        endpoint = '/api/vendor/booking-history/completed';
        break;
      default:
        return;
    }

    setIsLoading(prev => ({ ...prev, [tab]: true }));
    try {
      const response = await axios.get(`${API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let dataArray = [];
      if (response.data?.success) {
        if (tab === 'pending') {
          dataArray = response.data.data?.requests || [];
        } else {
          dataArray = response.data.data?.bookings || [];
        }
      }

      if (Array.isArray(dataArray)) {
        setBookings(prev => ({ ...prev, [tab]: dataArray }));
      } else {
        setBookings(prev => ({ ...prev, [tab]: [] }));
      }
    } catch (error) {
      console.error(
        `Failed to fetch ${tab} bookings:`,
        error.response?.data || error.message,
      );
      setBookings(prev => ({ ...prev, [tab]: [] }));
    } finally {
      setIsLoading(prev => ({ ...prev, [tab]: false }));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      const bootstrap = async () => {
        let token = route.params?.accessToken;
        if (!token) {
          token = await AsyncStorage.getItem('@user_token');
        }

        if (token) {
          setAccessToken(token);
          fetchDataForTab('active', token);
          fetchDataForTab('pending', token);
          fetchDataForTab('completed', token);
        } else {
          Alert.alert('Authentication Error', 'Your session is invalid.', [
            { text: 'OK', onPress: () => navigation.replace('Login') },
          ]);
        }
      };

      bootstrap();
    }, [fetchDataForTab, navigation, route.params?.accessToken]),
  );

  const handleRequestAction = async (requestId, action) => {
    if (!accessToken) return;
    setProcessingId(requestId);
    try {
      await axios.post(
        `${API_URL}/api/vendor/booking-requests/${requestId}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      setBookings(prev => ({
        ...prev,
        pending: prev.pending.filter(item => item.request_id !== requestId),
      }));

      if (action === 'accept') {
        fetchDataForTab('active', accessToken);
      }

      Alert.alert('Success', `Booking has been ${action}ed.`);
    } catch (error) {
      console.error(
        `Failed to ${action} booking:`,
        error.response?.data || error.message,
      );
      Alert.alert(
        'Error',
        `Could not ${action} the booking. Please try again.`,
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleCompleteTrip = async bookingId => {
    if (!accessToken) return;
    setProcessingId(bookingId);
    try {
      const response = await axios.post(
        `${API_URL}/api/truck-booking/complete-trip/${bookingId}`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      if (response.data?.success) {
        const completedItem = bookings.active.find(b => b.id === bookingId);

        if (completedItem) {
          const updatedItem = { ...completedItem, status: 'completed' };

          setBookings(prev => ({
            ...prev,
            active: prev.active.filter(item => item.id !== bookingId),
            completed: [updatedItem, ...prev.completed],
          }));
        } else {
          fetchDataForTab('active', accessToken);
          fetchDataForTab('completed', accessToken);
        }

        Alert.alert('Success', 'Trip has been completed successfully!');
      } else {
        throw new Error(response.data?.message || 'Failed to complete trip.');
      }
    } catch (error) {
      console.error(
        `Failed to complete booking:`,
        error.response?.data || error.message,
      );
      Alert.alert('Error', 'Could not complete the booking. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDisplayDate = dateString => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date)) return dateString;
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatTime = dateString => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date)) return dateString;
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateString;
    }
  };

  const renderBookingItem = ({ item }) => (
    <View style={styles.bookingCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.routeText} numberOfLines={1}>
          **{item.pickup_location.address} → {item.drop_location.address}**
        </Text>
        <Text style={styles.earningsText}>
          {item.pricing?.display ||
            `₹${
              item.pricing?.final_amount ||
              item.pricing?.estimated_price ||
              'N/A'
            }`}
        </Text>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.bookingIdText}>Booking ID: {item.booking_id}</Text>

        {item.user && (
          <>
            <Text style={styles.detailText}>Customer: {item.user.name}</Text>
            <Text style={styles.detailText}>
              Contact: {item.user.contact_number}
            </Text>
          </>
        )}

        <Text style={styles.detailText}>
          Pickup:{' '}
          {item.schedule?.pickup_formatted ||
            formatDisplayDate(
              item.schedule?.pickup_datetime || item.timeline?.booking_created,
            )}
        </Text>

        {/* --- ADDED: Completed/Cancelled Details --- */}
        {activeTab === 'completed' && item.timeline && (
          <View style={styles.timelineSection}>
            <Text style={styles.timelineTitle}>Trip Timeline:</Text>

            {item.timeline.trip_started && (
              <Text style={styles.timelineText}>
                Started: {formatDisplayDate(item.timeline.trip_started)} at{' '}
                {formatTime(item.timeline.trip_started)}
              </Text>
            )}

            {item.timeline.trip_completed && (
              <Text style={styles.timelineText}>
                Completed: {formatDisplayDate(item.timeline.trip_completed)} at{' '}
                {formatTime(item.timeline.trip_completed)}
              </Text>
            )}

            {item.timeline.duration?.formatted && (
              <Text style={styles.timelineText}>
                Duration: **{item.timeline.duration.formatted}**
              </Text>
            )}
            {item.cancellation_reason && (
              <Text style={styles.cancellationText}>
                Reason: {item.cancellation_reason}
              </Text>
            )}
          </View>
        )}
        {/* --- END ADDED --- */}

        {item.material && (
          <Text style={styles.detailText}>
            Material: {item.material.name || 'N/A'} (
            {item.material.weight_display || 'N/A'})
          </Text>
        )}

        {item.vehicle && (
          <Text style={styles.detailText}>
            Vehicle: {item.vehicle.model || 'N/A'}
          </Text>
        )}

        {item.distance && (
          <Text style={styles.detailText}>
            Distance:{' '}
            {item.distance.display || `${item.distance.truck_route_km} km`}
          </Text>
        )}

        {item.payment && (
          <Text style={styles.detailText}>
            Payment: {item.payment.method} ({item.payment.status})
          </Text>
        )}
      </View>

      {activeTab === 'pending' ? (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            onPress={() => {Linking.openURL(`tel:${item?.user?.contact_number}`)
          console.log('Calling', item?.user?.contact_number)}}
            style={{ paddingRight: 10 }}
          >
            <Image
              source={require('../../assets/icons/phone-call.png')} // <-- your image
              style={{ width: 30, height: 30,  }}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleRequestAction(item.request_id, 'reject')}
              disabled={processingId === item.request_id}
            >
              {processingId === item.request_id ? (
                <ActivityIndicator size="small" color={THEME.error} />
              ) : (
                <Text
                  style={[styles.actionButtonText, styles.rejectButtonText]}
                >
                  Reject
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleRequestAction(item.request_id, 'accept')}
              disabled={processingId === item.request_id}
            >
              {processingId === item.request_id ? (
                <ActivityIndicator size="small" color={THEME.success} />
              ) : (
                <Text
                  style={[styles.actionButtonText, styles.acceptButtonText]}
                >
                  Accept
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.cardFooter}>
          <Text
            style={[
              styles.statusBadge,
              styles[`status_${item.status || 'pending'}`],
            ]}
          >
            {item.status_label || item.status || 'pending'}
          </Text>

          {activeTab === 'active' && (
            <View style={styles.buttonGroupContainer}>
              {processingId === item.id ? (
                <ActivityIndicator
                  color={THEME.primary}
                  size="small"
                  style={styles.cardActionLoader}
                />
              ) : (
                <>
                  <TouchableOpacity
                    style={[styles.trackButton, styles.pickupTrackButton]}
                    onPress={() =>
                      navigation.navigate('BookingTrackScreen', {
                        bookingId: item.id,
                        locationType: 'pickup',
                      })
                    }
                  >
                    {/* The square style relies on padding and minWidth/minHeight */}
                    <Text style={styles.trackButtonText}>📍</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.trackButton, styles.dropTrackButton]}
                    onPress={() =>
                      navigation.navigate('BookingTrackScreen', {
                        bookingId: item.id,
                        locationType: 'drop',
                      })
                    }
                  >
                    <Text style={styles.trackButtonText}>🏁</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.completeButton]}
                    onPress={() => handleCompleteTrip(item.id)}
                    disabled={processingId === item.id}
                  >
                    <Text
                      style={[
                        styles.actionButtonText,
                        styles.completeButtonText,
                      ]}
                    >
                      Complete
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );

  const renderContent = () => {
    const currentData = bookings[activeTab];
    const currentLoading = isLoading[activeTab];

    if (currentLoading) {
      return (
        <ActivityIndicator
          size="large"
          color={THEME.primary}
          style={styles.loader}
        />
      );
    }

    if (currentData.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No {activeTab} bookings found.</Text>
          <Text style={styles.emptySubtext}>
            {activeTab === 'pending'
              ? 'New requests will appear here.'
              : 'Check back later or find new trips!'}
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={currentData}
        renderItem={renderBookingItem}
        keyExtractor={(item, index) => `${item.id || item.request_id}-${index}`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  const TabButton = ({ name, label }) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === name && styles.activeTabButton]}
      onPress={() => setActiveTab(name)}
    >
      <Text
        style={[styles.tabText, activeTab === name && styles.activeTabText]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

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
        <Text style={styles.headerTitle}>My Bookings</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <View style={styles.tabContainer}>
        <TabButton name="pending" label="Pending" />
        <TabButton name="active" label="Active" />
        <TabButton name="completed" label="Completed" />
      </View>

      {renderContent()}
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
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: THEME.surface,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.borderLight,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  activeTabButton: {
    backgroundColor: THEME.primarySurface || `${THEME.primary}1A`,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textSecondary,
  },
  activeTabText: {
    color: THEME.primary,
  },
  loader: {
    marginTop: 50,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.textPrimary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: THEME.textSecondary,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  bookingCard: {
    backgroundColor: THEME.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  routeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  earningsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.success,
  },
  cardBody: { marginBottom: 12 },
  bookingIdText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textPrimary,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: THEME.textSecondary,
    marginBottom: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: THEME.borderLight,
    paddingTop: 12,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
    textTransform: 'uppercase',
    flexShrink: 1,
    marginRight: 8,
  },
  status_active: {
    backgroundColor: `${THEME.primary}20`,
    color: THEME.primary,
  },
  status_pending: {
    backgroundColor: `${THEME.warning}20`,
    color: THEME.warning,
  },
  status_completed: {
    backgroundColor: `${THEME.success}20`,
    color: THEME.success,
  },
  status_confirmed: {
    backgroundColor: `${THEME.primary}20`,
    color: THEME.primary,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // <-- FIX
    alignItems: 'center',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: THEME.borderLight,
    paddingTop: 12,
  },

  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: `${THEME.error}1A`,
  },
  acceptButton: {
    backgroundColor: `${THEME.success}1A`,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  rejectButtonText: {
    color: THEME.error,
  },
  acceptButtonText: {
    color: THEME.success,
  },
  completeButton: {
    backgroundColor: `${THEME.success}1A`,
  },
  completeButtonText: {
    color: THEME.success,
  },

  buttonGroupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    flexWrap: 'nowrap',
  },
  trackButton: {
    height: 36,
    width: 36,
    borderRadius: 8,
    marginLeft: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${THEME.primary}1A`,
  },
  pickupTrackButton: {
    marginLeft: 8,
  },
  dropTrackButton: {
    backgroundColor: `${THEME.primary}1A`,
  },
  pickupButtonText: {
    fontSize: 16,
    color: THEME.primary,
  },
  dropButtonText: {
    fontSize: 16,
    color: THEME.primary,
  },

  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginLeft: 6,
    minWidth: 70,
    alignItems: 'center',
    backgroundColor: `${THEME.success}1A`,
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  completeButtonText: {
    color: THEME.success,
  },
  cardActionLoader: {
    alignSelf: 'flex-end',
  },
  timelineSection: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderLeftWidth: 3,
    borderLeftColor: THEME.primary,
    backgroundColor: THEME.borderLight,
    borderRadius: 4,
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: THEME.textPrimary,
    marginBottom: 4,
  },
  timelineText: {
    fontSize: 12,
    color: THEME.textSecondary,
    marginBottom: 2,
  },
  cancellationText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: THEME.error,
    marginTop: 4,
  },
});

export default BookingHistoryScreen;
