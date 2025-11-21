import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StatusBar } from 'react-native';
import { THEME } from './src/themes/colors';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
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
import { RegistrationProvider } from './src/context/RegistrationContext';

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
};

const Stack = createNativeStackNavigator<RootStackParamList>();

type RegisterScreenProps = NativeStackScreenProps<RootStackParamList, 'Register'>;

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="AuthLoading"
        screenOptions={{ headerShown: false }}
      >
        {/* Auth Screens */}
        <Stack.Screen name="AuthLoading" component={AuthLoadingScreen} />
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="VerifyOTP" component={VerifyOtpScreen} />
        <Stack.Screen
          name="Register"
          component={({ route, navigation }: RegisterScreenProps) => (
            <RegistrationProvider route={route} navigation={navigation}>
              <RegisterScreen />
            </RegistrationProvider>
          )}
          options={{ headerShown: false }}
        />

        {/* Main Screens */}
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Dashboard' }} />
        <Stack.Screen name="Subscription" component={SubscriptionScreen} />
        <Stack.Screen name="ListVehicle" component={ListVehicleScreen} />
        <Stack.Screen name="Quoting" component={QuotingScreen} />
        <Stack.Screen name="AvailableTrip" component={AvailableTripScreen} />
        <Stack.Screen name="TripDetail" component={TripDetailScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="BookingHistory" component={BookingHistoryScreen} />
        <Stack.Screen name="BookingTrackScreen" component={BookingTrackScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;