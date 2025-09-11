import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList } from '../types';
import LoginScreen from '../screens/LoginScreen';
import StudentSelectScreen from '../screens/StudentSelectScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import VideoSequenceScreen from '../screens/VideoSequenceScreen';
import VideoSelectionScreen from '../screens/VideoSelectionScreen';
import QuizScreen from '../screens/QuizScreen';
import ProgressScreen from '../screens/ProgressScreen';
import TeacherDashboardScreen from '../screens/TeacherDashboardScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="StudentSelect" 
          component={StudentSelectScreen} 
          options={{ 
            title: 'Select Student',
            headerBackTitle: 'Login'
          }}
        />
        <Stack.Screen 
          name="Categories" 
          component={CategoriesScreen} 
          options={{ title: 'Categories' }}
        />
        <Stack.Screen 
          name="VideoSequence" 
          component={VideoSequenceScreen} 
          options={{ title: 'Watch Videos' }}
        />
        <Stack.Screen 
          name="VideoSelection" 
          component={VideoSelectionScreen} 
          options={{ title: 'Choose Video' }}
        />
        <Stack.Screen 
          name="Quiz" 
          component={QuizScreen} 
          options={{ title: 'Quiz Time!' }}
        />
        <Stack.Screen 
          name="Progress" 
          component={ProgressScreen} 
          options={{ title: 'Progress Report' }}
        />
        <Stack.Screen 
          name="TeacherDashboard" 
          component={TeacherDashboardScreen} 
          options={{ title: 'Teacher Dashboard' }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{ title: 'Settings' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
