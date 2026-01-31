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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RazorpayCheckout from 'react-native-razorpay';
import { THEME } from '../../themes/colors';
import { API_URL } from '../../config/config';
import { TEST_API_URL } from '../../config/config';
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

  const userRole = route.params?.userRole || 'driver';
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const backgroundAnim = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.9)).current;
  const headerSlide = useRef(new Animated.Value(-50)).current;

  const fetchPlans = async () => {
    console.log('═══════════════════════════════════════');
    console.log('🔵 [FETCH PLANS] Starting...');
    console.log('═══════════════════════════════════════');
    console.log('📍 Endpoint:', `${API_URL}/api/vendor-plans/`);
    console.log('🕒 Timestamp:', new Date().toISOString());

    setIsLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/vendor-plans/`);

      console.log('✅ [FETCH PLANS] Response received');
      console.log('📦 Response data:', JSON.stringify(data, null, 2));

      if (data?.success) {
        const plansArray = data.data.plans;
        console.log('📊 Plans count:', plansArray?.length || 0);

        if (Array.isArray(plansArray)) {
          setPlans(plansArray);
          console.log('✅ Plans set successfully');

          const popularPlan = plansArray.find(p => p.is_popular);
          if (popularPlan) {
            setSelectedPlanId(popularPlan.id);
            console.log('⭐ Popular plan auto-selected:', {
              id: popularPlan.id,
              name: popularPlan.name,
              price: popularPlan.price,
            });
          }
        } else {
          setPlans([]);
          console.warn('⚠️ Plans array is not valid');
        }
      } else {
        console.error('❌ API returned success: false');
      }
    } catch (error) {
      console.error('═══════════════════════════════════════');
      console.error('❌ [FETCH PLANS ERROR]');
      console.error('═══════════════════════════════════════');
      console.error('Error message:', error.message);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Full error:', JSON.stringify(error, null, 2));

      Alert.alert('Error', 'Failed to load plans. Please try again.');
    } finally {
      setIsLoading(false);
      console.log('🔵 [FETCH PLANS] Completed\n');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      console.log('\n═══════════════════════════════════════');
      console.log('🚀 [INITIALIZATION] Starting...');
      console.log('═══════════════════════════════════════');

      try {
        const token = await AsyncStorage.getItem('@user_token');
        console.log(
          '🔑 Token retrieved:',
          token ? `${token.substring(0, 20)}...` : 'NULL',
        );

        if (token) {
          setAccessToken(token);
          console.log('✅ Access token set successfully');
        } else {
          console.error('❌ No access token found in storage');
          Alert.alert(
            'Authentication Error',
            'Your session is invalid. Please log in again.',
            [{ text: 'OK', onPress: () => navigation.navigate('Login') }],
          );
          return;
        }

        await fetchPlans();
      } catch (error) {
        console.error('❌ [INITIALIZATION ERROR]:', error);
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
    console.log('═══════════════════════════════════════');
    console.log('👆 [PLAN SELECTION]');
    console.log('═══════════════════════════════════════');
    console.log('📌 Selected Plan ID:', planId);
    console.log('📌 Previous Plan ID:', selectedPlanId);
    console.log('🕒 Timestamp:', new Date().toISOString());

    setSelectedPlanId(planId);

    const selectedPlan = plans.find(p => p.id === planId);
    if (selectedPlan) {
      console.log('📋 Plan Details:', {
        id: selectedPlan.id,
        name: selectedPlan.name,
        price: selectedPlan.price,
        duration: selectedPlan.duration_type,
        is_popular: selectedPlan.is_popular,
      });
    }
    console.log('\n');
  };

  // ✅ VERIFY PAYMENT WITH BACKEND
  const verifyPaymentOnServer = async (paymentData, subscriptionId) => {
    console.log('\n═══════════════════════════════════════');
    console.log('🔐 [PAYMENT VERIFICATION] Starting...');
    console.log('═══════════════════════════════════════');
    console.log(
      '📍 Endpoint:',
      `${TEST_API_URL}/api/vendor-plans/verify-payment`,
    );
    console.log('🕒 Timestamp:', new Date().toISOString());
    console.log('📦 Payment Data Received:');
    console.log('   - razorpay_payment_id:', paymentData.razorpay_payment_id);
    console.log(
      '   - razorpay_subscription_id:',
      paymentData.razorpay_subscription_id,
    );
    console.log('   - razorpay_signature:', paymentData.razorpay_signature);
    console.log('   - subscription_id:', subscriptionId);
    console.log(
      '🔑 Using Token:',
      accessToken ? `${accessToken.substring(0, 20)}...` : 'NULL',
    );

    try {
      const requestPayload = {
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_subscription_id: paymentData.razorpay_subscription_id,
        razorpay_signature: paymentData.razorpay_signature,
        subscription_id: subscriptionId,
      };

      console.log('📤 Sending verification request...');
      console.log(
        '📦 Request Payload:',
        JSON.stringify(requestPayload, null, 2),
      );

      const response = await axios.post(
        `${TEST_API_URL}/api/vendor-plans/verify-payment`,
        requestPayload,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      console.log('═══════════════════════════════════════');
      console.log('✅ [VERIFICATION RESPONSE]');
      console.log('═══════════════════════════════════════');
      console.log('📥 Status:', response.status);
      console.log('📥 Response:', JSON.stringify(response.data, null, 2));

      if (response.data.success) {
        console.log('🎉 Payment verification successful!');
        console.log('✅ Subscription is now ACTIVE');

        Alert.alert(
          'Payment Successful! 🎉',
          'Your subscription is now active.',
          [
            {
              text: 'Continue',
              onPress: () => {
                console.log('🚀 Navigating to ListVehicle screen...');
                navigation.navigate('ListVehicle', {
                  accessToken: accessToken,
                });
              },
            },
          ],
        );
      } else {
        throw new Error(
          response.data.message || 'Payment verification failed.',
        );
      }
    } catch (err) {
      console.error('═══════════════════════════════════════');
      console.error('❌ [PAYMENT VERIFICATION ERROR]');
      console.error('═══════════════════════════════════════');
      console.error('Error Message:', err.message);
      console.error('Response Status:', err.response?.status);
      console.error(
        'Response Data:',
        JSON.stringify(err.response?.data, null, 2),
      );
      console.error('Full Error:', JSON.stringify(err, null, 2));

      Alert.alert(
        'Verification Failed',
        err.response?.data?.message ||
          err.message ||
          'Unable to verify payment. Please contact support.',
      );
    }
    console.log('🔐 [PAYMENT VERIFICATION] Completed\n');
  };

  // ✅ SUBSCRIBE TO PLAN WITH RAZORPAY CHECKOUT
  const subscribeToPlan = async planId => {
    const planToSubscribe = planId || selectedPlanId;

    console.log('\n═══════════════════════════════════════');
    console.log('💳 [SUBSCRIPTION PROCESS] Starting...');
    console.log('═══════════════════════════════════════');
    console.log('📌 Plan ID to subscribe:', planToSubscribe);
    console.log('🕒 Timestamp:', new Date().toISOString());

    if (!planToSubscribe) {
      console.error('❌ No plan selected');
      Alert.alert(
        'No Plan Selected',
        'Please choose a subscription plan to continue.',
      );
      return;
    }

    if (!accessToken) {
      console.error('❌ No access token available');
      Alert.alert(
        'Authentication Error',
        'Your session has expired. Please log in again.',
      );
      return;
    }

    const selectedPlan = plans.find(p => p.id === planToSubscribe);
    if (selectedPlan) {
      console.log('📋 Subscribing to Plan:', {
        id: selectedPlan.id,
        name: selectedPlan.name,
        price: selectedPlan.price,
        duration: selectedPlan.duration_type,
      });
    }

    console.log('🔄 Setting subscription state to LOADING...');
    setIsSubscribing(true);
    setSelectedPlanId(planToSubscribe);

    try {
      console.log('\n─────────────────────────────────────');
      console.log('📡 [STEP 1] Calling Backend Subscribe API');
      console.log('─────────────────────────────────────');
      console.log('📍 Endpoint:', `${TEST_API_URL}/api/vendor-plans/subscribe`);
      console.log('📦 Request Body:', { vendor_plan_id: planToSubscribe });
      console.log(
        '🔑 Authorization:',
        accessToken ? `Bearer ${accessToken.substring(0, 20)}...` : 'NULL',
      );

      const response = await axios.post(
        `${TEST_API_URL}/api/vendor-plans/subscribe`,
        { vendor_plan_id: planToSubscribe },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      console.log('═══════════════════════════════════════');
      console.log('✅ [SUBSCRIBE API RESPONSE]');
      console.log('═══════════════════════════════════════');
      console.log('📥 Status Code:', response.status);
      console.log('📥 Response Data:', JSON.stringify(response.data, null, 2));

      if (response.data.success) {
        const data = response.data.data;

        const razorpay_key = data.razorpay_key;
        const razorpay_subscription_id = data.razorpay_subscription_id;
        const local_subscription_id = data.subscription_id;
        const amount_paise = (data.first_payment_amount || 0) * 100;
        const plan_display_name = data.plan?.name || 'Basic Plan';
        const customer = data.customer;

        console.log('\n─────────────────────────────────────');
        console.log('📊 [EXTRACTED DATA]');
        console.log('─────────────────────────────────────');
        console.log(
          '🔑 Razorpay Key:',
          razorpay_key ? `${razorpay_key.substring(0, 15)}...` : 'NULL',
        );
        console.log('🆔 Razorpay Subscription ID:', razorpay_subscription_id);
        console.log('💰 Amount (paise):', amount_paise);
        console.log('📋 Plan Name:', plan_display_name);
        console.log('🆔 Local Subscription ID:', local_subscription_id);
        console.log('👤 Customer Info:', {
          name: customer?.name,
          email: customer?.email,
          contact: customer?.contact,
        });

        // Handle free plans (no Razorpay payment needed)
        if (!razorpay_key || !razorpay_subscription_id) {
          console.log('\n─────────────────────────────────────');
          console.log('🆓 [FREE PLAN DETECTED]');
          console.log('─────────────────────────────────────');
          console.log('✅ No payment required');
          console.log('✅ Subscription activated immediately');

          Alert.alert('Subscription Successful!', 'Your plan is now active.', [
            {
              text: 'Continue',
              onPress: () => {
                console.log('🚀 Navigating to ListVehicle...');
                navigation.navigate('ListVehicle', {
                  accessToken: accessToken,
                });
              },
            },
          ]);
          setIsSubscribing(false);
          return;
        }

        console.log('\n─────────────────────────────────────');
        console.log('📡 [STEP 2] Preparing Razorpay Checkout');
        console.log('─────────────────────────────────────');

        const options = {
          description: plan_display_name || 'Vendor Subscription',
          currency: 'INR',
          key: razorpay_key,
          subscription_id: razorpay_subscription_id,
          amount: amount_paise,
          name: 'Digit Transway Driver',
          prefill: {
            email: customer.email,
            contact: customer.contact,
            name: customer.name,
          },
          theme: { color: THEME.primary || '#4A6CFF' },
        };

        console.log('🎨 Razorpay Options:', {
          description: options.description,
          currency: options.currency,
          key: options.key ? `${options.key.substring(0, 15)}...` : 'NULL',
          subscription_id: options.subscription_id,
          amount: options.amount,
          name: options.name,
          prefill: options.prefill,
          theme: options.theme,
        });

        console.log('\n─────────────────────────────────────');
        console.log('📡 [STEP 3] Opening Razorpay Checkout...');
        console.log('─────────────────────────────────────');
        console.log('🕒 Opening at:', new Date().toISOString());

        // Step 3: Open Razorpay Checkout
        RazorpayCheckout.open(options)
          .then(async data => {
            console.log('\n═══════════════════════════════════════');
            console.log('✅ [RAZORPAY SUCCESS]');
            console.log('═══════════════════════════════════════');
            console.log('🎉 Payment completed successfully!');
            console.log('📦 Razorpay Response:', JSON.stringify(data, null, 2));
            console.log('📋 Payment Details:');
            console.log('   - Payment ID:', data.razorpay_payment_id);
            console.log('   - Subscription ID:', data.razorpay_subscription_id);
            console.log('   - Signature:', data.razorpay_signature);
            console.log('🕒 Success Timestamp:', new Date().toISOString());

            console.log('\n─────────────────────────────────────');
            console.log('📡 [STEP 4] Verifying Payment on Server...');
            console.log('─────────────────────────────────────');

            await verifyPaymentOnServer(data, local_subscription_id);

            console.log('🔄 Setting subscription state to IDLE...');
            setIsSubscribing(false);
            console.log('✅ [PAYMENT PROCESS] Completed Successfully!\n');
          })
          .catch(error => {
            console.error('\n═══════════════════════════════════════');
            console.error('❌ [RAZORPAY ERROR]');
            console.error('═══════════════════════════════════════');
            console.error('Error Code:', error.code);
            console.error('Error Description:', error.description);
            console.error('Full Error:', JSON.stringify(error, null, 2));
            console.error('🕒 Error Timestamp:', new Date().toISOString());

            setIsSubscribing(false);
            console.log('🔄 Subscription state reset to IDLE');

            if (error.code === 0) {
              console.warn('⚠️ Payment cancelled by user');
              Alert.alert('Payment Cancelled', 'You cancelled the payment.');
            } else if (error.code === 1) {
              console.error('❌ Payment failed');
              Alert.alert(
                'Payment Failed',
                error.description ||
                  'Payment could not be processed. Please try again.',
              );
            } else {
              console.error('❌ Unknown error');
              Alert.alert(
                'Payment Error',
                error.description || 'An unexpected error occurred.',
              );
            }
            console.error('❌ [PAYMENT PROCESS] Failed\n');
          });
      } else {
        throw new Error(response.data.message || 'Subscription failed.');
      }
    } catch (err) {
      console.error('\n═══════════════════════════════════════');
      console.error('❌ [SUBSCRIPTION ERROR]');
      console.error('═══════════════════════════════════════');
      console.error('Error Type:', err.name);
      console.error('Error Message:', err.message);
      console.error('Response Status:', err.response?.status);
      console.error(
        'Response Data:',
        JSON.stringify(err.response?.data, null, 2),
      );
      console.error('Request URL:', err.config?.url);
      console.error('Request Method:', err.config?.method);
      console.error(
        'Full Error:',
        JSON.stringify(err, Object.getOwnPropertyNames(err), 2),
      );
      console.error('🕒 Error Timestamp:', new Date().toISOString());

      const msg =
        err.response?.data?.message || err.message || 'An error occurred.';

      console.error('📢 Showing error alert to user:', msg);
      Alert.alert('Subscription Error', msg);

      setIsSubscribing(false);
      console.log('🔄 Subscription state reset to IDLE');
      console.error('❌ [SUBSCRIPTION PROCESS] Failed\n');
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
              onPress={() => {
                console.log('🖱️ Subscribe button clicked for plan:', plan.id);
                subscribeToPlan(plan.id);
              }}
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
                  {isSelected ? 'Subscribe Now' : plan.button_text}
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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
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

// Styles remain the same as your original code
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
    paddingTop: 40,
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
  disabledButton: {
    opacity: 0.6,
  },
});

export default SubscriptionScreen;
