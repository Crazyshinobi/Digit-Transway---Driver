import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  Dimensions,
  Animated,
  Easing,
  Platform,
  StatusBar,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Match the welcome screen's theme colors
const themeColor = '#4285f4';
const backgroundColor = '#f8f9fa'; // Same as welcome screen
const cardBackground = '#fff';
const textDark = '#1a1a1a';
const textGray = '#666';

const SubscriptionScreen = ({ navigation, route }) => {
  const [selectedPlan, setSelectedPlan] = useState('quarterly');
  const userRole = route.params?.userRole || 'driver';
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000, // Match welcome screen duration
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8, // Match welcome screen friction
        tension: 40, // Match welcome screen tension
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const plans = [
    {
      id: 'monthly',
      title: 'Starter',
      subtitle: 'Perfect for beginners',
      price: '₹249',
      originalPrice: '₹299',
      duration: '/month',
      features: [
        'Basic analytics dashboard',
        'Email support',
        'Real-time tracking',
        'Mobile app access',
        '5 team members',
      ],
      popular: false,
      savings: '',
      icon: '🚀',
    },
    {
      id: 'quarterly',
      title: 'Professional',
      subtitle: 'Most popular choice',
      price: '₹699',
      originalPrice: '₹897',
      duration: '/3 months',
      features: [
        'Advanced analytics',
        'Priority support 24/7',
        'Custom integrations',
        'Advanced reporting',
        'Unlimited team members',
        'API access',
      ],
      popular: true,
      badge: 'Most Popular',
      savings: 'Save 22%',
      icon: '⭐',
    },
    {
      id: 'halfyearly',
      title: 'Business',
      subtitle: 'For growing teams',
      price: '₹1199',
      originalPrice: '₹1794',
      duration: '/6 months',
      features: [
        'Everything in Professional',
        'Dedicated account manager',
        'Custom onboarding',
        'Advanced security',
        'White-label options',
        'SLA guarantee',
      ],
      popular: false,
      savings: 'Save 33%',
      icon: '💼',
    },
    {
      id: 'annual',
      title: 'Enterprise',
      subtitle: 'Maximum value',
      price: '₹1999',
      originalPrice: '₹3588',
      duration: '/year',
      features: [
        'Everything in Business',
        'Unlimited everything',
        'Custom development',
        'On-premise deployment',
        'Training & workshops',
        'Premium support',
      ],
      popular: false,
      badge: 'Best Value',
      savings: 'Save 44%',
      icon: '👑',
    },
  ];

  const handlePlanSelection = planId => {
    setSelectedPlan(planId);
  };

  const PlanCard = ({ plan, index }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const cardFadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(cardFadeAnim, {
        toValue: 1,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    }, []);

    useEffect(() => {
      if (selectedPlan === plan.id) {
        Animated.spring(scaleAnim, {
          toValue: 1.02,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }).start();
      }
    }, [selectedPlan, plan.id]);

    return (
      <Animated.View
        style={[
          styles.cardWrapper,
          {
            opacity: cardFadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => handlePlanSelection(plan.id)}
          activeOpacity={0.8} // Match welcome screen activeOpacity
        >
          <View
            style={[
              styles.planCard,
              selectedPlan === plan.id && styles.selectedPlan,
            ]}
          >
            {plan.badge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{plan.badge}</Text>
              </View>
            )}

            <View style={styles.cardHeader}>
              <View style={styles.planTitleContainer}>
                <Text style={styles.planIcon}>{plan.icon}</Text>
                <View>
                  <Text style={styles.planTitle}>{plan.title}</Text>
                  <Text style={styles.planSubtitle}>{plan.subtitle}</Text>
                </View>
              </View>
            </View>

            <View style={styles.priceSection}>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>{plan.price}</Text>
                <View>
                  <Text style={styles.duration}>{plan.duration}</Text>
                  {plan.originalPrice && (
                    <Text style={styles.originalPrice}>
                      {plan.originalPrice}
                    </Text>
                  )}
                </View>
              </View>

              {plan.savings && (
                <View style={styles.savingsBadge}>
                  <Text style={styles.savingsText}>{plan.savings}</Text>
                </View>
              )}
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
                selectedPlan === plan.id && styles.selectedPlanButton,
              ]}
              onPress={() => navigation.navigate('ListVehicle')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.choosePlanButtonText,
                  selectedPlan === plan.id && styles.selectedPlanButtonText,
                ]}
              >
                {selectedPlan === plan.id ? 'Selected' : `Choose ${plan.title}`}
                {selectedPlan === plan.id && <Text style={styles.arrowIcon}> →</Text>}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />

      {/* Header matching welcome screen style */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>
          Unlock premium features and boost your productivity
        </Text>
      </Animated.View>

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
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => navigation.navigate('ListVehicle')}
            activeOpacity={0.8}
          >
            <Text style={styles.skipButtonText}>Continue with Free Plan</Text>
            <Text style={styles.skipSubtext}>You can upgrade anytime</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: backgroundColor, // Match welcome screen
  },
  header: {
    paddingHorizontal: 24, // Match welcome screen padding
    paddingVertical: 40,
    alignItems: 'center',
    backgroundColor: backgroundColor, // Clean background like welcome
  },
  title: {
    fontSize: 30, // Match welcome screen title size
    fontWeight: 'bold',
    color: textDark, // Match welcome screen text color
    textAlign: 'center',
    marginBottom: 12,
    marginTop: 24
  },
  subtitle: {
    fontSize: 18, // Match welcome screen subtitle size
    color: textGray, // Match welcome screen text color
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  plansContainer: {
    paddingHorizontal: 24, // Match welcome screen padding
  },
  cardWrapper: {
    marginBottom: 20,
  },
  planCard: {
    backgroundColor: cardBackground,
    borderRadius: 16, // Match welcome screen button radius
    padding: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    // Match welcome screen shadow style
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  selectedPlan: {
    borderColor: themeColor,
    borderWidth: 2,
    shadowColor: themeColor,
    shadowOpacity: 0.3,
  },
  badge: {
    position: 'absolute',
    top: -1,
    right: -1,
    backgroundColor: themeColor,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    zIndex: 1,
  },
  badgeText: {
    color: '#fff',
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
    fontWeight: 'bold', // Match welcome screen font weight
    color: textDark,
    marginBottom: 2,
  },
  planSubtitle: {
    fontSize: 14,
    color: textGray,
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
    color: themeColor, // Consistent theme color
    marginRight: 8,
  },
  duration: {
    fontSize: 16,
    color: textGray,
    fontWeight: '500',
  },
  originalPrice: {
    fontSize: 13,
    color: '#999',
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  savingsBadge: {
    backgroundColor: `${themeColor}15`,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '600',
    color: themeColor,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: textDark,
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
    backgroundColor: `${themeColor}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkmarkText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: themeColor,
  },
  featureText: {
    fontSize: 15,
    color: textGray,
    flex: 1,
    lineHeight: 20,
  },
  choosePlanButton: {
    // Match welcome screen button style exactly
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: themeColor,
  },
  selectedPlanButton: {
    backgroundColor: themeColor, // Match welcome screen selected state
    shadowColor: themeColor,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  choosePlanButtonText: {
    fontSize: 16, // Match welcome screen button text size
    fontWeight: '600',
    color: themeColor,
    textAlign: 'center',
  },
  selectedPlanButtonText: {
    color: '#fff', // Match welcome screen button text color
  },
  arrowIcon: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20, // Match welcome screen button container
  },
  skipButton: {
    backgroundColor: cardBackground,
    borderRadius: 16, // Match welcome screen radius
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  skipButtonText: {
    fontSize: 16,
    color: textGray,
    fontWeight: '500',
    marginBottom: 4,
  },
  skipSubtext: {
    fontSize: 13,
    color: '#999',
    fontWeight: '400',
  },
});

export default SubscriptionScreen;