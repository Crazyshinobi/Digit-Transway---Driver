import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  Dimensions,
  StyleSheet,
  Image,
} from 'react-native';
import welcome from '../../assets/images/welcome.png';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const truckSlideAnim = useRef(new Animated.Value(width)).current;

  useEffect(() => {
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
      Animated.timing(truckSlideAnim, {
        toValue: 0,
        duration: 1200,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, truckSlideAnim]);

  const onGetStartedPress = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start(() => {
      Animated.spring(buttonScale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
      navigation.navigate('Login');
      console.log('Navigate to Role Selection');
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Truck Image Container */}
        <Animated.View 
          style={[
            styles.truckContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateX: truckSlideAnim }]
            }
          ]}
        >
          <Image source={welcome} />
        </Animated.View>

        {/* Text Content */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.mainTitle}>
            Making your drive best is our responsibility
          </Text>
          
          <Text style={styles.subtitle}>
            The smartest platform for drivers and fleet owners to manage logistics efficiently and safely.
          </Text>
        </Animated.View>

        {/* Progress Indicator */}
        <Animated.View 
          style={[styles.progressContainer, { opacity: fadeAnim }]}
        >
          <View style={styles.progressDot} />
          <View style={[styles.progressDot, styles.inactiveDot]} />
          <View style={[styles.progressDot, styles.inactiveDot]} />
        </Animated.View>

        {/* Get Started Button */}
        <Animated.View
          style={[
            styles.buttonContainer,
            { 
              opacity: fadeAnim,
              transform: [{ scale: buttonScale }, { translateY: slideAnim }] 
            }
          ]}
        >
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={onGetStartedPress}
            activeOpacity={0.8}
          >
            <Text style={styles.getStartedButtonText}>Get Started</Text>
            <Text style={styles.arrowIcon}>→</Text>
          </TouchableOpacity>
          
          <Text style={styles.termsText}>
            By continuing, you agree that you have read and accept our{' '}
            <Text style={styles.linkText}>T&Cs</Text>
            {' '}and{' '}
            <Text style={styles.linkText}>Privacy Policy</Text>
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
    justifyContent: 'space-between',
  },
  truckContainer: {
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  truckImageContainer: {
    width: width * 0.8,
    height: width * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  truckEmoji: {
    fontSize: width * 0.3,
  },
  textContainer: {
    flex: 0.3,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  mainTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  progressDot: {
    width: 32,
    height: 8,
    backgroundColor: '#4285f4',
    borderRadius: 4,
    marginHorizontal: 4,
  },
  inactiveDot: {
    backgroundColor: '#e0e0e0',
    width: 8,
  },
  buttonContainer: {
    flex: 0.2,
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  getStartedButton: {
    backgroundColor: '#4285f4',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 32,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4285f4',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 32,
  },
  getStartedButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  arrowIcon: {
    color: '#fff',
    fontSize: 20,
    paddingBottom: 6,
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 16,
  },
  linkText: {
    color: '#4285f4',
    fontWeight: '500',
  },
});

export default WelcomeScreen;