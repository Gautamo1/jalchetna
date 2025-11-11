import { Stack } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(gov)" />
      <Stack.Screen name="(ngo)" />
      <Stack.Screen name="(researcher)" />
    </Stack>
  );
}
