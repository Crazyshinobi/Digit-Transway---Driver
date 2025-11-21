import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ModernInput from '../common/ModernInput';
import { THEME } from '../../themes/colors';
import { useRegistrationContext } from '../../context/RegistrationContext';

const BankDetailStep = () => {
  const {
    formData,
    setFormData,
    errors,
    clearFieldError,
    handleBankDetailsChange: onBankDetailsChange, 
    handleVerifyBankAccount: onVerifyBankAccount, 
    handleEditBankDetails: onEditBankDetails, 
    isVerifyingBank,
    isBankVerified,
  } = useRegistrationContext();
  const canVerify =
    !isVerifyingBank &&
    formData.account_number.length > 5 && 
    formData.ifsc.length === 11; 

  return (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <View style={styles.iconContainer}>
          <Text style={styles.stepIcon}>🏦</Text>
        </View>
        <Text style={styles.stepTitle}>Banking Information</Text>
        <Text style={styles.stepSubtitle}>
          Please verify your bank account to proceed
        </Text>
      </View>

      <View style={styles.inputCard}>
        {isBankVerified ? (
          
          <View style={styles.verifiedContainer}>
            <View style={styles.verifiedHeader}>
              <Text style={styles.verifiedIcon}>✅</Text>
              <Text style={styles.verifiedTitle}>Account Verified</Text>

              <TouchableOpacity
                onPress={onEditBankDetails}
                style={styles.editButton}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.verifiedRow}>
              <Text style={styles.verifiedLabel}>Account Holder:</Text>

              <Text style={styles.verifiedValue}>
                {formData.account_holder_name}
              </Text>
            </View>

            <View style={styles.verifiedRow}>
              <Text style={styles.verifiedLabel}>Bank Name:</Text>

              <Text style={styles.verifiedValue}>{formData.bank_name}</Text>
            </View>

            <View style={styles.verifiedRow}>
              <Text style={styles.verifiedLabel}>Account Number:</Text>S
              <Text style={styles.verifiedValue}>
                ...{formData.account_number.slice(-4)}
              </Text>
            </View>
          </View>
        ) : (
          
          <>
            <ModernInput
              placeholder="Account Number"
              value={formData.account_number}
              onChangeText={text =>
                onBankDetailsChange('account_number', text.replace(/\D/g, ''))
              }
              error={errors.account_number}
              keyboardType="numeric"
            />

            <ModernInput
              placeholder="IFSC Code"
              value={formData.ifsc}
              onChangeText={text =>
                onBankDetailsChange('ifsc', text.toUpperCase())
              }
              error={errors.ifsc}
              autoCapitalize="characters"
              maxLength={11}
            />

            <TouchableOpacity
              onPress={onVerifyBankAccount}
              disabled={!canVerify}
              style={styles.verifyButtonContainer}
            >
              <LinearGradient
                colors={
                  !canVerify
                    ? ['#BDBDBD', '#BDBDBD']
                    : [THEME.primary, THEME.primaryDark]
                }
                style={styles.verifyButton}
              >
                {isVerifyingBank ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.verifyButtonText}>Verify Account</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
            {/* General Bank Error Message */}
            {errors.bank_account && (
              <Text style={styles.generalErrorText}>{errors.bank_account}</Text>
            )}
          </>
        )}

        <View style={styles.securityNote}>
          <Text style={styles.securityIcon}>🔒</Text>
          <Text style={styles.securityText}>
            Your banking information is encrypted and secure
          </Text>
        </View>

        {/* Declaration remains unchanged, but is only shown if verified */}

        {isBankVerified && (
          <View style={styles.declarationCard}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => {
                setFormData(prev => ({
                  ...prev,
                  declaration: !prev.declaration,
                }));
                clearFieldError('declaration');
              }}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.modernCheckbox,
                  formData.declaration && styles.checkedCheckbox,
                ]}
              >
                {formData.declaration && (
                  <Text style={styles.checkIcon}>✓</Text>
                )}
              </View>

              <Text style={styles.declarationText}>
                I declare that all information provided is accurate and I agree
                to the terms and conditions.
              </Text>
            </TouchableOpacity>

            {errors.declaration && (
              <Text style={styles.errorText}>{errors.declaration}</Text>
            )}
          </View>
        )}
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
  generalErrorText: {
    color: THEME.error,
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '500',
  }, 
  verifyButtonContainer: {
    marginTop: 16,
  },
  verifyButton: {
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: THEME.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  verifyButtonText: {
    color: THEME.textOnPrimary,
    fontSize: 15,
    fontWeight: '700',
  }, 
  verifiedContainer: {
    backgroundColor: THEME.successSurface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: THEME.success,
  },
  verifiedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: THEME.successBorder,
    paddingBottom: 12,
    marginBottom: 12,
  },
  verifiedIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  verifiedTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: THEME.success,
  },
  editButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  editButtonText: {
    fontSize: 14,
    color: THEME.primary,
    fontWeight: '600',
  },
  verifiedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  verifiedLabel: {
    fontSize: 14,
    color: THEME.textSecondary,
    fontWeight: '500',
  },
  verifiedValue: {
    fontSize: 14,
    color: THEME.textPrimary,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
    marginLeft: 10,
  },
});

export default BankDetailStep;
