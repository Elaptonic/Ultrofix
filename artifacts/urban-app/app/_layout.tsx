import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { setBaseUrl } from "@workspace/api-client-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Font from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider, useAuth } from "@/context/auth";

setBaseUrl(`https://${process.env.EXPO_PUBLIC_DOMAIN}`);

// On web, ensure Inter fonts always have a system fallback so text is visible
// immediately even before expo-font finishes injecting the @font-face rules.
if (Platform.OS === "web" && typeof document !== "undefined") {
  const styleId = "ultrofix-font-fallback";
  if (!document.getElementById(styleId)) {
    const sysFont =
      'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      @font-face { font-family: "Inter_400Regular"; src: local("${sysFont}"); font-display: swap; }
      @font-face { font-family: "Inter_500Medium"; src: local("${sysFont}"); font-display: swap; font-weight: 500; }
      @font-face { font-family: "Inter_600SemiBold"; src: local("${sysFont}"); font-display: swap; font-weight: 600; }
      @font-face { font-family: "Inter_700Bold"; src: local("${sysFont}"); font-display: swap; font-weight: 700; }
    `;
    document.head.appendChild(style);
  }
}

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000,
    },
  },
});

function AuthGate() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "login" || segments[0] === "role-select";

    if (!isAuthenticated) {
      if (!inAuthGroup) {
        router.replace("/login");
      }
      return;
    }

    if (!user?.role) {
      if (segments[0] !== "role-select") {
        router.replace("/role-select");
      }
      return;
    }

    if (inAuthGroup) {
      if (user.role === "provider") {
        router.replace("/vendor/(tabs)/dashboard");
      } else {
        router.replace("/(tabs)");
      }
    }
  }, [isLoading, isAuthenticated, user, segments, router]);

  return null;
}

function RootLayoutNav() {
  return (
    <>
      <AuthGate />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" options={{ animation: "fade" }} />
        <Stack.Screen name="role-select" options={{ animation: "fade" }} />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="service/[id]" />
        <Stack.Screen name="booking/[id]" />
        <Stack.Screen name="category/[id]" />
        <Stack.Screen name="search" />
        <Stack.Screen name="address" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="vendor" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = Font.useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Don't block the UI on web if fonts take too long; fall back to system fonts.
  const [fontTimeoutElapsed, setFontTimeoutElapsed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setFontTimeoutElapsed(true), 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError || fontTimeoutElapsed) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError, fontTimeoutElapsed]);

  if (!fontsLoaded && !fontError && !fontTimeoutElapsed) {
    if (typeof window === "undefined") return null;
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AppProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <KeyboardProvider>
                  <RootLayoutNav />
                </KeyboardProvider>
              </GestureHandlerRootView>
            </AppProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
