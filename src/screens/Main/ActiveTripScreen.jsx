import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from 'react-native';

const Icon = ({ name, size, style }) => {
  const getIcon = () => {
    switch (name) {
      case 'back': return '⬅️';
      case 'map': return '🗺️';
      case 'filter': return '📊';
      case 'distance': return '↔️';
      default: return '❔';
    }
  };
  return <Text style={[{ fontSize: size }, style]}>{getIcon()}</Text>;
};

const mockTrips = [
  { id: '1', from: 'Noida Sec 62', to: 'Gurgaon Sec 29', distance: '45 km', vehicle: 'Mini Truck' },
  { id: '2', from: 'Delhi Cantt', to: 'Faridabad', distance: '35 km', vehicle: 'Small Truck' },
  { id: '3', from: 'Ghaziabad', to: 'Meerut', distance: '70 km', vehicle: 'Medium Truck' },
  { id: '4', from: 'Noida City Center', to: 'Greater Noida', distance: '25 km', vehicle: 'Mini Truck' },
  { id: '5', from: 'South Delhi', to: 'Sonipat', distance: '60 km', vehicle: 'Large Truck' },
];


const AvailableTripScreen = ({ navigation }) => {
  const [trips] = useState(mockTrips);

  const renderTripItem = ({ item }) => (
    <TouchableOpacity 
        className="bg-white p-5 rounded-2xl mb-4 shadow-md border border-gray-100"
        onPress={() => navigation.navigate('TripDetail', { trip: item })}
    >
        <View className="flex-row justify-between items-center">
            <Text className="text-lg font-bold text-gray-800">{item.from} → {item.to}</Text>
            <View className="bg-purple-100 px-3 py-1 rounded-full">
                <Text className="text-purple-700 font-semibold text-xs">{item.vehicle}</Text>
            </View>
        </View>
        <View className="h-px bg-gray-200 my-3" />
        <View className="flex-row justify-between items-center mt-2">
            <View className="flex-row items-center">
                <Icon name="distance" size={16} style={{color: '#555'}} />
                <Text className="text-base text-gray-600 ml-2">{item.distance}</Text>
            </View>
            <View className="bg-green-500 px-4 py-2 rounded-lg">
                <Text className="text-white font-bold text-sm">Quote Now</Text>
            </View>
        </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
       <View className="bg-white pt-12 pb-4 px-5 shadow-sm flex-row justify-between items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
            <Icon name="back" size={24} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">Available Trips</Text>
        <TouchableOpacity className="p-2">
            <Icon name="filter" size={22} style={{color: "#555"}}/>
        </TouchableOpacity>
      </View>

      <FlatList
        data={trips}
        renderItem={renderTripItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 20 }}
      />
    </SafeAreaView>
  );
};

export default AvailableTripScreen;