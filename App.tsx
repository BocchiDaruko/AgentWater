import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { WaterProvider } from '../src/context/WaterContext';
import { useNotifications } from '../src/hooks/useNotifications';
import HomeScreen from '../src/screens/HomeScreen';
import StatsScreen from '../src/screens/StatsScreen';
import SettingsScreen from '../src/screens/SettingsScreen';
import OnboardingScreen from '../src/screens/OnboardingScreen';
import { COLORS } from '../src/utils/constants';

const Tab = createBottomTabNavigator();

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <View style={[tabStyles.icon, focused && tabStyles.iconActive]}>
      <Text style={tabStyles.emoji}>{emoji}</Text>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  icon: { alignItems: 'center', justifyContent: 'center', padding: 6, borderRadius: 12 },
  iconActive: { backgroundColor: COLORS.droplet },
  emoji: { fontSize: 22 },
});

function AppTabs() {
  useNotifications();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: COLORS.ocean,
          shadowOpacity: 0.15,
          shadowRadius: 20,
          height: 80,
          paddingBottom: 16,
        },
        tabBarActiveTintColor: COLORS.ocean,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Hydrate',
          tabBarIcon: ({ focused }) => <TabIcon emoji="💧" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          tabBarLabel: 'Progress',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('agentwater_onboarded').then((val) => {
      setOnboardingDone(val === 'true');
    });
  }, []);

  const handleOnboardingComplete = async () => {
    await AsyncStorage.setItem('agentwater_onboarded', 'true');
    setOnboardingDone(true);
  };

  if (onboardingDone === null) return null; // Loading

  return (
    <WaterProvider>
      <StatusBar style="light" />
      <NavigationContainer>
        {!onboardingDone ? (
          <OnboardingScreen onComplete={handleOnboardingComplete} />
        ) : (
          <AppTabs />
        )}
      </NavigationContainer>
    </WaterProvider>
  );
}
