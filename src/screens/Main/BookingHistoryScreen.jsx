import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { THEME } from '../../themes/colors';
import { API_URL } from '../../config/config';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Icon = ({ name, size = 24, color, style }) => {
  const getIcon = () => {
    switch (name) {
      case 'back': return '←';
      default: return '';
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
    completed: false,
  });
  const [processingId, setProcessingId] = useState(null);

  const fetchDataForTab = useCallback(async (tab, token) => {
    if (!token) return;

    let endpoint = '';
    switch (tab) {
      case 'active':
        endpoint = '/api/truck-booking/my-bookings/active';
        break;
      case 'pending':
        endpoint = '/api/vendor/booking-requests';
        break;
      case 'completed':
        setIsLoading(prev => ({ ...prev, completed: false }));
        return;
      default:
        return;
    }

    setIsLoading(prev => ({ ...prev, [tab]: true }));
    try {
      const response = await axios.get(`${API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data?.success && Array.isArray(response.data.data)) {
        setBookings(prev => ({ ...prev, [tab]: response.data.data }));
      } else {
        setBookings(prev => ({ ...prev, [tab]: [] }));
      }
    } catch (error) {
      console.error(`Failed to fetch ${tab} bookings:`, error.response?.data || error.message);
      setBookings(prev => ({ ...prev, [tab]: [] }));
    } finally {
      setIsLoading(prev => ({ ...prev, [tab]: false }));
    }
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      let token = route.params?.accessToken;
      if (!token) {
        token = await AsyncStorage.getItem('userToken');
      }

      if (token) {
        setAccessToken(token);
        fetchDataForTab('active', token);
        fetchDataForTab('pending', token);
      } else {
        Alert.alert("Authentication Error", "Your session is invalid.", [
          { text: "OK", onPress: () => navigation.navigate('Login') }
        ]);
      }
    };
    bootstrap();
  }, [fetchDataForTab, navigation, route.params?.accessToken]);

  const handleRequestAction = async (bookingId, action) => {
    if (!accessToken) return;
    setProcessingId(bookingId);
    try {
      await axios.post(
        `${API_URL}/api/vendor/booking-requests/${bookingId}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      
      setBookings(prev => ({
          ...prev,
          pending: prev.pending.filter(item => item.id !== bookingId)
      }));
      Alert.alert('Success', `Booking has been ${action}ed.`);

    } catch (error) {
        console.error(`Failed to ${action} booking:`, error.response?.data || error.message);
        Alert.alert('Error', `Could not ${action} the booking. Please try again.`);
    } finally {
        setProcessingId(null);
    }
  };

  const renderBookingItem = ({ item }) => (
    <View style={styles.bookingCard}>
        <View style={styles.cardHeader}>
            <Text style={styles.routeText} numberOfLines={1}>{item.pickup_location} → {item.dropoff_location}</Text>
            <Text style={styles.earningsText}>₹{item.earnings || item.price}</Text>
        </View>
        <View style={styles.cardBody}>
            <Text style={styles.detailText}>Date: {new Date(item.date || item.created_at).toLocaleDateString()}</Text>
            <Text style={styles.detailText}>Vehicle: {item.vehicle_type || 'N/A'}</Text>
        </View>
        
        {activeTab === 'pending' ? (
            <View style={styles.actionContainer}>
                {processingId === item.id ? (
                    <ActivityIndicator color={THEME.primary} />
                ) : (
                    <>
                        <TouchableOpacity style={[styles.actionButton, styles.rejectButton]} onPress={() => handleRequestAction(item.id, 'reject')}>
                            <Text style={[styles.actionButtonText, styles.rejectButtonText]}>Reject</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionButton, styles.acceptButton]} onPress={() => handleRequestAction(item.id, 'accept')}>
                            <Text style={[styles.actionButtonText, styles.acceptButtonText]}>Accept</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        ) : (
            <View style={styles.cardFooter}>
                <Text style={[styles.statusBadge, styles[`status_${item.status || 'pending'}`]]}>
                    {item.status || 'pending'}
                </Text>
            </View>
        )}
    </View>
  );

  const renderContent = () => {
    const currentData = bookings[activeTab];
    const currentLoading = isLoading[activeTab];

    if (currentLoading) {
      return <ActivityIndicator size="large" color={THEME.primary} style={styles.loader} />;
    }

    if (currentData.length === 0) {
      return (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No {activeTab} bookings found.</Text>
            <Text style={styles.emptySubtext}>
                {activeTab === 'pending' ? 'New requests will appear here.' : 'Check back later or find new trips!'}
            </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={currentData}
        renderItem={renderBookingItem}
        keyExtractor={(item, index) => `${item.id}-${index}`}
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
      <Text style={[styles.tabText, activeTab === name && styles.activeTabText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
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
  detailText: {
      fontSize: 14,
      color: THEME.textSecondary,
      marginBottom: 4,
  },
  cardFooter: { alignItems: 'flex-end' },
  statusBadge: {
      fontSize: 12,
      fontWeight: 'bold',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
      overflow: 'hidden',
      textTransform: 'uppercase',
  },
  status_active: { backgroundColor: `${THEME.primary}20`, color: THEME.primary },
  status_pending: { backgroundColor: `${THEME.warning}20`, color: THEME.warning },
  status_completed: { backgroundColor: `${THEME.success}20`, color: THEME.success },
  actionContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
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
      marginLeft: 10,
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
});

export default BookingHistoryScreen;