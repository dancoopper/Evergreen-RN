import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';

import TasksScreen from './src/screens/TasksScreen';
import WorldScreen from './src/screens/WorldScreen';
import LoginScreen from './src/screens/LoginScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

import { theme } from './src/theme/colors';
import { useStore } from './src/store/useStore';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// The main authenticated app with tabs
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Feather.glyphMap;
          if (route.name === 'Today') iconName = 'check-circle';
          else if (route.name === 'My Oasis') iconName = 'sun';
          else iconName = 'circle';
          return <Feather name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textLight,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
          paddingBottom: 5,
          paddingTop: 5,
          elevation: 0,
          shadowOpacity: 0
        },
      })}
    >
      <Tab.Screen name="Today" component={TasksScreen} />
      <Tab.Screen name="My Oasis" component={WorldScreen} />
    </Tab.Navigator>
  );
}

// Authentication Stack
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const user = useStore(state => state.user);
  const isOnboarded = useStore(state => state.isOnboarded);
  const [isInitializing, setIsInitializing] = useState(false); // We don't have an async background auth service here unless we add AsyncStorage checking.

  if (isInitializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {user ? (
          // Logged in
          (isOnboarded || user.isGuest) ? (
            <MainTabs /> // Logged in + Onboarded or Guest -> Give them the app
          ) : (
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            </Stack.Navigator>
          )
        ) : (
          // Not logged in
          <AuthStack />
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
