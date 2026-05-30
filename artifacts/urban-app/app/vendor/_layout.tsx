import { Stack } from "expo-router";
import React from "react";

export default function VendorLayout() {
  return (
    <Stack
      screenOptions={{ headerShown: false }}
      initialRouteName="(tabs)"
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="radar" />
      <Stack.Screen name="onboarding" options={{ animation: "slide_from_right" }} />
    </Stack>
  );
}
