import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, Animated } from 'react-native';
import { THEME } from '../../themes/colors';

const ModernInput = ({
  icon,
  error,
  multiline = false,
  numberOfLines = 1,
  label,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  
  // Animation values
  const focusAnimation = useRef(new Animated.Value(0)).current;
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate on focus/blur
    Animated.timing(focusAnimation, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  useEffect(() => {
    // Shake animation for errors
    if (error) {
      Animated.sequence([
        Animated.timing(shakeAnimation, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [error]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleChangeText = (text) => {
    setHasValue(text.length > 0);
    props.onChangeText?.(text);
  };

  // Animated border color
  const borderColor = focusAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? THEME.error : THEME.border, error ? THEME.error : THEME.primary],
  });

  // Animated background color
  const backgroundColor = focusAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [THEME.surface, THEME.surface],
  });

  // Animated shadow opacity
  const shadowOpacity = focusAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.05, 0.15],
  });

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[
          styles.label,
          isFocused && styles.labelFocused,
          error && styles.labelError,
        ]}>
          {label}
        </Text>
      )}
      
      <Animated.View
        style={[
          styles.inputWrapper,
          {
            borderColor,
            backgroundColor,
            transform: [{ translateX: shakeAnimation }],
          },
          // Dynamic shadow
          {
            shadowOpacity,
            shadowColor: isFocused ? THEME.primary : THEME.shadowLight,
            shadowOffset: { width: 0, height: isFocused ? 4 : 2 },
            shadowRadius: isFocused ? 12 : 6,
            elevation: isFocused ? 8 : 4,
          },
          multiline && {
            height: Math.max(56, (numberOfLines * 24) + 32),
            alignItems: 'flex-start',
          },
        ]}
      >
        {icon && (
          <View style={styles.iconContainer}>
            <Text style={[
              styles.inputIcon,
              isFocused && styles.iconFocused,
              error && styles.iconError,
            ]}>
              {icon}
            </Text>
          </View>
        )}
        
        <TextInput
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            icon && styles.inputWithIcon,
          ]}
          placeholderTextColor={THEME.placeholder}
          selectionColor={THEME.primary}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChangeText={handleChangeText}
          {...props}
        />
      </Animated.View>

      {error && (
        <Animated.View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textSecondary,
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.2,
  },
  
  labelFocused: {
    color: THEME.primary,
  },
  
  labelError: {
    color: THEME.error,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.surface,
    borderRadius: 16,
    borderWidth: 2,
    minHeight: 56,
    paddingHorizontal: 16,
    // Base shadow
    shadowColor: THEME.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
    // Smooth transitions
    transform: [{ scale: 1 }],
  },

  iconContainer: {
    marginRight: 12,
    width: 24,
    alignItems: 'center',
  },

  inputIcon: {
    fontSize: 20,
    color: THEME.textSecondary,
    textAlign: 'center',
    transition: 'color 0.2s ease',
  },

  iconFocused: {
    color: THEME.primary,
  },

  iconError: {
    color: THEME.error,
  },

  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: THEME.textPrimary,
    paddingVertical: 16,
    letterSpacing: 0.3,
    lineHeight: 22,
  },

  inputWithIcon: {
    marginLeft: 0,
  },

  inputMultiline: {
    paddingTop: 16,
    paddingBottom: 16,
    textAlignVertical: 'top',
    lineHeight: 24,
  },

  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginLeft: 4,
  },

  errorIcon: {
    fontSize: 14,
    marginRight: 6,
  },

  errorText: {
    flex: 1,
    color: THEME.error,
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});

export default React.memo(ModernInput);
