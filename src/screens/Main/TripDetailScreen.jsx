import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';

const Icon = ({ name, size, style }) => {
  const getIcon = () => {
    switch (name) {
      case 'back': return '⬅️';
      case 'location': return '📍';
      default: return '❔';
    }
  };
  return <Text style={[{ fontSize: size }, style]}>{getIcon()}</Text>;
};


const TripDetailScreen = ({ route, navigation }) => {
    const { trip } = route.params;
    const [quote, setQuote] = useState('');
    
    const handleQuoteSubmit = () => {
        if (!quote || isNaN(quote) || Number(quote) <= 0) {
            Alert.alert("Invalid Quote", "Please enter a valid quote amount.");
            return;
        }
        navigation.navigate('Quoting', { trip, quote });
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="back" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Trip Details</Text>
                <View style={{width: 40}} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.card}>
                    <View style={styles.locationRow}>
                        <View style={styles.iconContainerGreen}>
                            <Icon name="location" size={20} />
                        </View>
                        <View style={styles.locationTextContainer}>
                            <Text style={styles.locationLabel}>Pickup</Text>
                            <Text style={styles.locationValue}>{trip.from}</Text>
                        </View>
                    </View>
                    <View style={styles.locationRow}>
                        <View style={styles.iconContainerRed}>
                            <Icon name="location" size={20} />
                        </View>
                        <View style={styles.locationTextContainer}>
                            <Text style={styles.locationLabel}>Drop-off</Text>
                            <Text style={styles.locationValue}>{trip.to}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Load Details</Text>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Vehicle Type:</Text>
                        <Text style={styles.detailValue}>{trip.vehicle}</Text>
                    </View>
                     <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Total Distance:</Text>
                        <Text style={styles.detailValue}>{trip.distance}</Text>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Enter Your Quote</Text>
                    <Text style={styles.cardSubtitle}>
                        Enter the total amount you want to charge for this trip.
                    </Text>
                    <View style={styles.quoteInputContainer}>
                         <Text style={styles.currencySymbol}>₹</Text>
                         <TextInput
                            style={styles.quoteInput}
                            placeholder="0.00"
                            placeholderTextColor="#9ca3af"
                            value={quote}
                            onChangeText={setQuote}
                            keyboardType="numeric"
                        />
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity 
                    style={styles.submitButton}
                    onPress={handleQuoteSubmit}
                    activeOpacity={0.8}
                >
                    <Text style={styles.submitButtonText}>Submit Quote</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        backgroundColor: '#FFFFFF',
        paddingTop: Platform.OS === 'android' ? 25 : 50,
        paddingBottom: 16,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#111827',
    },
    scrollContent: {
        padding: 20,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 3,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconContainerGreen: {
        width: 44,
        height: 44,
        backgroundColor: '#dcfce7',
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainerRed: {
        width: 44,
        height: 44,
        backgroundColor: '#fee2e2',
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    locationTextContainer: {
        marginLeft: 16,
        flex: 1,
    },
    locationLabel: {
        fontSize: 14,
        color: '#6b7280',
    },
    locationValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    detailLabel: {
        fontSize: 16,
        color: '#6b7280',
    },
    detailValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 16,
    },
    quoteInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        borderRadius: 16,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    currencySymbol: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#4b5563',
    },
    quoteInput: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1f2937',
        marginLeft: 12,
    },
    footer: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    submitButton: {
        backgroundColor: '#4285f4',
        borderRadius: 18,
        paddingVertical: 18,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default TripDetailScreen;