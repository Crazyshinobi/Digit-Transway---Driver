import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  Animated,
  Platform,
  StatusBar,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { THEME } from '../../themes/colors';
import { API_URL } from '../../config/config';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const getPlanIcon = (planName = '') => {
  const name = planName.toLowerCase();
  if (name.includes('pro')) return '⭐';
  if (name.includes('premium')) return '👑';
  return '🚀';
};

const SubscriptionScreen = ({ navigation, route }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [paymentWebViewUrl, setPaymentWebViewUrl] = useState(null);

  const userRole = route.params?.userRole || 'driver';
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const backgroundAnim = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.9)).current;
  const headerSlide = useRef(new Animated.Value(-50)).current;

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/vendor-plans/`);
      if (data?.success) {
        const plansArray = data.data.plans;
        if (Array.isArray(plansArray)) {
          setPlans(plansArray);
          const popularPlan = plansArray.find(p => p.is_popular);
          if (popularPlan) {
            setSelectedPlanId(popularPlan.id);
          }
        } else {
          setPlans([]);
        }
      }
    } catch (error) {
      console.error('Error in fetching plans:', error.message || error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('@user_token');
        if (token) {
          setAccessToken(token);
        } else {
          console.error('Authentication Error: No access token provided.');
          Alert.alert(
            'Authentication Error',
            'Your session is invalid. Please log in again.',
            [{ text: 'OK', onPress: () => navigation.navigate('Login') }],
          );
        }

        await fetchPlans();
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchData();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(headerSlide, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(backgroundAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  const handlePlanSelection = planId => {
    setSelectedPlanId(planId);
  };

  // FIXED: Now accepts planId parameter
  const subscribeToPlan = async planId => {
    const planToSubscribe = planId || selectedPlanId;

    if (!planToSubscribe) {
      Alert.alert(
        'No Plan Selected',
        'Please choose a subscription plan to continue.',
      );
      return;
    }
    if (!accessToken) {
      Alert.alert(
        'Authentication Error',
        'Your session has expired. Please log in again.',
      );
      return;
    }

    console.log(
      `Subscribing to plan ID: ${planToSubscribe} with token: ${accessToken}`,
    );
    setIsSubscribing(true);
    setSelectedPlanId(planToSubscribe); // Update selected plan

    try {
      const response = await axios.post(
        `${API_URL}/api/vendor-plans/subscribe`,
        { vendor_plan_id: planToSubscribe },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      if (response.data.success) {
        const paymentUrl = response.data.data?.payment_url;

        if (paymentUrl) {
          console.log('Payment URL found, opening WebView:', paymentUrl);
          setPaymentWebViewUrl(paymentUrl);
        } else {
          console.log('Subscription successful, no payment URL.');
          Alert.alert(
            'Subscription Successful!',
            'Your plan has been updated.',
          );
          navigation.navigate('ListVehicle', { accessToken: accessToken });
        }
      } else {
        throw new Error(response.data.message || 'Subscription failed.');
      }
    } catch (err) {
      console.error('[Subscription Error]', err);
      const msg =
        err.response?.data?.message || err.message || 'An error occurred.';
      Alert.alert('Subscription Error', msg);
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleWebViewNavigation = navState => {
    const { url } = navState;
    console.log('WebView URL Changed:', url);

    // Update these URLs to match your backend's redirect URLs
    if (url.includes('/payment-success')) {
      setPaymentWebViewUrl(null);
      Alert.alert(
        'Payment Successful!',
        'Your subscription is active. Redirecting...',
      );
      navigation.navigate('ListVehicle', { accessToken: accessToken });
    } else if (url.includes('/payment-failed')) {
      setPaymentWebViewUrl(null);
      Alert.alert(
        'Payment Failed',
        'Your payment was not successful. Please try again.',
      );
    }
  };

  const PlanCard = ({ plan, index }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const cardFadeAnim = useRef(new Animated.Value(0)).current;
    const isSelected = selectedPlanId === plan.id;

    useEffect(() => {
      Animated.timing(cardFadeAnim, {
        toValue: 1,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    }, []);

    useEffect(() => {
      Animated.spring(scaleAnim, {
        toValue: isSelected ? 1.02 : 1,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }).start();
    }, [isSelected]);

    return (
      <Animated.View
        style={[
          styles.cardWrapper,
          { opacity: cardFadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <TouchableOpacity
          onPress={() => handlePlanSelection(plan.id)}
          activeOpacity={0.8}
        >
          <View style={[styles.planCard, isSelected && styles.selectedPlan]}>
            {plan.is_popular && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Most Popular</Text>
              </View>
            )}
            <View style={styles.cardHeader}>
              <View style={styles.planTitleContainer}>
                <Text style={styles.planIcon}>{getPlanIcon(plan.name)}</Text>
                <View>
                  <Text style={styles.planTitle}>{plan.name}</Text>
                  <Text style={styles.planSubtitle}>{plan.description}</Text>
                </View>
              </View>
            </View>
            <View style={styles.priceSection}>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>₹{parseInt(plan.price, 10)}</Text>
                <View>
                  <Text style={styles.duration}>/{plan.duration_type}</Text>
                </View>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>What's included:</Text>
              {plan.features.map((feature, idx) => (
                <View key={idx} style={styles.featureRow}>
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            {/* FIXED: Button now passes plan.id to subscribeToPlan */}
            <TouchableOpacity
              style={[
                styles.choosePlanButton,
                {
                  backgroundColor: isSelected
                    ? plan.button_color
                    : THEME.surface,
                  borderColor: plan.button_color,
                },
                isSubscribing && styles.disabledButton,
              ]}
              onPress={() => subscribeToPlan(plan.id)}
              activeOpacity={0.8}
              disabled={isSubscribing}
            >
              {isSubscribing && selectedPlanId === plan.id ? (
                <ActivityIndicator
                  color={isSelected ? THEME.textOnPrimary : plan.button_color}
                />
              ) : (
                <Text
                  style={[
                    styles.choosePlanButtonText,
                    {
                      color: isSelected
                        ? THEME.textOnPrimary
                        : plan.button_color,
                    },
                  ]}
                >
                  {isSelected ? 'Continue to Dashboard' : plan.button_text}
                  {isSelected && <Text style={styles.arrowIcon}> →</Text>}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const animatedBackgroundColor = backgroundAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [THEME.primarySurface, THEME.surface],
  });

  // WebView render logic
  if (paymentWebViewUrl) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.webviewHeader}>
          <TouchableOpacity
            onPress={() => setPaymentWebViewUrl(null)}
            style={styles.closeButton}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
          <Text style={styles.webviewHeaderText}>Complete Payment</Text>
          <View style={{ width: 60 }} />
        </View>
        <WebView
          source={{ uri: paymentWebViewUrl }}
          onNavigationStateChange={handleWebViewNavigation}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={THEME.primary} />
            </View>
          )}
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={['*']}
        />
      </SafeAreaView>
    );
  }

  // Original screen render
  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View
        style={[styles.container, { backgroundColor: animatedBackgroundColor }]}
      >
        <StatusBar barStyle="dark-content" backgroundColor={THEME.surface} />
        <Animated.View
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: headerSlide }] },
          ]}
        >
          <View style={styles.headerContent}>
            <Text style={styles.welcomeText}>Step up your game! 🚀</Text>
            <Text style={styles.titleText}>Choose Your Plan</Text>
            <Text style={styles.subtitleText}>
              Unlock premium features and boost your productivity
            </Text>
          </View>
          <View style={styles.orbContainer}>
            <View style={[styles.orb, styles.orb1]} />
            <View style={[styles.orb, styles.orb2]} />
            <View style={[styles.orb, styles.orb3]} />
          </View>
        </Animated.View>

        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={THEME.primary} />
            <Text style={styles.loaderText}>Loading Plans...</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.plansContainer}>
              {plans.map((plan, index) => (
                <PlanCard key={plan.id} plan={plan} index={index} />
              ))}
            </View>
          </ScrollView>
        )}
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.surface,
  },
  container: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.surface,
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    color: THEME.textSecondary,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: 'center',
    backgroundColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
  },
  headerContent: {
    alignItems: 'center',
    zIndex: 2,
  },
  welcomeText: {
    fontSize: 14,
    color: THEME.textPrimary,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.3,
    paddingTop: 10,
  },
  titleText: {
    fontSize: 25,
    fontWeight: '800',
    color: THEME.primary,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.8,
  },
  subtitleText: {
    fontSize: 16,
    color: THEME.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '400',
    paddingHorizontal: 20,
  },
  orbContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  orb: {
    position: 'absolute',
    borderRadius: 100,
    opacity: 0.08,
  },
  orb1: {
    width: 100,
    height: 100,
    backgroundColor: THEME.primary,
    top: 10,
    right: -30,
  },
  orb2: {
    width: 60,
    height: 60,
    backgroundColor: THEME.secondary,
    bottom: 5,
    left: -15,
  },
  orb3: {
    width: 40,
    height: 40,
    backgroundColor: THEME.primary,
    top: 80,
    left: 40,
  },
  scrollContainer: {
    paddingTop:40,
    paddingBottom: 40,
  },
  plansContainer: {
    paddingHorizontal: 24,
  },
  cardWrapper: {
    marginBottom: 20,
  },
  planCard: {
    backgroundColor: THEME.background,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: THEME.border,
    shadowColor: THEME.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  selectedPlan: {
    borderColor: THEME.primary,
    borderWidth: 2,
    shadowColor: THEME.primary,
    shadowOpacity: 0.3,
  },
  badge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: THEME.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    zIndex: 1,
  },
  badgeText: {
    color: THEME.textOnPrimary,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  cardHeader: {
    marginBottom: 16,
  },
  planTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  planTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: THEME.textPrimary,
    marginBottom: 2,
  },
  planSubtitle: {
    fontSize: 14,
    color: THEME.textSecondary,
    fontWeight: '500',
  },
  priceSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: THEME.primary,
    marginRight: 4,
  },
  duration: {
    fontSize: 16,
    color: THEME.textSecondary,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: THEME.border,
    marginVertical: 16,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.textPrimary,
    marginBottom: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: THEME.primarySurface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkmarkText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: THEME.primary,
  },
  featureText: {
    fontSize: 15,
    color: THEME.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  choosePlanButton: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    borderWidth: 2,
  },
  choosePlanButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  arrowIcon: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  skipButton: {
    backgroundColor: THEME.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    marginTop: -10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.border,
  },
  skipButtonText: {
    fontSize: 16,
    color: THEME.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  skipSubtext: {
    fontSize: 13,
    color: THEME.placeholder,
    fontWeight: '400',
  },
  disabledButton: {
    opacity: 0.6,
  },
  webviewHeader: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: THEME.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  webviewHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.textPrimary,
  },
  closeButton: {
    padding: 8,
    minWidth: 60,
    alignItems: 'flex-start',
  },
  closeButtonText: {
    fontSize: 16,
    color: THEME.primary,
    fontWeight: '500',
  },
});

export default SubscriptionScreen;