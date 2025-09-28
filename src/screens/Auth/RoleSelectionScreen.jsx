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
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Your theme colors
const themeColor = '#4285f4';
const backgroundColor = '#f8f9fa';
const textDark = '#1a1a1a';
const textGray = '#666';

const RoleSelectionScreen = ({ navigation }) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const backgroundAnim = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.9)).current;
  const headerSlide = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
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

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    
    // Animated feedback
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
      navigation?.navigate('Register', { role });
    }, 500);
  };

  const animatedBackgroundColor = backgroundAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#e8f0fe', backgroundColor],
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor: animatedBackgroundColor }]}>
      <StatusBar barStyle="light-content" backgroundColor={themeColor} />
      
      {/* Fixed Header */}
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: headerSlide }]
          }
        ]}
      >
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>Welcome aboard! 👋</Text>
          <Text style={styles.titleText}>What brings you here?</Text>
          <Text style={styles.subtitleText}>
            Choose your path and let's get you set up perfectly
          </Text>
        </View>
        
        {/* Floating orbs - repositioned */}
        <View style={styles.orbContainer}>
          <View style={[styles.orb, styles.orb1]} />
          <View style={[styles.orb, styles.orb2]} />
          <View style={[styles.orb, styles.orb3]} />
        </View>
      </Animated.View>

      {/* Scrollable Content - Fixed overflow issues */}
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
              transform: [{ scale: cardScale }]
            }
          ]}
        >
          {/* Fleet Owner Card - Fixed content visibility */}
          <TouchableOpacity 
            style={[
              styles.roleCard,
              styles.ownerCard,
              selectedRole === 'owner' && styles.selectedCard
            ]}
            onPress={() => handleRoleSelect('owner')}
            activeOpacity={0.9}
          >
            <View style={styles.cardGradient}>
              <View style={styles.cardHeader}>
                <View style={styles.iconWrapper}>
                  <Text style={styles.cardIcon}>🏢</Text>
                  <View style={styles.iconGlow} />
                </View>
                {selectedRole === 'owner' && (
                  <View style={styles.selectedBadge}>
                    <Text style={styles.selectedBadgeText}>✓</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Fleet Owner</Text>
                <Text style={styles.cardSubtitle}>Business & Operations</Text>
                <Text style={styles.cardDescription}>
                  Manage your fleet, track performance, optimize routes, and grow your business with powerful analytics tools.
                </Text>
                
                <View style={styles.featuresList}>
                  <View style={styles.featureItem}>
                    <View style={styles.featureDot} />
                    <Text style={styles.featureText}>Comprehensive Fleet Management</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <View style={styles.featureDot} />
                    <Text style={styles.featureText}>Real-time Driver Analytics</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <View style={styles.featureDot} />
                    <Text style={styles.featureText}>Advanced Revenue Tracking</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <View style={styles.featureDot} />
                    <Text style={styles.featureText}>Route Optimization Engine</Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* Driver Card - Fixed content visibility */}
          <TouchableOpacity 
            style={[
              styles.roleCard,
              styles.driverCard,
              selectedRole === 'driver' && styles.selectedCard
            ]}
            onPress={() => handleRoleSelect('driver')}
            activeOpacity={0.9}
          >
            <View style={styles.cardGradient}>
              <View style={styles.cardHeader}>
                <View style={styles.iconWrapper}>
                  <Text style={styles.cardIcon}>👨‍💼</Text>
                  <View style={styles.iconGlow} />
                </View>
                {selectedRole === 'driver' && (
                  <View style={styles.selectedBadge}>
                    <Text style={styles.selectedBadgeText}>✓</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Professional Driver</Text>
                <Text style={styles.cardSubtitle}>On the Road</Text>
                <Text style={styles.cardDescription}>
                  Get assignments, navigate efficiently, track earnings, and build your driving career with our comprehensive tools.
                </Text>
                
                <View style={styles.featuresList}>
                  <View style={styles.featureItem}>
                    <View style={styles.featureDot} />
                    <Text style={styles.featureText}>Smart Navigation System</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <View style={styles.featureDot} />
                    <Text style={styles.featureText}>Live Earnings Tracker</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <View style={styles.featureDot} />
                    <Text style={styles.featureText}>Detailed Trip History</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <View style={styles.featureDot} />
                    <Text style={styles.featureText}>Performance Insights</Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Bottom Section - Better positioned */}
        <Animated.View 
          style={[
            styles.bottomSection,
            { opacity: fadeAnim }
          ]}
        >
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>💡</Text>
            <Text style={styles.infoText}>
              Don't worry! You can always switch roles later in your profile settings
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Fixed Header Styles
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
    color: textDark,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.3,
    paddingTop: 10,
  },
  titleText: {
    fontSize: 25,
    fontWeight: '800',
    color: themeColor,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.8,
  },
  subtitleText: {
    fontSize: 16,
    color: textGray,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '400',
    paddingHorizontal: 20,
  },
  
  // Repositioned floating orbs
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
    opacity: 0.06,
  },
  orb1: {
    width: 100,
    height: 100,
    backgroundColor: themeColor,
    top: 10,
    right: -30,
  },
  orb2: {
    width: 60,
    height: 60,
    backgroundColor: '#34a853',
    bottom: 5,
    left: -15,
  },
  orb3: {
    width: 40,
    height: 40,
    backgroundColor: themeColor,
    top: 80,
    left: 40,
  },

  // Fixed scroll container
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  // Cards Container - Better flex distribution
  cardsContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  
  // Fixed Card Styles - No overflow issues
  roleCard: {
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#fff',
    // Removed fixed minHeight to allow content to determine height
  },
  ownerCard: {
    borderWidth: 1,
    borderColor: '#f0f2f5',
  },
  driverCard: {
    borderWidth: 1,
    borderColor: '#f0f2f5',
  },
  selectedCard: {
    transform: [{ scale: 1.02 }],
    shadowOpacity: 0.15,
    shadowColor: themeColor,
    borderWidth: 2,
    borderColor: themeColor,
  },
  
  // Fixed card content layout
  cardGradient: {
    padding: 24,
    flex: 1, // Allow content to expand properly
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
    backgroundColor: `${themeColor}06`,
    zIndex: -1,
  },
  selectedBadge: {
    backgroundColor: '#10b981',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  selectedBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  
  // Fixed card content - Better text visibility
  cardContent: {
    flex: 1,
    flexShrink: 1, // Allow content to shrink if needed
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: textDark,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  cardSubtitle: {
    fontSize: 12,
    color: themeColor,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  cardDescription: {
    fontSize: 14,
    color: textGray,
    lineHeight: 22,
    marginBottom: 20,
    fontWeight: '400',
    flexShrink: 1, // Prevent overflow
  },
  
  // Enhanced features list
  featuresList: {
    gap: 10,
    flexShrink: 1, // Allow features to shrink if needed
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
    backgroundColor: themeColor,
    marginTop: 7, // Align with text
    flexShrink: 0, // Don't shrink dot
  },
  featureText: {
    fontSize: 12,
    color: textGray,
    fontWeight: '500',
    lineHeight: 20,
    flex: 1,
    flexShrink: 1, // Allow text to wrap
  },

  // Fixed Bottom Section
  bottomSection: {
    paddingTop: 20,
    paddingHorizontal: 4,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f2f5',
  },
  infoIcon: {
    fontSize: 20,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: themeColor,
    lineHeight: 20,
    fontWeight: '500',
    flexShrink: 1, // Allow text to wrap properly
  },
});

export default RoleSelectionScreen;