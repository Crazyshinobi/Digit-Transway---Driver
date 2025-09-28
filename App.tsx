import "./global.css"

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';


// Auth Screens
import RoleSelectionScreen from './src/screens/Auth/RoleSelectionScreen';
import LoginScreen from './src/screens/Auth/LoginScreen';
import RegisterScreen from './src/screens/Auth/RegisterScreen';
import VerifyOtpScreen from './src/screens/Auth/VerifyOtpScreen';

// Main Screens
import WelcomeScreen from './src/screens/Main/WelcomeScreen';
import HomeScreen from './src/screens/Main/HomeScreen';
import SubscriptionScreen from "./src/screens/Main/SubscriptionScreen"
import ListVehicleScreen from "./src/screens/Main/ListVehicleScreen"
import QuotingScreen from "./src/screens/Main/QuotingScreen"
import AvailableTripScreen from "./src/screens/Main/AvailableTripScreen"
import TripDetailScreen from "./src/screens/Main/TripDetailScreen"

// Fleet Owner Screens
import FleetDashboardScreen from './src/screens/FleetOwner/FleetDashboardScreen';
import ManageVehiclesScreen from './src/screens/FleetOwner/ManageVehicleScreen';

// Driver Screens
import DriverDashboardScreen from './src/screens/Driver/DriverDashboardScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome">

        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />

        {/* Auth Screens */}
        <Stack.Screen
          name="RoleSelection"
          component={RoleSelectionScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}

        />
        <Stack.Screen
          name="VerifyOTP"
          component={VerifyOtpScreen}
          options={{ headerShown: false }}

        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}

        />

        {/* Main Screens */}
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Dashboard' }}
        />
        <Stack.Screen
          name="Subscription"
          component={SubscriptionScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="ListVehicle"
          component={ListVehicleScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Quoting"
          component={QuotingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AvailableTrip"
          component={AvailableTripScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TripDetail"
          component={TripDetailScreen}
          options={{ headerShown: false }}
        />

        {/* Fleet Owner Screens */}
        <Stack.Screen
          name="FleetDashboard"
          component={FleetDashboardScreen}
          options={{ title: 'Fleet Management' }}
        />
        <Stack.Screen
          name="ManageVehicles"
          component={ManageVehiclesScreen}
          options={{ title: 'Vehicle Management' }}
        />
        {/* Driver Screens */}
        <Stack.Screen
          name="DriverDashboard"
          component={DriverDashboardScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;