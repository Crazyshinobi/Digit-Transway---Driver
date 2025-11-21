import React from 'react';
import {
  View,
  Animated,
  Platform,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { WebView } from 'react-native-webview';
import RegistrationHeader from '../../components/common/RegistrationHeader';
import { THEME } from '../../themes/colors';
import { useRegistrationContext } from '../../context/RegistrationContext';

const RegisterScreen = () => {
  const {
    step,
    isLoading,
    isAadhaarLoading,
    verificationUrl,
    setVerificationUrl,
    fadeAnim,
    slideAnim,
    progressAnim,
    handleWebViewNavigation,
    handleNext,
    handleBack,
    getStepInfo,
    getTotalSteps,
    renderCurrentStep,
    getButtonText,
    isButtonDisabled,   
    keyboardVerticalOffset,
  } = useRegistrationContext();

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
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={THEME.primaryDark}
        translucent={false}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={keyboardVerticalOffset}
      >
        <RegistrationHeader
          onBack={handleBack}
          title={getStepInfo().title}
          subtitle={getStepInfo().subtitle}
          step={step}
          totalSteps={getTotalSteps()}
        />
        <View style={styles.progressContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {renderCurrentStep()}
          </Animated.View>
        </ScrollView>
        <View style={styles.bottomContainer}>
          <TouchableOpacity onPress={handleNext} disabled={isButtonDisabled()}>
            <LinearGradient
              colors={
                isButtonDisabled()
                  ? ['#BDBDBD', '#BDBDBD']
                  : [THEME.primary, THEME.primaryDark]
              }
              style={styles.nextButton}
            >
              {isLoading || isAadhaarLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.buttonText}>{getButtonText()}</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  progressContainer: {
    height: 4,
    backgroundColor: THEME.borderLight,
  },
  progressBar: {
    height: '100%',
    backgroundColor: THEME.primary,
  },
  scrollView: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  bottomContainer: {
    padding: 20,
    backgroundColor: THEME.background,
    borderTopWidth: 1,
    borderTopColor: THEME.borderLight,
  },
  nextButton: {
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: THEME.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: THEME.textOnPrimary,
    fontSize: 15,
    fontWeight: '700',
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
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
});

export default RegisterScreen;
