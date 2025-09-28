import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';

const Icon = ({ name, size }) => {
  const getIcon = () => {
    switch (name) {
      case 'check': return '✅';
      default: return '❔';
    }
  };
  return <Text style={{ fontSize: size }}>{getIcon()}</Text>;
};

const QuotingScreen = ({ route, navigation }) => {
    const { trip, quote } = route.params;

    useEffect(() => {
        const timer = setTimeout(() => {
            navigation.replace('ActiveTrip', { trip, quote });
        }, 5000); 
        return () => clearTimeout(timer);
    }, [navigation, trip, quote]);

    return (
        <SafeAreaView className="flex-1 bg-[#4285f4] justify-center items-center p-8">
            <Icon name="check" size={60} />
            <Text className="text-3xl font-bold text-white text-center mt-6">Quote Submitted!</Text>
            <Text className="text-xl font-bold text-white mt-2">₹{quote}</Text>
            
            <View className="my-8 items-center">
                <Text className="text-lg text-white/90 text-center">Your quote has been sent to the customer.</Text>
                <Text className="text-lg text-white/90 text-center mt-2">We will notify you as soon as they respond.</Text>
            </View>

            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text className="text-base text-white/80 mt-4">Waiting for approval...</Text>

             <TouchableOpacity 
                onPress={() => navigation.navigate('AvailableTrip')} 
                className="absolute bottom-10 bg-white/20 px-6 py-3 rounded-full"
             >
                <Text className="text-white font-semibold">Cancel and Find Other Trips</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

export default QuotingScreen;
