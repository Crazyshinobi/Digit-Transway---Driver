import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../../config/config'; // Assuming API_URL is correctly defined (e.g., http://localhost:8000)

const AuthLoadingScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const determineRoute = async () => {
      let token = null;
      let storedPhoneNumber = null;

      try {
        // 1. Check local storage
        token = await AsyncStorage.getItem('@user_token'); // Keep key as-is unless you change it app-wide
        storedPhoneNumber = await AsyncStorage.getItem('@user_phone_number'); // Keep key as-is
        console.log('Token', token);
        console.log('Stored Phone Number', storedPhoneNumber);

        if (!token || !storedPhoneNumber) {
          console.log('[AuthLoading] No session found. Navigating to Login.');
          navigation.replace('Login');
          return;
        }

        console.log(
          '[AuthLoading] Session found. Checking vendor registration status...',
        ); // 2. Check Registration Status (Using new vendor API)

        const statusResponse = await axios.post(
          `${API_URL}/api/vendor/auth/check-vendor-status`, // <-- UPDATED API
          { contact_number: storedPhoneNumber },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (!statusResponse.data?.success) {
          throw new Error(
            statusResponse.data?.message || 'Failed to check vendor status.',
          );
        }

        // --- NEW: Store user data from this response ---
        const vendorData = statusResponse.data.vendor;
        if (vendorData) {
          console.log('[AuthLoading] Storing vendor data to AsyncStorage.');
          await AsyncStorage.setItem('@user_name', vendorData.name || '');
          await AsyncStorage.setItem('@user_email', vendorData.email || '');
          // We already have the phone number, but we can re-verify it
          await AsyncStorage.setItem(
            '@user_phone_number',
            vendorData.contact_number || storedPhoneNumber,
          );
        }
        // --- END NEW ---

        const isCompleted = vendorData?.is_completed;

        if (!isCompleted) {
          console.log(
            '[AuthLoading] Vendor registration incomplete. Navigating to Register.',
          ); // Pass params to Register screen if needed, e.g., to resume
          // navigation.replace('Register', { phoneNumber: storedPhoneNumber, token: token });
          navigation.replace('Register'); // Or just navigate to start
          return;
        }

        console.log(
          '[AuthLoading] Registration complete. Checking subscription...',
        ); // 3. Check Subscription Status (Using new vendor API)

        const subscriptionResponse = await axios.get(
          `${API_URL}/api/vendor-plans/subscriptions`, // <-- UPDATED API
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (!subscriptionResponse.data?.success) {
          throw new Error(
            subscriptionResponse.data?.message ||
              'Failed to check subscription status.',
          );
        } // --- UPDATED LOGIC based on new response JSON ---

        const hasActiveSubscription =
          subscriptionResponse.data.data.has_active_subscription;

        if (!hasActiveSubscription) {
          console.log(
            '[AuthLoading] No active subscription. Navigating to Subscription.',
          );
          navigation.replace('Subscription');
        } else {
          console.log(
            '[AuthLoading] Vendor subscribed. Navigating to Dashboard.',
          );
          navigation.replace('Dashboard'); // Or 'Auser_phone_numberppStack', 'Home', etc.
        }
      } catch (e) {
        console.error('[AuthLoading] Auth check/API call failed:', e.message); // Clear potentially invalid data on any error
        await AsyncStorage.removeItem('@user_token');
        await AsyncStorage.removeItem('@');
        // --- NEW: Clear new user data on error ---
        await AsyncStorage.removeItem('@user_name');
        await AsyncStorage.removeItem('@user_email');
        navigation.replace('Login'); // Fallback to Login
      }
    };

    determineRoute();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4A6CFF" />{' '}
      <Text style={styles.loadingText}>Loading...</Text>{' '}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#777E90',
  },
});

export default AuthLoadingScreen;
