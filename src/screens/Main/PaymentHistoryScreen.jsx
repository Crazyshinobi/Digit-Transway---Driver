import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../../config/config';
import { THEME } from '../../themes/colors';

const Icon = ({ name, size = 24, color, style }) => {
  const getIcon = () => {
    switch (name) {
      case 'back':
        return '⬅️';
      case 'payment':
        return '💵';
      case 'plan':
        return '📦';
      case 'paid':
        return '✅';
      case 'pending':
        return '⏳';
      case 'failed':
        return '❌';
      case 'history':
        return '📜';
      default:
        return '❔';
    }
  };
  return <Text style={[{ fontSize: size, color }, style]}>{getIcon()}</Text>;
};

const PaymentRecordItem = ({ item }) => {
  const isPaid = item.payment_status === 'paid';
  const statusText = (item.payment_status || '').toUpperCase();
  const planName = item.vendor_plan_subscription?.plan_name || 'N/A Plan';

  const amountToShow = item.amount_paid || item.amount || '0.00';
  const amountText = `₹${parseFloat(amountToShow || 0).toFixed(2)}`;

  const paymentDate = item.paid_at
    ? new Date(item.paid_at).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      })
    : null;

  const expiresAt = item.vendor_plan_subscription?.expires_at
    ? new Date(item.vendor_plan_subscription.expires_at).toLocaleDateString(
        'en-IN',
        {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        },
      )
    : '—';

  let statusStyle = styles.status_pending;
  let statusIconName = 'pending';
  if (isPaid) {
    statusStyle = styles.status_completed;
    statusIconName = 'paid';
  } else if (statusText === 'FAILED') {
    statusStyle = styles.status_failed;
    statusIconName = 'failed';
  }

  return (
    <View style={styles.recordItemContainer}>
      <View style={styles.recordHeader}>
        <View
          style={[
            styles.iconWrapper,
            {
              backgroundColor: isPaid ? THEME.successLight : THEME.warningLight,
            },
          ]}
        >
          <Icon
            name={statusIconName}
            size={18}
            color={isPaid ? THEME.success : THEME.warning}
          />
        </View>

        <View style={styles.recordDetails}>
          <Text style={styles.planNameText} numberOfLines={1}>
            {planName}
          </Text>
          <Text style={styles.paymentDateText}>
            {isPaid ? `Paid on ${paymentDate}` : 'Order created'}
          </Text>
        </View>

        <View style={styles.amountContainer}>
          <Text style={styles.amountText}>{amountText}</Text>
          <Text style={[styles.statusBadge, statusStyle]}>{statusText}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.subDetailRow}>
        <Text style={styles.subDetailLabel}>Subscription ID:</Text>
        <Text style={styles.subDetailValue}>
          {item.razorpay_subscription_id || 'N/A'}
        </Text>
      </View>

      <View style={styles.subDetailRow}>
        <Text style={styles.subDetailLabel}>Receipt:</Text>
        <Text style={styles.subDetailValue}>{item.receipt_number || '—'}</Text>
      </View>

      <View style={styles.subDetailRow}>
        <Text style={styles.subDetailLabel}>Expires:</Text>
        <Text style={styles.subDetailValue}>{expiresAt}</Text>
      </View>

      {/* Optional: show a few plan features if available */}
      {Array.isArray(item.vendor_plan_subscription?.plan_features) && (
        <View style={{ marginTop: 8 }}>
          <Text style={[styles.subDetailLabel, { marginBottom: 4 }]}>
            Features:
          </Text>
          {item.vendor_plan_subscription.plan_features
            .slice(0, 3)
            .map((f, idx) => (
              <Text key={idx} style={styles.featureText}>
                • {f}
              </Text>
            ))}
        </View>
      )}
    </View>
  );
};

