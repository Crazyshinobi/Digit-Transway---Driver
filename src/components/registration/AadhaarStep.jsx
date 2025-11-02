import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { THEME } from '../../themes/colors'; 

const Icon = ({ name, size = 60, color = THEME.textSecondary, style }) => {
  const getIcon = () => {
    switch (name) {
      case 'shield':
        return '🛡️'; // Or use react-native-vector-icons if preferred
      default:
        return '';
    }
  };
  return <Text style={[{ fontSize: size, color }, style]}>{getIcon()}</Text>;
};

const AadhaarStep = ({ isVerified, onVerifyPress, isLoading }) => {
  return (
    <View style={styles.card}>
      {/* Status Container (Optional, could simplify) */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Verification Status:</Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: isVerified
                ? `${THEME.success}1A`
                : `${THEME.warning}1A`,
            },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isVerified ? THEME.success : THEME.warning },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              { color: isVerified ? THEME.success : THEME.warning },
            ]}
          >
            {isVerified ? 'Verified' : 'Not Verified'}
          </Text>
        </View>
      </View>

      <Icon name="shield" style={styles.shieldIcon} />
      <Text style={styles.cardTitle}>Verify with Aadhaar</Text>
      <Text style={styles.cardSubtitle}>
        Complete your KYC process securely using DigiLocker. This is required to
        proceed.
      </Text>
      <TouchableOpacity
        style={[
          styles.verifyButton,
          (isLoading || isVerified) && styles.disabledButton,
        ]}
        onPress={onVerifyPress}
        disabled={isLoading || isVerified}
      >
        {isLoading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.verifyButtonText}>
            {isVerified ? 'Aadhaar Verified' : 'Verify Now'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

// Styles adapted from VerificationScreen and adjusted
const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginTop: 20, // Add some top margin
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start', // Position top-left
    marginBottom: 24,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textSecondary,
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  shieldIcon: {
    marginBottom: 16,
    color: THEME.primary, // Make icon primary color
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: THEME.textPrimary,
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 15,
    color: THEME.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  verifyButton: {
    backgroundColor: THEME.primary,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: THEME.grey, // Use a grey color for disabled state
    opacity: 0.7,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AadhaarStep;
