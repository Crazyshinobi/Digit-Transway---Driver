import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { THEME } from '../../themes/colors';
import { useRegistrationContext } from '../../context/RegistrationContext';

const Icon = ({ size = 60, color = THEME.textSecondary, style }) => {
  return <Text style={[{ fontSize: size, color }, style]}>🛡️</Text>;
};

const AadhaarStep = () => {
  const {
    isVerified,
    handleInitializeAadhaar: onVerifyPress,
    isAadhaarLoading: isLoading,
  } = useRegistrationContext();

  const isButtonDisabled = isLoading || isVerified;

  return (
    <View style={styles.container}>
      {/* Information Text (Replaced Manual Info) */}
      <Text style={styles.autoVerifyInfoText}>
        To proceed with registration, please complete your mandatory KYC using
        Aadhaar's secure auto-verification service powered by DigiLocker.
      </Text>

      {/* Verification Card (Always active) */}
      <View style={styles.card}>
        {/* Status Container */}
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
              {isVerified ? 'Verified' : 'Required'}
            </Text>
          </View>
        </View>

        <Icon style={styles.shieldIcon} />

        <Text style={styles.cardTitle}>Auto-Verify with Aadhaar</Text>

        <Text style={styles.cardSubtitle}>
          This process securely fetches your details from DigiLocker and
          auto-fills your profile.
        </Text>

        <TouchableOpacity
          style={[
            styles.verifyButton,
            isButtonDisabled && styles.disabledButton,
          ]}
          onPress={onVerifyPress}
          disabled={isButtonDisabled}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.verifyButtonText}>
              {isVerified ? 'Aadhaar Verified' : 'Start Verification'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 10,
  },
  autoVerifyInfoText: {
    textAlign: 'center',
    fontSize: 15,
    color: THEME.textSecondary,
    marginBottom: 20,
    fontWeight: '500',
    paddingHorizontal: 10,
    lineHeight: 22,
  },
  card: {
    backgroundColor: THEME.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: THEME.shadowLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: THEME.borderLight,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
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
    color: THEME.primary,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: THEME.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
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
    paddingVertical: 16,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: THEME.grey,
    opacity: 0.7,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default AadhaarStep;