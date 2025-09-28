import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { THEME } from '../../themes/colors';

const ModernInput = ({
  icon,
  error,
  multiline = false,
  numberOfLines = 1,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // This dynamic style will now only change colors and opacity, not layout.
  const wrapperStyle = [
    styles.modernInputWrapper,
    isFocused && styles.inputFocused,
    error && styles.inputError,
  ];

  return (
    <View style={styles.modernInputContainer}>
      <View style={wrapperStyle}>
        {icon && <Text style={styles.inputIcon}>{icon}</Text>}
        <TextInput
          style={[
            styles.modernInput,
            multiline && {
              height: Math.max(56, numberOfLines * 24),
              textAlignVertical: 'top',
              paddingTop: 16,
              paddingBottom: 16,
            },
          ]}
          placeholderTextColor={THEME.placeholder}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  modernInputContainer: {
    marginBottom: 20,
  },
  modernInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.background,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: THEME.border,
    paddingHorizontal: 16,
    minHeight: 56,
    // --- Start of Changes ---
    // Apply shadow and elevation permanently to stabilize the layout footprint.
    shadowColor: THEME.primary, // Use a target color
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4, // Keep elevation constant
    shadowOpacity: 0, // Make shadow invisible by default
    // --- End of Changes ---
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  modernInput: {
    flex: 1,
    fontSize: 16,
    color: THEME.textPrimary,
    paddingVertical: 16,
  },
  inputFocused: {
    borderColor: THEME.primary,
    backgroundColor: THEME.primarySurface,
    // --- Start of Changes ---
    // On focus, just reveal the shadow that's already there.
    shadowOpacity: 0.2,
    // Note: We no longer need to add shadow or elevation properties here.
    // --- End of Changes ---
  },
  inputError: {
    borderColor: THEME.error,
    borderWidth: 2,
    backgroundColor: `${THEME.error}08`,
    // If an error occurs, hide the focus shadow to prioritize the error state.
    shadowOpacity: 0,
  },
  errorText: {
    color: THEME.error,
    fontSize: 13,
    marginTop: 6,
    paddingLeft: 8,
    textAlign: 'center',
  },
});

export default React.memo(ModernInput);