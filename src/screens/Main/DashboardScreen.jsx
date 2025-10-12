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

const Geolocation = {
  getCurrentPosition: (success, error) => {
    const position = { coords: { latitude: 28.6139, longitude: 77.2090 } };
    success(position);
  },
};

const { width } = Dimensions.get('window');

const Icon = ({ name, size = 24, color, style }) => {
  const getIcon = () => {
    switch (name) {
      case 'trips': return '🗺️';
      case 'profile': return '👤';
      case 'notification': return '🔔';
      case 'logout': return '🚪';
      case 'earnings': return '💰';
      case 'dashboard': return '📊';
      case 'vehicle': return '🚛';
      case 'route': return '📍';
      case 'history': return '📜'; 
      case 'verification': return '🛡️';
      default: return '❔';
    }
  };
  return <Text style={[{ fontSize: size, color }, style]}>{getIcon()}</Text>;
};

// --- NEW: Sidebar Menu Component ---
const SidebarMenu = ({ isVisible, onClose, navigation, onSignOut, accessToken, isProfileComplete }) => {
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

    const navigateAndClose = (screen) => {
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
                    <Animated.View style={[styles.sidebarContainer, { transform: [{ translateX: slideAnim }] }]}>
                        <TouchableWithoutFeedback>
                            <View style={{ flex: 1 }}>
                                <LinearGradient colors={THEME.primaryGradient} style={styles.sidebarHeader}>
                                    <View style={styles.sidebarAvatar}>
                                        <Icon name="profile" size={32} color={THEME.primary} />
                                    </View>
                                    <Text style={styles.sidebarUserName}>Hello, Driver</Text>
                                    <Text style={styles.sidebarUserPhone}>+91 98765 43210</Text>
                                </LinearGradient>

                                <View style={styles.sidebarMenu}>
                                   <TouchableOpacity style={styles.sidebarMenuItem} onPress={() => navigateAndClose('Verification')}>
                                         <View style={styles.menuIconContainer}><Icon name="verification" size={20} color={THEME.primary} /></View>
                                        <Text style={styles.sidebarMenuText}>Profile Verification</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.sidebarMenuItem} onPress={() => navigateAndClose('Profile')}>
                                        <View style={styles.menuIconContainer}><Icon name="profile" size={20} color={THEME.primary} /></View>
                                        <Text style={styles.sidebarMenuText}>Profile & Vehicle</Text>
                                        {!isProfileComplete && <View style={styles.sidebarWarningDot} />}
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.sidebarMenuItem} onPress={() => navigateAndClose('BookingHistory')}>
                                         <View style={styles.menuIconContainer}><Icon name="history" size={20} color={THEME.primary} /></View>
                                        <Text style={styles.sidebarMenuText}>Booking History</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.sidebarMenuItem} onPress={() => navigateAndClose('Earnings')}>
                                         <View style={styles.menuIconContainer}><Icon name="earnings" size={20} color={THEME.primary} /></View>
                                        <Text style={styles.sidebarMenuText}>Earnings</Text>
                                    </TouchableOpacity>
                                   
                                </View>

                                <View style={styles.sidebarFooter}>
                                    <TouchableOpacity style={styles.sidebarMenuItem} onPress={onSignOut}>
                                        <View style={[styles.menuIconContainer, {backgroundColor: `${THEME.error}15`}]}><Icon name="logout" size={20} color={THEME.error} /></View>
                                        <Text style={[styles.sidebarMenuText, { color: THEME.error }]}>Sign Out</Text>
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
  const [isOnline, setIsOnline] = useState(true);
  const [accessToken, setAccessToken] = useState(null);
  const [isToggleLoading, setIsToggleLoading] = useState(false);
  const [bookingHistory, setBookingHistory] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const cardScale = useRef(new Animated.Value(0.95)).current;

  const fetchBookingHistory = async (token) => {
    setIsHistoryLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/vendor/booking-history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookingHistory(response.data?.success && Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error("Failed to fetch booking history:", error.response?.data || error.message);
      setBookingHistory([]);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      let token = route.params?.accessToken;
      if (!token) token = await AsyncStorage.getItem('userToken');
      
      if (token) {
        setAccessToken(token);
        fetchBookingHistory(token);
      } else {
        Alert.alert("Authentication Error", "Your session is invalid.", [
          { text: "OK", onPress: () => navigation.navigate('Login') }
        ]);
      }
    };
    bootstrap();

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
      Animated.spring(cardScale, { toValue: 1, friction: 8, tension: 40, delay: 200, useNativeDriver: true }),
    ]).start();
  }, []);

  const getCurrentLocation = () => new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => resolve(position.coords),
      error => {
        Alert.alert("Location Error", "Could not get your location.");
        reject(error);
      }
    );
  });

  const handleStatusToggle = async (newValue) => {
    const previousValue = isOnline;
    setIsOnline(newValue);
    setIsToggleLoading(true);
    try {
      if (!accessToken) throw new Error("Token missing.");
      const location = await getCurrentLocation();
      await axios.post(
        `${API_URL}/api/vendor/availability/toggle`,
        { latitude: location.latitude, longitude: location.longitude },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
    } catch (error) {
      console.error("Toggle error:", error.response?.data || error.message);
      Alert.alert("Error", "Could not update status.");
      setIsOnline(previousValue);
    } finally {
      setIsToggleLoading(false);
    }
  };

  const handleSignOut = () => {
    setIsSidebarVisible(false); 
    setTimeout(async () => {
        try {
            await AsyncStorage.removeItem('userToken');
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        } catch (e) {
            console.error("Failed to sign out.", e);
            Alert.alert("Error", "Could not sign out.");
        }
    }, 300);
  };

  const renderHistoryItem = ({ item }) => (
    <TouchableOpacity style={styles.historyItem}>
      <View style={styles.historyItemIcon}><Text>📍</Text></View>
      <View style={styles.historyItemDetails}>
        <Text style={styles.historyItemRoute} numberOfLines={1}>{item.pickup_location} to {item.dropoff_location}</Text>
        <Text style={styles.historyItemDate}>{new Date(item.date).toDateString()}</Text>
      </View>
      <View style={styles.historyItemRight}>
        <Text style={styles.historyItemEarnings}>₹{item.earnings}</Text>
        <Text style={[styles.historyItemStatus, styles[`status_${item.status}`]]}>{item.status}</Text>
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
      />
      
      <Animated.View 
        style={[ styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] } ]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => setIsSidebarVisible(true)} style={styles.avatarContainer}>
              <Icon name="profile" size={24} color="#fff" />
              {!isProfileComplete && (
                  <View style={styles.profileWarningBadge}>
                      <Text style={styles.profileWarningText}>!</Text>
                  </View>
              )}
            </TouchableOpacity>
            <View>
              <Text style={styles.greeting}>Hello, Driver!</Text>
              <Text style={styles.subtitle}>Welcome to your dashboard</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <View style={styles.notificationIconContainer}>
              <Icon name="notification" size={20} color="#fff" />
              <View style={styles.notificationBadge} />
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[ styles.statusCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: cardScale }] } ]}
        >
          <View style={styles.statusLeft}>
            <View style={styles.statusHeader}>
              <View style={styles.statusIndicator}>
                <View style={[ styles.statusDot, { backgroundColor: isOnline ? THEME.success : THEME.error } ]} />
                <Text style={styles.statusTitle}>Driver Status</Text>
              </View>
            </View>
            
            <Text style={[ styles.statusText, { color: isOnline ? THEME.success : THEME.error } ]}>
              {isOnline ? 'Online & Available' : 'Offline'}
            </Text>
            
            <Text style={styles.statusSubtitle}>
              {isOnline 
                ? 'Ready to accept new trip requests' 
                : 'You won\'t receive trip notifications'
              }
            </Text>
          </View>
          
          <View style={styles.statusRight}>
            {isToggleLoading ? (
              <ActivityIndicator color={THEME.primary} />
            ) : (
              <Switch
                value={isOnline}
                onValueChange={handleStatusToggle}
                trackColor={{ false: THEME.border, true: `${THEME.primary}40` }}
                thumbColor={isOnline ? THEME.primary : THEME.placeholder}
                style={styles.statusSwitch}
              />
            )}
          </View>
        </Animated.View>

        <Animated.View
          style={[ styles.statsContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] } ]}
        >
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Icon name="trips" size={20} color={THEME.primary} />
              <Text style={styles.statLabel}>Trips Today</Text>
            </View>
            <Text style={styles.statNumber}>7</Text>
            <Text style={styles.statChange}>+2 from yesterday</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Icon name="earnings" size={20} color={THEME.success} />
              <Text style={styles.statLabel}>Today's Earnings</Text>
            </View>
            <Text style={[styles.statNumber, { color: THEME.success }]}>₹1,240</Text>
            <Text style={styles.statChange}>+18% this week</Text>
          </View>
        </Animated.View>

        <Animated.View
          style={[ styles.actionCardContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] } ]}
        >
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('AvailableTrip', { accessToken })}
            activeOpacity={0.8}
          >
            <View style={styles.actionCardHeader}>
              <View style={styles.actionIconContainer}>
                <Icon name="route" size={28} color="#fff" />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Find New Trips</Text>
                <Text style={styles.actionSubtitle}>
                  Browse available loads and submit quotes
                </Text>
              </View>
            </View>
            
            <View style={styles.actionCardFooter}>
              <Text style={styles.actionCTA}>Start Searching →</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
        
        <Animated.View
          style={[ styles.overviewCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] } ]}
        >
            <View style={styles.overviewHeader}>
                <Icon name="history" size={22} color={THEME.primary} />
                <Text style={styles.overviewTitle}>Recent Bookings</Text>
                <TouchableOpacity onPress={() => navigation.navigate('BookingHistory', { accessToken })}>
                    <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
            </View>
            
            {isHistoryLoading ? (
                <ActivityIndicator color={THEME.primary} style={{ marginVertical: 20 }}/>
            ) : bookingHistory.length > 0 ? (
                <FlatList
                    data={bookingHistory.slice(0, 3)}
                    renderItem={renderHistoryItem}
                    keyExtractor={item => item.id.toString()}
                    scrollEnabled={false}
                />
            ) : (
                <Text style={styles.noHistoryText}>No recent bookings found.</Text>
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
    fontSize: 24,
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
  actionCardContainer: {
    marginBottom: 20,
  },
  actionCard: {
    backgroundColor: THEME.textPrimary, 
    borderRadius: 20,
    padding: 24,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  actionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  actionCardFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 16,
    alignItems: 'flex-end',
  },
  actionCTA: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
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

