import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Text } from 'react-native';
import { colors } from '../../constants/colors';
import { ja } from '../../constants/translations';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary.light,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: ja.tabs.home,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="input"
        options={{
          title: ja.tabs.input,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calculator" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="result"
        options={{
          title: ja.tabs.result,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="clipboard" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.background.dark,
    borderTopColor: colors.divider,
    height: 60,
    paddingBottom: 5,
    paddingTop: 5,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});