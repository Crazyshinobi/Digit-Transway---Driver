import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking, 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME } from '../../themes/colors'; 
import axios from 'axios';
import { API_URL } from '../../config/config'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';

const Icon = ({ name, size = 24, color, style }) => {
  const getIcon = () => {
    switch (name) {
      case 'profile':
        return '👤';
      case 'vehicle':
        return '🚛';
      case 'address':
        return '🏠';
      case 'bank':
        return '🏦';
      case 'document':
        return '📄';
      case 'back':
        return '⬅️'; 
      default:
        return '❔';
    }
  };
  return <Text style={[{ fontSize: size, color }, style]}>{getIcon()}</Text>;
};

const InfoRow = ({ label, value, verified = null }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <View style={styles.infoValueContainer}>
      <Text style={styles.infoValue} selectable={true}>{value || 'N/A'}</Text>
      {verified === true && <Text style={styles.verifiedIcon}> ✅</Text>}
      {verified === false && <Text style={styles.verifiedIcon}> ❌</Text>}
    </View>
  </View>
);

const DocumentRow = ({ label, number, verified, imageUrl }) => {
  const handleView = () => {
    if (imageUrl) {
      Linking.openURL(imageUrl).catch(err =>
        Alert.alert('Error', 'Could not open document.'),
      );
    } else {
      Alert.alert('Not Available', 'Document has not been uploaded.');
    }
  };

  return (
    <View style={styles.docRow}>
      <View style={styles.docInfo}>
        <Text style={styles.infoLabel}>{label}</Text>
        <View style={styles.infoValueContainer}>
          <Text style={styles.infoValue}>{number || 'N/A'}</Text>
          {verified === true && <Text style={styles.verifiedIcon}> ✅</Text>}
        </View>
      </View>
    </View>
  );
};

