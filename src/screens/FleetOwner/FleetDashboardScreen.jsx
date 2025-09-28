import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const FleetDashboardScreen = ({ navigation, route }) => {
  const userRole = route.params?.userRole || 'fleet_owner';

  const stats = [
    { title: 'Total Vehicles', value: '25', color: '#2196F3' },
    { title: 'Active Drivers', value: '18', color: '#4CAF50' },
    { title: 'Today\'s Revenue', value: '₹12,450', color: '#FF9800' },
    { title: 'Completed Trips', value: '156', color: '#9C27B0' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Fleet Owner Dashboard</Text>
        <Text style={styles.dateText}>Today: {new Date().toLocaleDateString()}</Text>
      </View>

      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <View key={index} style={[styles.statCard, { borderLeftColor: stat.color }]}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statTitle}>{stat.title}</Text>
          </View>
        ))}
      </View>

      <View style={styles.menuContainer}>
        <Text style={styles.menuTitle}>Quick Actions</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('ManageVehicles')}
        >
          <Text style={styles.menuIcon}>🚛</Text>
          <View style={styles.menuContent}>
            <Text style={styles.menuItemTitle}>Manage Vehicles</Text>
            <Text style={styles.menuItemSubtitle}>Add, edit, and track your fleet</Text>
          </View>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('ViewDrivers')}
        >
          <Text style={styles.menuIcon}>👥</Text>
          <View style={styles.menuContent}>
            <Text style={styles.menuItemTitle}>View Drivers</Text>
            <Text style={styles.menuItemSubtitle}>Manage driver profiles and performance</Text>
          </View>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('Analytics')}
        >
          <Text style={styles.menuIcon}>📊</Text>
          <View style={styles.menuContent}>
            <Text style={styles.menuItemTitle}>Analytics & Reports</Text>
            <Text style={styles.menuItemSubtitle}>View detailed performance metrics</Text>
          </View>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={() => navigation.reset({
          index: 0,
          routes: [{ name: 'RoleSelection' }],
        })}
      >
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    alignItems: 'center',
  },
  welcomeText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  dateText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 5,
    opacity: 0.9,
  },
  statsContainer: {
    padding: 20,
    gap: 15,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  menuContainer: {
    padding: 20,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  menuItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  menuContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
  menuArrow: {
    fontSize: 18,
    color: '#2196F3',
  },
  logoutButton: {
    backgroundColor: '#f44336',
    margin: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FleetDashboardScreen;
