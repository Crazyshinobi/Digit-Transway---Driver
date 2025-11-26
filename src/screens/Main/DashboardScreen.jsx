import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  StatusBar,
  StyleSheet,
  Animated,
  Dimensions,
  Alert,
  ActivityIndicator,
  FlatList,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME } from '../../themes/colors';
import axios from 'axios';
import { API_URL } from '../../config/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import Sound from 'react-native-sound';
import { useIsFocused } from '@react-navigation/native';

Sound.setCategory('Playback');

const Geolocation = {
  getCurrentPosition: (success, error) => {
    const position = { coords: { latitude: 28.6139, longitude: 77.209 } };
    success(position);
  },
};

const { width } = Dimensions.get('window');

const Icon = ({ name, size = 24, color, style }) => {
  const getIcon = () => {
    switch (name) {
      case 'trips':
        return '🗺️';
      case 'profile':
        return '👤';
      case 'notification':
        return '🔔';
      case 'logout':
        return '🚪';
      case 'earnings':
        return '💰';
      case 'dashboard':
        return '📊';
      case 'vehicle':
        return '🚛';
      case 'route':
        return '📍';
      case 'history':
        return '📜';
      case 'verification':
        return '🛡️';
      case 'payment':
        return '💵';
      default:
        return '❔';
    }
  };
  return <Text style={[{ fontSize: size, color }, style]}>{getIcon()}</Text>;
};

