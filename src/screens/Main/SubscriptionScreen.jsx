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
  SafeAreaView,
  Linking,
} from 'react-native';
import { THEME } from '../../themes/colors';
import { API_URL } from '../../config/config';
import axios from 'axios';

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
    const token = route.params?.accessToken;
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

    fetchPlans();
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

  // --- MODIFIED: Bypassed payment and now navigates directly to Dashboard ---
  const subscribeToPlan = async () => {
    if (!selectedPlanId) {
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
      `Bypassing payment for plan ID: ${selectedPlanId}. Navigating to Dashboard.`,
    );
    // Pass the access token to the Dashboard to maintain the session
    navigation.navigate('ListVehicle', { accessToken: accessToken });
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
              ]}
              onPress={subscribeToPlan}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.choosePlanButtonText,
                  {
                    color: isSelected ? THEME.textOnPrimary : plan.button_color,
                  },
                ]}
              >
                {isSelected ? 'Continue to Dashboard' : plan.button_text}
                {isSelected && <Text style={styles.arrowIcon}> →</Text>}
              </Text>
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

            <Animated.View
              style={[
                styles.footerContainer,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
              ]}
            >
              {/* --- MODIFIED: This button also navigates to the Dashboard --- */}
              <TouchableOpacity
                style={styles.skipButton}
                onPress={() =>
                  navigation.navigate('Dashboard', { accessToken: accessToken })
                }
                activeOpacity={0.8}
              >
                <Text style={styles.skipButtonText}>
                  Continue with Free Plan
                </Text>
                <Text style={styles.skipSubtext}>You can upgrade anytime</Text>
              </TouchableOpacity>
            </Animated.View>
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
});

export default SubscriptionScreen;
