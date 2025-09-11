import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';

import { User } from '../types';
import dataService from '../utils/dataService';

interface Props {
  navigation: any;
}

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await dataService.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await dataService.logout();
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              })
            );
          },
        },
      ]
    );
  };

  const handleChangeUser = () => {
    Alert.alert(
      'Change User',
      'Switch to a different student or go back to teacher selection?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Select Different Student',
          onPress: () => {
            if (currentUser?.role === 'student') {
              navigation.navigate('StudentSelect');
            }
          },
        },
        {
          text: 'Back to Login',
          onPress: async () => {
            await dataService.logout();
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              })
            );
          },
        },
      ]
    );
  };

  const handleTeacherDashboard = () => {
    navigation.navigate('TeacherDashboard');
  };

  const handleAbout = () => {
    Alert.alert(
      'About Learning App',
      'Version 1.0.0\n\nEducational video learning platform for students with interactive quizzes and progress tracking.\n\nDeveloped for iOS.',
      [{ text: 'OK' }]
    );
  };

  const renderSettingItem = (
    icon: keyof typeof Ionicons.glyphMap,
    title: string,
    subtitle: string,
    onPress: () => void,
    showChevron: boolean = true,
    color: string = '#333'
  ) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color }]}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      {showChevron && (
        <Ionicons name="chevron-forward-outline" size={20} color="#ccc" />
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userIcon}>
            <Ionicons 
              name="person" 
              size={40} 
              color={currentUser?.role === 'teacher' ? '#007AFF' : '#4CAF50'} 
            />
          </View>
          <Text style={styles.userName}>{currentUser?.name}</Text>
          <Text style={styles.userRole}>
            {currentUser?.role === 'teacher' ? 'Teacher' : 'Student'}
          </Text>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          {renderSettingItem(
            'person-circle',
            'Change User',
            'Switch to a different student or teacher',
            handleChangeUser
          )}

          {currentUser?.role === 'teacher' && renderSettingItem(
            'analytics',
            'Teacher Dashboard',
            'View class progress and analytics',
            handleTeacherDashboard
          )}

          {renderSettingItem(
            'log-out',
            'Logout',
            'Sign out of your account',
            handleLogout,
            false,
            '#f44336'
          )}
        </View>

        {/* Learning Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learning</Text>
          
          {renderSettingItem(
            'stats-chart',
            'View Progress',
            'See your learning progress and achievements',
            () => navigation.navigate('Progress')
          )}

          {renderSettingItem(
            'grid',
            'Categories',
            'Browse all learning categories',
            () => navigation.navigate('Categories')
          )}
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          
          {renderSettingItem(
            'information-circle',
            'About',
            'App version and information',
            handleAbout,
            false
          )}

          {renderSettingItem(
            'help-circle',
            'Help & Support',
            'Get help with using the app',
            () => Alert.alert('Help', 'Contact your teacher for support with the learning app.'),
            false
          )}
        </View>

        {/* App Version */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>Learning App v1.0.0</Text>
          <Text style={styles.copyrightText}>Educational Platform</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  userIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userRole: {
    fontSize: 16,
    color: '#666',
    textTransform: 'capitalize',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f8f9fa',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingIcon: {
    width: 40,
    alignItems: 'center',
    marginRight: 15,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  versionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  copyrightText: {
    fontSize: 12,
    color: '#999',
  },
});

export default SettingsScreen;
