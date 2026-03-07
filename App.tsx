import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import TasksScreen from './src/screens/TasksScreen';
import WorldScreen from './src/screens/WorldScreen';
import { theme } from './src/theme/colors';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
              let iconName: keyof typeof Feather.glyphMap;

              if (route.name === 'Today') {
                iconName = 'check-circle';
              } else if (route.name === 'My Oasis') {
                iconName = 'sun';
              } else {
                iconName = 'circle';
              }

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
              //height: 60,
              elevation: 0, // removed shadow on android
              shadowOpacity: 0 // removed shadow on ios
            },
          })}
        >
          <Tab.Screen name="Today" component={TasksScreen} />
          <Tab.Screen name="My Oasis" component={WorldScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
