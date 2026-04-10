import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import UsageScreen from '../screens/UsageScreen';
import DevicesScreen from '../screens/DevicesScreen';
import GamificationScreen from '../screens/GamificationScreen';
import TipsScreen from '../screens/TipsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DatasetAnalysisScreen from '../screens/DatasetAnalysisScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TEAL = '#00C9A7';
const DARK = '#0d1117';

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#161b22',
          borderTopColor: '#30363d',
          borderTopWidth: 1,
          paddingBottom: 6,
          paddingTop: 6,
          height: 60,
        },
        tabBarActiveTintColor: TEAL,
        tabBarInactiveTintColor: '#6e7681',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Home: focused ? 'home' : 'home-outline',
            Usage: focused ? 'flash' : 'flash-outline',
            Devices: focused ? 'hardware-chip' : 'hardware-chip-outline',
            Gamification: focused ? 'trophy' : 'trophy-outline',
            Tips: focused ? 'leaf' : 'leaf-outline',
            Analysis: focused ? 'analytics' : 'analytics-outline',
            Profile: focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Usage" component={UsageScreen} />
      <Tab.Screen name="Devices" component={DevicesScreen} />
      <Tab.Screen name="Gamification" component={GamificationScreen} />
      <Tab.Screen name="Tips" component={TipsScreen} />
      <Tab.Screen name="Analysis" component={DatasetAnalysisScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: DARK }}>
        <ActivityIndicator size="large" color={TEAL} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
