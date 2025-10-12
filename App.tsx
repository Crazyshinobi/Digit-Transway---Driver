import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StatusBar } from 'react-native';
import { THEME } from './src/themes/colors';

import AsyncStorage from '@react-native-async-storage/async-storage';

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
import VerificationScreen from './src/screens/Main/VerificationScreen';

const Stack = createNativeStackNavigator();

const SplashScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', backgroundColor: THEME.background }}>
    <StatusBar barStyle="dark-content" />
    <ActivityIndicator size="large" color={THEME.primary} />
  </View>
);

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Login');

  useEffect(() => {
    const checkToken = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        if (userToken) {
          setInitialRoute('Dashboard');
        }
      } catch (e) {
        console.error("Failed to fetch user token.", e);
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={initialRoute} 
        screenOptions={{ headerShown: false }}
      >
        {/* Auth Screens */}
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="VerifyOTP" component={VerifyOtpScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />

        {/* Main Screens */}
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Dashboard' }} />
        <Stack.Screen name="Subscription" component={SubscriptionScreen} />
        <Stack.Screen name="ListVehicle" component={ListVehicleScreen} />
        <Stack.Screen name="Quoting" component={QuotingScreen} />
        <Stack.Screen name="AvailableTrip" component={AvailableTripScreen} />
        <Stack.Screen name="TripDetail" component={TripDetailScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="BookingHistory" component={BookingHistoryScreen} />
        <Stack.Screen name="Verification" component={VerificationScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;