const InfoSection = ({ title, iconName, children }) => (
  <View style={styles.infoSection}>
    <View style={styles.sectionHeader}>
      <Icon name={iconName} size={20} color={THEME.primary} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

const ProfileScreenHeader = ({ navigation }) => (
  <View style={styles.header}>
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      style={styles.headerButton}>
      <Icon name="back" size={24} color="#fff" />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>Profile</Text>
    <View style={styles.headerButton} /> {/* Spacer */}
  </View>
);

const ProfileScreen = ({ navigation }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('@user_token');
        if (!token) {
          navigation.replace('Login');
          return;
        }

        const response = await axios.get(
          `${API_URL}/api/vendor/auth/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.data && response.data.success) {
          setProfileData(response.data.data.vendor);
        } else {
          throw new Error(response.data.message || 'Failed to fetch profile');
        }
      } catch (err) {
        console.error('Profile fetch error:', err.response?.data || err.message);
        setError(err.message);
        if (err.response?.status === 401) {
          Alert.alert('Session Expired', 'Please log in again.', [
            { text: 'OK', onPress: () => navigation.replace('Login') },
          ]);
        } else {
          Alert.alert(
            'Error',
            'Could not load your profile. Please try again later.',
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigation]);

  /**
   * Formats a
   * ISO date string (e.g., "1979-06-09T18:30:00.000000Z")
   * into a readable format (e.g., "June 9, 1979").
   */
  const formatDate = dateString => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return dateString; 
    }
  };

  

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={THEME.primary} />
        <ProfileScreenHeader navigation={navigation} />
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color={THEME.primary} />
          <Text style={styles.loadingText}>Loading Profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !profileData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={THEME.primary} />
        <ProfileScreenHeader navigation={navigation} />
        <View style={styles.centeredContainer}>
          <Text style={styles.errorText}>Failed to load profile.</Text>
          <TouchableOpacity onPress={() => setLoading(true)}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!profileData) {
    
    return (
      <SafeAreaView style={styles.container}>
        <ProfileScreenHeader navigation={navigation} />
        <View style={styles.centeredContainer}>
          <Text style={styles.errorText}>No profile data found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.primary} />
      <ProfileScreenHeader navigation={navigation} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        {/* Profile Header Card */}
        <LinearGradient
          colors={THEME.primaryGradient}
          style={styles.profileHeaderCard}>
          <View style={styles.avatar}>
            <Icon name="profile" size={32} color={THEME.primary} />
          </View>
          <Text style={styles.profileName}>{profileData.name}</Text>
          <Text style={styles.profileContact}>
            {profileData.contact_number}
          </Text>
          <View style={styles.profileTypeBadge}>
            <Text style={styles.profileTypeText}>
              {profileData.user_type?.title || 'Vendor'}
            </Text>
          </View>
        </LinearGradient>

        {/* Personal Details */}
        <InfoSection title="Personal Details" iconName="profile">
          <InfoRow label="Email" value={profileData.email} />
          <InfoRow label="Gender" value={profileData.gender} />
          <InfoRow
            label="Date of Birth"
            value={formatDate(profileData.dob)}
          />
          <InfoRow
            label="Emergency Contact"
            value={profileData.emergency_contact}
          />
        </InfoSection>

        {/* Address Details */}
        <InfoSection title="Address" iconName="address">
          <InfoRow label="City" value={profileData.city} />
          <InfoRow label="State" value={profileData.state} />
          <InfoRow label="Pincode" value={profileData.pincode} />
          <InfoRow
            label="Full Address"
            value={profileData.full_address}
          />
        </InfoSection>

        {/* Vehicle Details */}
        <InfoSection title="Vehicle Details" iconName="vehicle">
          <InfoRow
            label="Category"
            value={profileData.vehicle_category?.category_name}
          />
          <InfoRow
            label="Model"
            value={profileData.vehicle_model?.model_name}
          />
          <InfoRow
            label="Type"
            value={profileData.vehicle_model?.vehicle_type_desc}
          />
          <InfoRow
            label="Capacity"
            value={`${profileData.vehicle_model?.carry_capacity_tons} Tons`}
          />
        </InfoSection>

        {/* Bank Details */}
        <InfoSection title="Bank Details" iconName="bank">
          <InfoRow label="Bank Name" value={profileData.bank_name} />
          <InfoRow
            label="Account Number"
            value={profileData.account_number}
          />
          <InfoRow label="IFSC Code" value={profileData.ifsc} />
        </InfoSection>

        {/* Document Details */}
        <InfoSection title="Documents" iconName="document">
          <DocumentRow
            label="Aadhar Card"
            number={profileData.aadhar_number}
            verified={null} 
            imageUrl={profileData.documents?.aadhar_front}
          />
          <DocumentRow
            label="PAN Card"
            number={profileData.pan_number}
            verified={null} 
            imageUrl={profileData.documents?.pan_image}
          />
          <DocumentRow
            label="Driving License (DL)"
            number={profileData.dl_number}
            verified={profileData.dl_verified}
            imageUrl={profileData.documents?.dl_image}
          />
          <DocumentRow
            label="Registration (RC)"
            number={profileData.rc_number}
            verified={profileData.rc_verified}
            imageUrl={profileData.documents?.rc_image}
          />
        </InfoSection>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.surface,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: THEME.textSecondary,
  },
  errorText: {
    fontSize: 16,
    color: THEME.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryText: {
    fontSize: 16,
    color: THEME.primary,
    fontWeight: '600',
  },
  header: {
    backgroundColor: THEME.primary,
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  profileHeaderCard: {
    margin: 16,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: THEME.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: THEME.textOnPrimary,
    marginBottom: 4,
  },
  profileContact: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 16,
  },
  profileTypeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  profileTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.textOnPrimary,
    textTransform: 'uppercase',
  },
  infoSection: {
    backgroundColor: THEME.surfaceElevated,
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.borderLight,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.textPrimary,
    marginLeft: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.borderLight,
  },
  infoLabel: {
    fontSize: 14,
    color: THEME.textSecondary,
  },
  infoValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, 
    justifyContent: 'flex-end',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME.textPrimary,
    textAlign: 'right',
    marginLeft: 16, 
  },
  verifiedIcon: {
    marginLeft: 8,
    fontSize: 16,
  },
  docRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.borderLight,
  },
  docInfo: {
    flex: 1,
  },

});

export default ProfileScreen;