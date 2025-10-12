import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Animated,
  Platform,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { THEME } from '../../themes/colors';
import { API_URL } from '../../config/config';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

const RoleSelectionScreen = ({ navigation }) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const backgroundAnim = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.9)).current;
  const headerSlide = useRef(new Animated.Value(-50)).current;

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/user-types`);
      console.log('Full API Response:', data);
      if (data?.success) {
        const rolesArray = data.data.user_types;
        console.log('Extracted Roles Array:', rolesArray);
        setRoles(rolesArray || []);
      } else {
        console.error(
          'Failed to fetch roles:',
          data?.message || 'Unknown error',
        );
      }
    } catch (error) {
      console.error('Error in fetching roles:', error.message || error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
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

  const handleRoleSelect = role => {
    setSelectedRole(role);

    Animated.sequence([
      Animated.timing(cardScale, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      navigation?.navigate('Register', { user_type_key: role.type_key });
    }, 500);
  };

  const animatedBackgroundColor = backgroundAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [THEME.primarySurface, THEME.surface],
  });

  const renderLoader = () => (
    <View style={styles.loaderContainer}>
      <ActivityIndicator size="large" color={THEME.primary} />
      <Text style={styles.loaderText}>Finding Your Path...</Text>
    </View>
  );

  return (
    <Animated.View
      style={[styles.container, { backgroundColor: animatedBackgroundColor }]}
    >
      <StatusBar barStyle="dark-content" backgroundColor={THEME.surface} />

      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: headerSlide }],
          },
        ]}
      >
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>Welcome aboard! 👋</Text>
          <Text style={styles.titleText}>What brings you here?</Text>
          <Text style={styles.subtitleText}>
            Choose your path and let's get you set up perfectly
          </Text>
        </View>

        <View style={styles.orbContainer}>
          <View style={[styles.orb, styles.orb1]} />
          <View style={[styles.orb, styles.orb2]} />
          <View style={[styles.orb, styles.orb3]} />
        </View>
      </Animated.View>
      
      {isLoading ? renderLoader() : (
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View
            style={[
              styles.cardsContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: cardScale }],
              },
            ]}
          >
          {roles && roles.map(role => (
            <TouchableOpacity
              key={role.id}
              style={[
                styles.roleCard,
                selectedRole?.id === role.id && styles.selectedCard,
              ]}
              onPress={() => handleRoleSelect(role)}
              activeOpacity={0.9}
            >
              <View style={styles.cardGradient}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconWrapper}>
                    <Text style={styles.cardIcon}>{role.icon}</Text>
                    <View style={styles.iconGlow} />
                  </View>
                  {selectedRole?.id === role.id && (
                    <View style={styles.selectedBadge}>
                      <Text style={styles.selectedBadgeText}>✓</Text>
                    </View>
                  )}
                </View>

                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{role.title}</Text>
                    <Text style={styles.cardSubtitle}>{role.subtitle}</Text>
                    <Text style={styles.cardDescription}>
                      {role.description}
                    </Text>

                    <View style={styles.featuresList}>
                      {role.features.map((feature, index) => (
                        <View key={index} style={styles.featureItem}>
                          <View style={styles.featureDot} />
                          <Text style={styles.featureText}>{feature}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </Animated.View>
        </ScrollView>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50, 
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: THEME.textSecondary,
    fontWeight: '500',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 24,
    paddingBottom: 20,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'transparent',
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
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  cardsContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  roleCard: {
    borderRadius: 24,
    shadowColor: THEME.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: THEME.background,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  selectedCard: {
    transform: [{ scale: 1.02 }],
    shadowOpacity: 0.15,
    shadowColor: THEME.primary,
    borderWidth: 2,
    borderColor: THEME.primary,
  },
  cardGradient: {
    padding: 24,
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  iconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIcon: {
    fontSize: 44,
    textAlign: 'center',
  },
  iconGlow: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${THEME.primary}0D`,
    zIndex: -1,
  },
  selectedBadge: {
    backgroundColor: THEME.success,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: THEME.success,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  selectedBadgeText: {
    color: THEME.textOnPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  cardContent: {
    flex: 1,
    flexShrink: 1,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: THEME.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  cardSubtitle: {
    fontSize: 12,
    color: THEME.primary,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  cardDescription: {
    fontSize: 14,
    color: THEME.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
    fontWeight: '400',
    flexShrink: 1,
  },
  featuresList: {
    gap: 10,
    flexShrink: 1,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingRight: 8,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.primary,
    marginTop: 7,
    flexShrink: 0,
  },
  featureText: {
    fontSize: 12,
    color: THEME.textSecondary,
    fontWeight: '500',
    lineHeight: 20,
    flex: 1,
    flexShrink: 1,
  },
  bottomSection: {
    paddingTop: 20,
    paddingHorizontal: 4,
  },
  infoCard: {
    backgroundColor: THEME.background,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    shadowColor: THEME.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  infoIcon: {
    fontSize: 20,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: THEME.primary,
    lineHeight: 20,
    fontWeight: '500',
    flexShrink: 1,
  },
});

export default RoleSelectionScreen;