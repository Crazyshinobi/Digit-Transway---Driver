import React, { useRef, useEffect, useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { THEME } from '../../themes/colors';

const OTPInput = ({
  code,
  setCode,
  maxLength,
  onComplete,
  error,
  clearError,
}) => {
  const inputRefs = useRef([]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, maxLength);
  }, [maxLength]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleTextChange = (text, index) => {
    if (clearError) {
      clearError();
    }

    const numericText = text.replace(/[^0-9]/g, '');

    if (numericText.length > 1) {
      const digits = numericText.slice(0, maxLength).split('');
      const newCode = digits.join('');
      setCode(newCode);

      const nextIndex = Math.min(digits.length, maxLength - 1);
      setTimeout(() => {
        if (inputRefs.current[nextIndex]) {
          inputRefs.current[nextIndex].focus();
          setFocusedIndex(nextIndex);
        }
      }, 0);

      if (newCode.length === maxLength && onComplete) {
        onComplete(newCode);
      }
      return;
    }

    const codeArray = code.split('');
    codeArray[index] = numericText;
    const newCode = codeArray.join('');

    setCode(newCode);

    if (numericText && index < maxLength - 1) {
      setTimeout(() => {
        if (inputRefs.current[index + 1]) {
          inputRefs.current[index + 1].focus();
          setFocusedIndex(index + 1);
        }
      }, 0);
    }

    if (newCode.length === maxLength && onComplete) {
      setTimeout(() => {
        onComplete(newCode);
      }, 100);
    }
  };

  const handleKeyPress = (e, index) => {
    const { key } = e.nativeEvent;

    if (key === 'Backspace') {
      const codeArray = code.split('');

      if (codeArray[index]) {
        codeArray[index] = '';
        setCode(codeArray.join(''));
      } else if (index > 0) {
        codeArray[index - 1] = '';
        setCode(codeArray.join(''));
        setTimeout(() => {
          if (inputRefs.current[index - 1]) {
            inputRefs.current[index - 1].focus();
            setFocusedIndex(index - 1);
          }
        }, 0);
      }

      if (clearError) {
        clearError();
      }
    }
  };

  const handleFocus = index => {
    setFocusedIndex(index);
    setTimeout(() => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].setSelection?.(0, 1);
      }
    }, 0);
  };

  return (
    <View style={styles.otpContainer}>
      {Array(maxLength)
        .fill('')
        .map((_, index) => (
          <TextInput
            key={index}
            ref={ref => (inputRefs.current[index] = ref)}
            style={[
              styles.otpInput,
              error && styles.inputError,
              focusedIndex === index && styles.otpInputFocused,
            ]}
            keyboardType="numeric"
            maxLength={1}
            value={code[index] || ''}
            onChangeText={text => handleTextChange(text, index)}
            onKeyPress={e => handleKeyPress(e, index)}
            onFocus={() => handleFocus(index)}
            selectTextOnFocus={true}
            autoCorrect={false}
            textContentType="oneTimeCode"
            returnKeyType={index === maxLength - 1 ? 'done' : 'next'}
          />
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: 12,
    backgroundColor: THEME.background,
    borderWidth: 2,
    borderColor: THEME.border,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: THEME.textPrimary,
  },
  otpInputFocused: {
    borderColor: THEME.primary,
    borderWidth: 2,
    backgroundColor: THEME.primarySurface,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  inputError: {
    borderColor: THEME.error,
    borderWidth: 2,
    backgroundColor: `${THEME.error}08`,
  },
});

export default OTPInput;
