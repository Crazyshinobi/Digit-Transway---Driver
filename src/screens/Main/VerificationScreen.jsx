import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { THEME } from '../../themes/colors';
import { API_URL } from '../../config/config';
import axios from 'axios';

const Icon = ({ name, size = 24, color, style }) => {
  const getIcon = () => {
    switch (name) {
      case 'back':
        return '←';
      case 'shield':
        return '🛡️';
      default:
        return '';
    }
  };
  return <Text style={[{ fontSize: size, color }, style]}>{getIcon()}</Text>;
};

const VerificationScreen = ({ navigation, route }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [verificationUrl, setVerificationUrl] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  // This would typically be fetched from your user profile API
  const [isVerified, setIsVerified] = useState(false);

  const AADHAAR_CALLBACK_URL = 'http://digittransway.com/aadhaar-callback';

  useEffect(() => {
    const token = route.params?.accessToken;
    if (token) {
      setAccessToken(token);
      // In a real app, you would fetch the user's verification status here
      // e.g., fetchVerificationStatus(token);
    } else {
      Alert.alert('Authentication Error', 'Your session is invalid.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    }
  }, [route.params]);

  const handleInitializeAadhaar = async () => {
    if (!accessToken) {
      Alert.alert('Error', 'Authentication token not found.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/api/vendor/auth/aadhaar/initialize`,
        { redirect_url: AADHAAR_CALLBACK_URL },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      if (response.data?.success && response.data.data?.url) {
        setVerificationUrl(response.data.data.url);
      } else {
        Alert.alert(
          'Error',
          'Could not initialize Aadhaar verification. Please try again.',
        );
      }
    } catch (error) {
      console.error(
        'Aadhaar init error:',
        error.response?.data || error.message,
      );
      Alert.alert(
        'Error',
        'An error occurred while starting the verification process.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleWebViewNavigation = navState => {
    const { url } = navState;
    if (url.startsWith(AADHAAR_CALLBACK_URL)) {
      setVerificationUrl(null); // Close the WebView

      // The URL will have query params like ?status=success
      const urlParams = new URLSearchParams(url.split('?')[1]);
      if (urlParams.get('status') === 'success') {
        setIsVerified(true);
        Alert.alert(
          'Verification Successful!',
          'Your Aadhaar has been successfully verified.',
        );
      } else {
        Alert.alert(
          'Verification Failed',
          'Aadhaar verification was not successful. Please try again.',
        );
      }
    }
  };

  if (verificationUrl) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.webviewHeader}>
          <TouchableOpacity onPress={() => setVerificationUrl(null)}>
            <Text style={styles.webviewHeaderButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.webviewHeaderText}>Aadhaar Verification</Text>
          <View style={{ width: 60 }} />
        </View>
        <WebView
          source={{ uri: verificationUrl }}
          onNavigationStateChange={handleWebViewNavigation}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={THEME.primary} />
            </View>
          )}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.background} />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="back" size={24} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile Verification</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
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
                  {
                    backgroundColor: isVerified ? THEME.success : THEME.warning,
                  },
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
          <Icon name="shield" size={60} style={styles.shieldIcon} />
          <Text style={styles.cardTitle}>Verify with Aadhaar</Text>
          <Text style={styles.cardSubtitle}>
            Complete your KYC process securely using DigiLocker to unlock full
            account features.
          </Text>
          <TouchableOpacity
            style={styles.verifyButton}
            onPress={handleInitializeAadhaar}
            disabled={isLoading || isVerified}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.verifyButtonText}>
                {isVerified ? 'Verification Complete' : 'Verify Now'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: THEME.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.borderLight,
  },
  backButton: { padding: 8 },
  backIcon: { fontWeight: 'bold', color: THEME.textPrimary },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: THEME.textPrimary },
  headerPlaceholder: { width: 40 },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
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
    paddingHorizontal: 40,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  webviewHeader: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: THEME.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.borderLight,
  },
  webviewHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.textPrimary,
  },
  webviewHeaderButton: {
    fontSize: 16,
    color: THEME.primary,
    fontWeight: '500',
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.background,
  },
});

export default VerificationScreen;
