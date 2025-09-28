import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  StatusBar,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


const { width, height } = Dimensions.get('window');

// Match the established theme colors
const colors = {
  primary: '#4285f4',
  background: '#f8f9fa',
  cardBg: '#ffffff',
  textDark: '#1a1a1a',
  textGray: '#666',
  textLight: '#999',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  border: '#e0e0e0',
  accent: '#f0f9ff',
};

const Icon = ({ name, size = 24, color, style }) => {
  const getIcon = () => {
    switch (name) {
      case 'trips': return '🗺️';
      case 'profile': return '👤';
      case 'notification': return '🔔';
      case 'logout': return '🚪';
      case 'earnings': return '💰';
      case 'dashboard': return '📊';
      case 'vehicle': return '🚛';
      case 'route': return '📍';
      default: return '❔';
    }
  };
  return <Text style={[{ fontSize: size, color }, style]}>{getIcon()}</Text>;
};

const DriverDashboardScreen = ({ navigation }) => {
  const [isOnline, setIsOnline] = useState(true);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const cardScale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Match other screens' animation timing
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleStatusToggle = (value) => {
    setIsOnline(value);
    // Add haptic feedback here if needed
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Modern Header with blue background */}
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarContainer}>
              <Icon name="profile" size={24} color="#fff" />
            </View>
            <View>
              <Text style={styles.greeting}>Hello, Driver!</Text>
              <Text style={styles.subtitle}>Welcome to your dashboard</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.notificationButton}>
            <View style={styles.notificationIconContainer}>
              <Icon name="notification" size={20} color="#fff" />
              <View style={styles.notificationBadge} />
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card - Enhanced Design */}
        <Animated.View
          style={[
            styles.statusCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: cardScale }]
            }
          ]}
        >
          <View style={styles.statusLeft}>
            <View style={styles.statusHeader}>
              <View style={styles.statusIndicator}>
                <View style={[
                  styles.statusDot, 
                  { backgroundColor: isOnline ? colors.success : colors.error }
                ]} />
                <Text style={styles.statusTitle}>Driver Status</Text>
              </View>
            </View>
            
            <Text style={[
              styles.statusText, 
              { color: isOnline ? colors.success : colors.error }
            ]}>
              {isOnline ? 'Online & Available' : 'Offline'}
            </Text>
            
            <Text style={styles.statusSubtitle}>
              {isOnline 
                ? 'Ready to accept new trip requests' 
                : 'You won\'t receive trip notifications'
              }
            </Text>
          </View>
          
          <View style={styles.statusRight}>
            <Switch
              value={isOnline}
              onValueChange={handleStatusToggle}
              trackColor={{ 
                false: colors.border, 
                true: `${colors.primary}40` 
              }}
              thumbColor={isOnline ? colors.primary : colors.textLight}
              style={styles.statusSwitch}
            />
          </View>
        </Animated.View>

        {/* Quick Stats Cards */}
        <Animated.View
          style={[
            styles.statsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Icon name="trips" size={20} color={colors.primary} />
              <Text style={styles.statLabel}>Trips Today</Text>
            </View>
            <Text style={styles.statNumber}>7</Text>
            <Text style={styles.statChange}>+2 from yesterday</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Icon name="earnings" size={20} color={colors.success} />
              <Text style={styles.statLabel}>Today's Earnings</Text>
            </View>
            <Text style={[styles.statNumber, { color: colors.success }]}>₹1,240</Text>
            <Text style={styles.statChange}>+18% this week</Text>
          </View>
        </Animated.View>

        {/* Main Action Card */}
        <Animated.View
          style={[
            styles.actionCardContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('AvailableTrip')}
            activeOpacity={0.8}
          >
            <View style={styles.actionCardHeader}>
              <View style={styles.actionIconContainer}>
                <Icon name="route" size={28} color="#fff" />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Find New Trips</Text>
                <Text style={styles.actionSubtitle}>
                  Browse available loads and submit quotes
                </Text>
              </View>
            </View>
            
            <View style={styles.actionCardFooter}>
              <Text style={styles.actionCTA}>Start Searching →</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Weekly Overview Card */}
        <Animated.View
          style={[
            styles.overviewCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.overviewHeader}>
            <Icon name="dashboard" size={22} color={colors.primary} />
            <Text style={styles.overviewTitle}>This Week Overview</Text>
          </View>
          
          <View style={styles.overviewStats}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewNumber}>23</Text>
              <Text style={styles.overviewLabel}>Total Trips</Text>
            </View>
            <View style={styles.overviewDivider} />
            <View style={styles.overviewItem}>
              <Text style={[styles.overviewNumber, { color: colors.success }]}>₹8,450</Text>
              <Text style={styles.overviewLabel}>Total Earnings</Text>
            </View>
            <View style={styles.overviewDivider} />
            <View style={styles.overviewItem}>
              <Text style={styles.overviewNumber}>4.8⭐</Text>
              <Text style={styles.overviewLabel}>Rating</Text>
            </View>
          </View>
        </Animated.View>

        {/* Menu Card */}
        <Animated.View
          style={[
            styles.menuCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.menuItem}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconContainer}>
              <Icon name="profile" size={20} color={colors.primary} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuText}>Profile & Vehicle Details</Text>
              <Text style={styles.menuSubtext}>Manage your information</Text>
            </View>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
          
          <View style={styles.menuDivider} />
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] })}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: `${colors.error}15` }]}>
              <Icon name="logout" size={20} color={colors.error} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={[styles.menuText, { color: colors.error }]}>Sign Out</Text>
              <Text style={styles.menuSubtext}>Logout from your account</Text>
            </View>
            <Text style={[styles.menuArrow, { color: colors.error }]}>→</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Header Styles - Match other screens
  header: {
    backgroundColor: colors.primary,
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  notificationButton: {
    padding: 8,
  },
  notificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    backgroundColor: colors.error,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#fff',
  },
  
  // Content Styles
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  
  // Status Card - Enhanced
  statusCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  statusLeft: {
    flex: 1,
  },
  statusHeader: {
    marginBottom: 12,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textGray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    color: colors.textGray,
    lineHeight: 20,
  },
  statusRight: {
    alignItems: 'center',
  },
  statusSwitch: {
    transform: [{ scale: 1.1 }],
  },
  
  // Stats Container
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: 20,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textGray,
    marginLeft: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statChange: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '500',
  },
  
  // Action Card - Enhanced
  actionCardContainer: {
    marginBottom: 20,
  },
  actionCard: {
    backgroundColor: 'black',
    borderRadius: 20,
    padding: 24,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  actionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  actionCardFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 16,
    alignItems: 'flex-end',
  },
  actionCTA: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  
  // Overview Card
  overviewCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textDark,
    marginLeft: 12,
  },
  overviewStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overviewItem: {
    flex: 1,
    alignItems: 'center',
  },
  overviewNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 12,
    color: colors.textGray,
    fontWeight: '500',
  },
  overviewDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
    marginHorizontal: 20,
  },
  
  // Menu Card - Enhanced
  menuCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 20,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 2,
  },
  menuSubtext: {
    fontSize: 13,
    color: colors.textGray,
  },
  menuArrow: {
    fontSize: 16,
    color: colors.textGray,
    fontWeight: 'bold',
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 20,
  },
});

export default DriverDashboardScreen;