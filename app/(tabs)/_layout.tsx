import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Text, View } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
  headerShown: false,

  tabBarStyle: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    elevation: 10,
  },

  tabBarActiveTintColor: '#06B6D4',
  tabBarInactiveTintColor: '#94A3B8',

  tabBarLabelStyle: {
    fontSize: 12,
    marginBottom: 4,
  },
}}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="learning-journey"
        options={{
          title: "Learn",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
  name="challenges"
  options={{
    title: 'Play',

    tabBarIcon: ({ focused }) => (
      <View
        style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: '#06B6D4',

          justifyContent: 'center',
          alignItems: 'center',

          marginTop: -22,

          shadowColor: '#06B6D4',
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.18,
          shadowRadius: 6,

          elevation: 8,
        }}
      >
        <Ionicons
          name="game-controller"
          size={34}
          color="#fff"
        />
      </View>
    ),

    tabBarLabel: ({ focused }) => (
      <Text
        style={{
          color: focused
            ? '#06B6D4'
            : '#64748B',
          fontSize: 12,
          marginTop: 6,
          marginBottom: 4,
        }}
      >
        Play
      </Text>
    ),
  }}
/>
      
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Ranks",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" color={color} size={size} />
          ),
        }}
      />

    </Tabs>
  );
}
