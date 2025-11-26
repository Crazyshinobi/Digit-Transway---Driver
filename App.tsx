import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StatusBar, LogBox, PermissionsAndroid, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { THEME } from './src/themes/colors';

import AuthLoadingScreen from './src/screens/Auth/AuthLoadingScreen';
import RoleSelectionScreen from './src/screens/Auth/RoleSelectionScreen';
import LoginScreen from './src/screens/Auth/LoginScreen';
import RegisterScreen from './src/screens/Auth/RegisterScreen';
import VerifyOtpScreen from './src/screens/Auth/VerifyOtpScreen';

import HomeScreen from './src/screens/Main/HomeScreen';
import SubscriptionScreen from "./src/screens/Main/SubscriptionScreen";
import ListVehicleScreen from "./src/screens/Main/ListVehicleScreen";
import QuotingScreen from "./src/screens/Main/QuotingScreen";
import AvailableTripScreen from "./src/screens/Main/AvailableTripScreen";
import TripDetailScreen from "./src/screens/Main/TripDetailScreen";
import DashboardScreen from './src/screens/Main/DashboardScreen';
import BookingHistoryScreen from './src/screens/Main/BookingHistoryScreen';
import BookingTrackScreen from './src/screens/Main/BookingTrackScreen';
import ProfileScreen from './src/screens/Main/ProfileScreen';
import PaymentHistoryScreen from './src/screens/Main/PaymentHistoryScreen';

import { RegistrationProvider } from './src/context/RegistrationContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import locationService from './src/services/LocationService';

LogBox.ignoreLogs(['Setting a timer']);

export type RootStackParamList = {
  AuthLoading: undefined;
  RoleSelection: undefined;
  Login: undefined;
  VerifyOTP: undefined;
  Register: { user_type_key?: string };
  Home: undefined;
  Subscription: undefined;
  ListVehicle: undefined;
  Quoting: undefined;
  AvailableTrip: undefined;
  TripDetail: undefined;
  Dashboard: undefined;
  BookingHistory: undefined;
  BookingTrackScreen: { bookingId: number | string };
  Profile: undefined;
  PaymentHistoryScreen: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

async function startTrackingIfAllowed() {
  try {
    const vendorId = await AsyncStorage.getItem('@vendor_id');
    const token = await AsyncStorage.getItem('@user_token');

    if (!vendorId || !token) {
      console.log('[App] Vendor ID or token missing. LocationService will NOT start yet.');
      return;
    }

    if (Platform.OS === 'android') {
      const fine = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );

      if (fine !== PermissionsAndroid.RESULTS.GRANTED) {
        console.warn('[App] Location permission NOT granted.');
        return;
      }
    }

    console.log('[App] Permissions OK → Starting Location Service…');
    locationService.start();

  } catch (err) {
    console.log('[App] startTrackingIfAllowed error:', err);
  }
}

const App = () => {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        console.log('[App] Booting app… Checking if tracking can start...');
        await startTrackingIfAllowed();
      } catch (err) {
        console.log('[App] Unexpected boot error:', err);
      } finally {
        if (mounted) setAppReady(true);
      }
    })();

    return () => {
      mounted = false;
      console.log('[App] Unmount → stopping LocationService');
      locationService.stop();
    };
  }, []);

  if (!appReady) {
    return (
      <View style={{ flex: 1, backgroundColor: THEME.primary, justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar barStyle="light-content" backgroundColor={THEME.primary} />
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="AuthLoading" screenOptions={{ headerShown: false }}>

        {/* Auth Screens */}
        <Stack.Screen name="AuthLoading" component={AuthLoadingScreen} />
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="VerifyOTP" component={VerifyOtpScreen} />

        <Stack.Screen
          name="Register"
          component={({ route, navigation }: any) => (
            <RegistrationProvider route={route} navigation={navigation}>
              <RegisterScreen />
            </RegistrationProvider>
          )}
        />

        {/* Main Screens */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Subscription" component={SubscriptionScreen} />
        <Stack.Screen name="ListVehicle" component={ListVehicleScreen} />
        <Stack.Screen name="Quoting" component={QuotingScreen} />
        <Stack.Screen name="AvailableTrip" component={AvailableTripScreen} />
        <Stack.Screen name="TripDetail" component={TripDetailScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="BookingHistory" component={BookingHistoryScreen} />
        <Stack.Screen name="BookingTrackScreen" component={BookingTrackScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="PaymentHistoryScreen" component={PaymentHistoryScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