const SidebarMenu = ({
  isVisible,
  onClose,
  navigation,
  onSignOut,
  accessToken,
  isProfileComplete,
  userName,
  userPhone,
}) => {
  const slideAnim = useRef(new Animated.Value(-width * 0.75)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(slideAnim, {
        toValue: -width * 0.75,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  const navigateAndClose = screen => {
    navigation.navigate(screen, { accessToken });
    onClose();
  };

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.sidebarOverlay}>
          <Animated.View
            style={[
              styles.sidebarContainer,
              { transform: [{ translateX: slideAnim }] },
            ]}
          >
            <TouchableWithoutFeedback>
              <View style={{ flex: 1 }}>
                <LinearGradient
                  colors={THEME.primaryGradient}
                  style={styles.sidebarHeader}
                >
                  <View style={styles.sidebarAvatar}>
                    <Icon name="profile" size={32} color={THEME.primary} />
                  </View>
                  <Text style={styles.sidebarUserName}>
                    {userName || 'Hello, Driver'}
                  </Text>
                  <Text style={styles.sidebarUserPhone}>{userPhone || ''}</Text>
                </LinearGradient>

                <View style={styles.sidebarMenu}>
                  <TouchableOpacity
                    style={styles.sidebarMenuItem}
                    onPress={() => navigateAndClose('Profile')}
                  >
                    <View style={styles.menuIconContainer}>
                      <Icon name="profile" size={20} color={THEME.primary} />
                    </View>
                    <Text style={styles.sidebarMenuText}>View Profile</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.sidebarMenuItem}
                    onPress={() => navigateAndClose('BookingHistory')}
                  >
                    <View style={styles.menuIconContainer}>
                      <Icon name="history" size={20} color={THEME.primary} />
                    </View>
                    <Text style={styles.sidebarMenuText}>Booking History</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.sidebarMenuItem}
                    onPress={() => navigateAndClose('PaymentHistoryScreen')}
                  >
                    <View style={styles.menuIconContainer}>
                      <Icon name="payment" size={20} color={THEME.primary} />
                    </View>
                    <Text style={styles.sidebarMenuText}>Payment History</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.sidebarFooter}>
                  <TouchableOpacity
                    style={styles.sidebarMenuItem}
                    onPress={onSignOut}
                  >
                    <View
                      style={[
                        styles.menuIconContainer,
                        { backgroundColor: `${THEME.error}15` },
                      ]}
                    >
                      <Icon name="logout" size={20} color={THEME.error} />
                    </View>
                    <Text
                      style={[styles.sidebarMenuText, { color: THEME.error }]}
                    >
                      Sign Out
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const DashboardScreen = ({ navigation, route }) => {
  const isFocused = useIsFocused();

  // Separate states for driver online and part-load availability
  const [isOnline, setIsOnline] = useState(false);
  const [isPartLoadAvailable, setIsPartLoadAvailable] = useState(false);

  // Separate loading flags for clarity
  const [isStatusLoading, setIsStatusLoading] = useState(true);
  const [isStatusToggleLoading, setIsStatusToggleLoading] = useState(false);
  const [isPartToggleLoading, setIsPartToggleLoading] = useState(false);

  const [accessToken, setAccessToken] = useState(null);

  const [pendingBookings, setPendingBookings] = useState([]);

  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [userName, setUserName] = useState('Hello, Driver');
  const [userPhone, setUserPhone] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const cardScale = useRef(new Animated.Value(0.95)).current;

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

  const fetchInitialStatus = async token => {
    setIsStatusLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/api/vendor/availability/status`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (response.data?.success) {
        const availability = response.data.data?.availability || {};
        // tolerate multiple shapes
        const onlineStatus =
          availability.is_online ?? response.data.data?.is_online ?? false;
        const partLoadVal =
          availability.is_available_for_part_load ??
          response.data.data?.is_available_for_part_load;
        // server returns 0/1 maybe, so normalize:
        const partLoadBool =
          typeof partLoadVal !== 'undefined'
            ? Number(partLoadVal) === 0 // per your API 0 => ON
            : false;

        setIsOnline(Boolean(onlineStatus));
        setIsPartLoadAvailable(Boolean(partLoadBool));
      }
    } catch (error) {
      console.error(
        'Failed to fetch initial status:',
        error.response?.data || error.message,
      );
    } finally {
      setIsStatusLoading(false);
    }
  };

  const checkForNewBookings = async () => {
    try {
      console.log('Booking Data fetched');
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
      }, 5000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isFocused]);

  useEffect(() => {
    const bootstrap = async () => {
      const token = await AsyncStorage.getItem('@user_token');
      const name = await AsyncStorage.getItem('@user_name');
      const phone = await AsyncStorage.getItem('@user_phone_number');

      if (name) setUserName(name);
      if (phone) setUserPhone(phone);

      if (token) {
        setAccessToken(token);
        fetchInitialStatus(token);
      } else {
        Alert.alert('Authentication Error', 'Your session is invalid.', [
          { text: 'OK', onPress: () => navigation.replace('Login') },
        ]);
      }
    };
    bootstrap();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [navigation]);

  const getCurrentLocation = () =>
    new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => resolve(position.coords),
        error => {
          Alert.alert('Location Error', 'Could not get your location.');
          reject(error);
        },
      );
    });

  // Driver online/offline toggle
  const handleStatusToggle = async newValue => {
    const previousValue = isOnline;
    setIsOnline(newValue);
    setIsStatusToggleLoading(true);

    try {
      const token = accessToken || (await AsyncStorage.getItem('@user_token'));
      if (!token) throw new Error('Token missing.');

      let endpoint = '';
      let payload = {};

      if (newValue === true) {
        endpoint = `${API_URL}/api/vendor/availability/go-online`;
        const location = await getCurrentLocation();
        payload = {
          latitude: location.latitude,
          longitude: location.longitude,
        };
      } else {
        endpoint = `${API_URL}/api/vendor/availability/go-offline`;
        payload = {};
      }

      await axios.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Optionally re-fetch initial status to ensure full consistency
      await fetchInitialStatus(token);
    } catch (error) {
      console.error('Toggle error:', error.response?.data || error.message);
      Alert.alert('Error', 'Could not update status.');
      setIsOnline(previousValue);
    } finally {
      setIsStatusToggleLoading(false);
    }
  };

  // Part-load availability toggle (completely separate)
  const handlePartLoadStatusToggle = async newValue => {
    const previousValue = isPartLoadAvailable;
    // Optimistic UI update for part-load switch only
    setIsPartLoadAvailable(newValue);
    setIsPartToggleLoading(true);

    try {
      const token = accessToken || (await AsyncStorage.getItem('@user_token'));
      if (!token) throw new Error('Authentication token not found.');

      // Read vendor id from AsyncStorage (you mentioned it's stored as a string)
      const vendorIdStr = await AsyncStorage.getItem('@vendor_id');
      const vendorId = vendorIdStr ? parseInt(vendorIdStr, 10) : null;
      if (!vendorId) throw new Error('Vendor id not found in storage.');

      // Mapping you requested: if ON then 0, if OFF then 1
      const is_available_for_part_load = newValue ? 0 : 1;

      const payload = {
        vendor_id: vendorId,
        is_available_for_part_load,
      };

      const response = await axios.post(
        `${API_URL}/api/part-load-checker`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (
        response.data &&
        (response.data.status === true || response.data.success === true)
      ) {
        const serverVal =
          response.data.data?.is_available_for_part_load ??
          response.data?.is_available_for_part_load;

        // If server returns 0/1, convert to boolean (0 -> true (ON), 1 -> false (OFF))
        if (typeof serverVal !== 'undefined') {
          setIsPartLoadAvailable(Number(serverVal) === 0);
        } else {
          setIsPartLoadAvailable(newValue);
        }

        // Optionally show confirmation
        // Alert.alert('Success', response.data.message || 'Part-load status updated successfully.');
      } else {
        const msg =
          response.data?.message || 'Failed to update part-load status.';
        throw new Error(msg);
      }
    } catch (error) {
      console.error(
        'Part-load toggle error:',
        error.response?.data || error.message || error,
      );
      Alert.alert(
        'Error',
        'Could not update part-load status. Please try again.',
      );
      // revert UI change
      setIsPartLoadAvailable(previousValue);
    } finally {
      setIsPartToggleLoading(false);
    }
  };

  const handleSignOut = (silent = false) => {
    setIsSidebarVisible(false);
    setTimeout(async () => {
      try {
        await AsyncStorage.removeItem('@user_token');
        await AsyncStorage.removeItem('@user_phone_number');
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      } catch (e) {
        console.error('Failed to sign out.', e);
        if (!silent) {
          Alert.alert('Error', 'Could not sign out.');
        }
      }
    }, 300);
  };

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

  const renderPendingItem = ({ item }) => (
    <TouchableOpacity
      style={styles.historyItem}
      onPress={() => navigation.navigate('BookingHistory')}
    >
      <View style={styles.historyItemIcon}>
        <Text>🔔</Text>
      </View>
      <View style={styles.historyItemDetails}>
        {/* Use pending structure: pickup_location.address */}
        <Text style={styles.historyItemRoute} numberOfLines={1}>
          {item.pickup_location?.address || 'Unknown'}
        </Text>
        <Text style={styles.historyItemDate}>
          {formatDisplayDate(item.schedule?.pickup_datetime)} •{' '}
          {item.material?.name}
        </Text>
      </View>
      <View style={styles.historyItemRight}>
        <Text style={styles.historyItemEarnings}>
          ₹{item.pricing?.final_amount || item.pricing?.estimated_price || '0'}
        </Text>
        <Text style={[styles.historyItemStatus, styles.status_pending]}>
          NEW
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.primary} />

      <SidebarMenu
        isVisible={isSidebarVisible}
        onClose={() => setIsSidebarVisible(false)}
        navigation={navigation}
        onSignOut={handleSignOut}
        accessToken={accessToken}
        isProfileComplete={isProfileComplete}
        userName={userName}
        userPhone={userPhone}
      />

      <Animated.View
        style={[
          styles.header,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              onPress={() => setIsSidebarVisible(true)}
              style={styles.avatarContainer}
            >
              <Icon name="profile" size={24} color="#fff" />
            </TouchableOpacity>
            <View>
              <Text style={styles.greeting}>
                Hi,
                {userName
                  ? userName.length > 10
                    ? userName.slice(0, 10) + '...!'
                    : userName
                  : 'Driver!'}
              </Text>
              <Text style={styles.subtitle}>Welcome to your dashboard</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <View style={styles.notificationIconContainer}>
              <Icon name="notification" size={20} color="#fff" />
              {pendingBookings.length > 0 && (
                <View style={styles.notificationBadge} />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* DRIVER ONLINE/OFFLINE */}
        <Animated.View
          style={[
            styles.statusCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: cardScale }],
            },
          ]}
        >
          <View style={styles.statusLeft}>
            <View style={styles.statusHeader}>
              <View style={styles.statusIndicator}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: isOnline ? THEME.success : THEME.error },
                  ]}
                />
                <Text style={styles.statusTitle}>Driver Status</Text>
              </View>
            </View>

            <Text
              style={[
                styles.statusText,
                { color: isOnline ? THEME.success : THEME.error },
              ]}
            >
              {isOnline ? 'Online & Available' : 'Offline'}
            </Text>

            <Text style={styles.statusSubtitle}>
              {isOnline
                ? 'Ready to accept new trip requests'
                : "You won't receive trip notifications"}
            </Text>
          </View>

          <View style={styles.statusRight}>
            {isStatusToggleLoading || isStatusLoading ? (
              <ActivityIndicator color={THEME.primary} />
            ) : (
              <Switch
                value={isOnline}
                onValueChange={handleStatusToggle}
                trackColor={{ false: THEME.border, true: `${THEME.primary}40` }}
                thumbColor={isOnline ? THEME.primary : THEME.placeholder}
                style={styles.statusSwitch}
                disabled={isStatusToggleLoading || isStatusLoading}
              />
            )}
          </View>
        </Animated.View>

        {/* PART-LOAD STATUS (separate) */}
        <Animated.View
          style={[
            styles.statusCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: cardScale }],
            },
          ]}
        >
          <View style={styles.statusLeft}>
            <View style={styles.statusHeader}>
              <View style={styles.statusIndicator}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: isPartLoadAvailable
                        ? THEME.success
                        : THEME.error,
                    },
                  ]}
                />
                <Text style={styles.statusTitle}>Part Load Status</Text>
              </View>
            </View>

            <Text
              style={[
                styles.statusText,
                {
                  color: isPartLoadAvailable ? THEME.success : THEME.error,
                },
              ]}
            >
              {isPartLoadAvailable ? 'Part Load' : 'Part Load Not Available'}
            </Text>

            <Text style={styles.statusSubtitle}>
              {isPartLoadAvailable
                ? 'Accepting part-load requests'
                : 'Part-load not available'}
            </Text>
          </View>

          <View style={styles.statusRight}>
            {isPartToggleLoading || isStatusLoading ? (
              <ActivityIndicator color={THEME.primary} />
            ) : (
              <Switch
                value={isPartLoadAvailable}
                onValueChange={handlePartLoadStatusToggle}
                trackColor={{ false: THEME.border, true: `${THEME.primary}40` }}
                thumbColor={
                  isPartLoadAvailable ? THEME.primary : THEME.placeholder
                }
                style={styles.statusSwitch}
                disabled={isPartToggleLoading || isStatusLoading}
              />
            )}
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.statsContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Icon name="trips" size={20} color={THEME.primary} />
              <Text style={styles.statLabel}>Requests</Text>
            </View>
            <Text style={styles.statNumber}>{pendingBookings.length}</Text>
            <Text style={styles.statChange}>Pending</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Icon name="earnings" size={20} color={THEME.success} />
              <Text style={styles.statLabel}>Today's Earnings</Text>
            </View>
            <Text style={[styles.statNumber, { color: THEME.success }]}>
              ₹1,240
            </Text>
            <Text style={styles.statChange}>+18% this week</Text>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.overviewCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.overviewHeader}>
            <Icon name="notification" size={22} color={THEME.primary} />
            <Text style={styles.overviewTitle}>New Bookings</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('BookingHistory', { accessToken })
              }
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {pendingBookings.length > 0 ? (
            <FlatList
              data={pendingBookings.slice(0, 3)}
              renderItem={renderPendingItem}
              keyExtractor={item => item.request_id.toString()}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.noHistoryText}>No new booking requests.</Text>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.surface,
  },
  header: {
    backgroundColor: THEME.primary,
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  notificationButton: {
    padding: 8,
  },
  notificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    backgroundColor: THEME.error,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  statusCard: {
    backgroundColor: THEME.surfaceElevated,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  statusLeft: {
    flex: 1,
  },
  statusHeader: {
    marginBottom: 12,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    color: THEME.textSecondary,
    lineHeight: 20,
  },
  statusRight: {
    alignItems: 'center',
    minWidth: 50,
  },
  statusSwitch: {
    transform: [{ scale: 1.1 }],
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    backgroundColor: THEME.surfaceElevated,
    borderRadius: 16,
    padding: 20,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.textSecondary,
    marginLeft: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: THEME.primary,
    marginBottom: 4,
  },
  statChange: {
    fontSize: 12,
    color: THEME.success,
    fontWeight: '500',
  },
  overviewCard: {
    backgroundColor: THEME.surfaceElevated,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.textPrimary,
    marginLeft: 12,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.primary,
  },
  noHistoryText: {
    textAlign: 'center',
    color: THEME.textSecondary,
    marginVertical: 20,
    fontSize: 14,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.borderLight,
  },
  historyItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyItemDetails: {
    flex: 1,
  },
  historyItemRoute: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textPrimary,
    marginBottom: 4,
  },
  historyItemDate: {
    fontSize: 12,
    color: THEME.textSecondary,
  },
  historyItemRight: {
    alignItems: 'flex-end',
  },
  historyItemEarnings: {
    fontSize: 14,
    fontWeight: 'bold',
    color: THEME.success,
    marginBottom: 4,
  },
  historyItemStatus: {
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  status_completed: {
    backgroundColor: `${THEME.success}20`,
    color: THEME.success,
  },
  status_active: {
    backgroundColor: `${THEME.primary}20`,
    color: THEME.primary,
  },
  status_pending: {
    backgroundColor: `${THEME.warning}20`,
    color: THEME.warning,
  },
  status_confirmed: {
    backgroundColor: `${THEME.primary}20`,
    color: THEME.primary,
  },
  sidebarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sidebarContainer: {
    width: width * 0.75,
    height: '100%',
    backgroundColor: THEME.background,
  },
  sidebarHeader: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  sidebarAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: THEME.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  sidebarUserName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.textOnPrimary,
    marginBottom: 4,
  },
  sidebarUserPhone: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  sidebarMenu: {
    flex: 1,
    padding: 20,
  },
  sidebarMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  sidebarIcon: {
    marginRight: 16,
    width: 24,
  },
  sidebarMenuText: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.textPrimary,
  },
  sidebarFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: THEME.borderLight,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${THEME.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileWarningBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: THEME.warning,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: THEME.primary,
  },
  profileWarningText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sidebarWarningDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.warning,
    marginLeft: 8,
  },
});

export default DashboardScreen;