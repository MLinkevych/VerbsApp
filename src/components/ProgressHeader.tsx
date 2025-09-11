import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { User } from '../types';

interface ProgressHeaderProps {
  currentUser: User | null;
}

const ProgressHeader: React.FC<ProgressHeaderProps> = ({ currentUser }) => {
  if (!currentUser) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Progress</Text>
        <Text style={styles.subtitle}>Loading user information...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.userInfo}>
        {currentUser.photo ? (
          <Image 
            source={{ uri: currentUser.photo }} 
            style={styles.userPhoto}
          />
        ) : (
          <View style={styles.placeholderPhoto}>
            <Text style={styles.placeholderText}>
              {currentUser.firstName?.charAt(0) || currentUser.name?.charAt(0) || '?'}
            </Text>
          </View>
        )}
        <View style={styles.userDetails}>
          <Text style={styles.userName}>
            {currentUser.firstName && currentUser.lastName 
              ? `${currentUser.firstName} ${currentUser.lastName}`
              : currentUser.name
            }
          </Text>
          <Text style={styles.userRole}>
            {currentUser.role === 'teacher' ? 'Teacher' : 'Student'} Progress
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  placeholderPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  placeholderText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 16,
    color: '#666',
  },
});

export default ProgressHeader;

