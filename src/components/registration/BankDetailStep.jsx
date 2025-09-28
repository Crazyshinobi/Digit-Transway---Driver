// src/components/registration/BankDetailsStep.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ModernInput from '../common/ModernInput';
import { THEME } from '../../themes/colors';

const BankDetailStep = ({
  formData,
  setFormData,
  errors,
  clearFieldError,
}) => {
  return (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <View style={styles.iconContainer}>
          <Text style={styles.stepIcon}>🏦</Text>
        </View>
        <Text style={styles.stepTitle}>Banking Information</Text>
        <Text style={styles.stepSubtitle}>Secure payment details for transactions</Text>
      </View>

      <View style={styles.inputCard}>
        <ModernInput
          placeholder="Bank Name"
          value={formData.bank_name}
          onChangeText={(text) => {
            setFormData(prev => ({ ...prev, bank_name: text }));
            clearFieldError('bank_name');
          }}
          error={errors.bank_name}
          icon="🏦"
        />

        <ModernInput
          placeholder="Account Number"
          value={formData.account_number}
          onChangeText={(text) => {
            setFormData(prev => ({ ...prev, account_number: text }));
            clearFieldError('account_number');
          }}
          error={errors.account_number}
          icon="🔢"
          keyboardType="numeric"
        />

        <ModernInput
          placeholder="IFSC Code"
          value={formData.ifsc}
          onChangeText={(text) => {
            setFormData(prev => ({ ...prev, ifsc: text.toUpperCase() }));
            clearFieldError('ifsc');
          }}
          error={errors.ifsc}
          icon="🏛️"
          autoCapitalize="characters"
          maxLength={11}
        />

        <View style={styles.securityNote}>
          <Text style={styles.securityIcon}>🔒</Text>
          <Text style={styles.securityText}>
            Your banking information is encrypted and secure
          </Text>
        </View>

        <View style={styles.declarationCard}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => {
              setFormData(prev => ({ ...prev, declaration: !prev.declaration }));
              clearFieldError('declaration');
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.modernCheckbox, formData.declaration && styles.checkedCheckbox]}>
              {formData.declaration && <Text style={styles.checkIcon}>✓</Text>}
            </View>
            <Text style={styles.declarationText}>
              I declare that all information provided is accurate and I agree to the terms and conditions.
            </Text>
          </TouchableOpacity>
          {errors.declaration && <Text style={styles.errorText}>{errors.declaration}</Text>}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: THEME.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: THEME.shadowLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: THEME.borderLight,
  },
  stepIcon: {
    fontSize: 32,
  },
  stepTitle: {
    fontSize: 25,
    fontWeight: '700',
    color: THEME.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  stepSubtitle: {
    fontSize: 15,
    color: THEME.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  inputCard: {
    backgroundColor: THEME.surface,
    borderRadius: 20,
    padding: 20,
    shadowColor: THEME.shadowLight,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: THEME.borderLight,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.primarySurface,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: THEME.primaryBorder,
  },
  securityIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  securityText: {
    flex: 1,
    fontSize: 13,
    color: THEME.textSecondary,
    lineHeight: 18,
  },
  declarationCard: {
    backgroundColor: THEME.primarySurface,
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: THEME.primary,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modernCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: THEME.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkedCheckbox: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  checkIcon: {
    color: THEME.textOnPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  declarationText: {
    flex: 1,
    fontSize: 14,
    color: THEME.textPrimary,
    lineHeight: 20,
  },
  errorText: {
    color: THEME.error,
    fontSize: 13,
    marginTop: 6,
    paddingLeft: 8,
    textAlign: 'center',
  },
});

export default BankDetailStep;