const PaymentHistoryScreen = ({ navigation }) => {
  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [vendorName, setVendorName] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const [accessToken, setAccessToken] = useState(null);

  const fetchPaymentHistory = useCallback(async () => {
    setError(null);
    const token = accessToken || (await AsyncStorage.getItem('@user_token'));
    if (!token) {
      setIsLoading(false);
      setIsRefreshing(false);
      setError('Authentication token missing.');
      return;
    }

    setAccessToken(token);
    try {
      const response = await axios.get(`${API_URL}/api/vendor/payments`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data?.success && response.data?.data) {
        const data = response.data.data;
        setHistoryData(Array.isArray(data.records) ? data.records : []);
        setVendorName(data.vendor_name || 'Vendor');
        setTotalRecords(data.total || 0);
        setError(null);
      } else {
        setError(
          response.data?.message || 'Failed to retrieve payment history.',
        );
        setHistoryData([]);
      }
    } catch (err) {
      console.warn(
        'Payment History Fetch Error:',
        err?.response?.data || err.message,
      );
      setError('Could not connect to server or fetch history.');
      setHistoryData([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [accessToken]);

  useEffect(() => {
    setIsLoading(true);
    fetchPaymentHistory();
  }, [fetchPaymentHistory]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchPaymentHistory();
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon
        name="history"
        size={60}
        color={THEME.textSecondary}
        style={{ marginBottom: 15 }}
      />
      <Text style={styles.emptyText}>No payment records found.</Text>
      <Text style={styles.emptySubtitle}>
        Start a plan to see your history here.
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Vendor: {vendorName}</Text>
        <Text style={styles.summaryTotal}>
          Total Transactions: {totalRecords}
        </Text>
      </View>
    </View>
  );

  const renderList = () => {
    if (isLoading && !isRefreshing) {
      return (
        <ActivityIndicator
          size="large"
          color={THEME.primary}
          style={{ marginTop: 50 }}
        />
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ Error Loading History</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FlatList
        data={historyData}
        renderItem={({ item }) => <PaymentRecordItem item={item} />}
        keyExtractor={item => item.id?.toString() || Math.random().toString()}
        ListEmptyComponent={renderEmpty}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.surface} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="back" size={24} color={THEME.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment History</Text>
        <View style={{ width: 40 }} />
      </View>

      {renderList()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.surface },
  header: {
    backgroundColor: THEME.surface,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 0,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: THEME.borderLight,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: THEME.textPrimary },
  summaryCard: {
    backgroundColor: THEME.surfaceElevated,
    borderRadius: 16,
    padding: 20,
    margin: 20,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.textPrimary,
    marginBottom: 8,
  },
  summaryTotal: { fontSize: 14, color: THEME.textSecondary },
  recordItemContainer: {
    backgroundColor: THEME.surfaceElevated,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  recordDetails: { flex: 1 },
  planNameText: { fontSize: 16, fontWeight: 'bold', color: THEME.textPrimary },
  paymentDateText: { fontSize: 12, color: THEME.textSecondary, marginTop: 4 },
  amountContainer: { alignItems: 'flex-end' },
  amountText: { fontSize: 16, fontWeight: 'bold', color: THEME.success },
  statusBadge: {
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: 'hidden',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  divider: { height: 1, backgroundColor: THEME.borderLight, marginVertical: 8 },
  subDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  subDetailLabel: { fontSize: 12, color: THEME.textSecondary },
  subDetailValue: { fontSize: 12, fontWeight: '500', color: THEME.textPrimary },
  status_completed: {
    backgroundColor: `${THEME.success}20`,
    color: THEME.success,
  },
  status_pending: {
    backgroundColor: `${THEME.warning}20`,
    color: THEME.warning,
  },
  status_failed: { backgroundColor: `${THEME.error}20`, color: THEME.error },
  // Empty/Error State Styles
  emptyContainer: { marginTop: 50, alignItems: 'center', padding: 20 },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.textPrimary,
    marginBottom: 5,
  },
  emptySubtitle: {
    fontSize: 14,
    color: THEME.textSecondary,
    textAlign: 'center',
  },
  errorContainer: {
    marginTop: 50,
    alignItems: 'center',
    padding: 20,
    backgroundColor: THEME.surfaceElevated,
    borderRadius: 12,
    marginHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.error,
    marginBottom: 10,
  },
  errorSubtitle: {
    fontSize: 14,
    color: THEME.textSecondary,
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: THEME.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: { color: THEME.textOnPrimary, fontWeight: '600' },
  featureText: { fontSize: 12, color: THEME.textSecondary, marginLeft: 6 },
});

export default PaymentHistoryScreen;
