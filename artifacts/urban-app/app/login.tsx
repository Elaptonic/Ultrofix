import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/context/auth";

export default function LoginScreen() {
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    await login();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.hero}>
          <View style={styles.logoContainer}>
            <Feather name="home" size={48} color="#fff" />
          </View>
          <Text style={styles.appName}>Ultrofix</Text>
          <Text style={styles.tagline}>Professional home services at your doorstep</Text>
        </View>

        <View style={styles.features}>
          {[
            { icon: "check-circle" as const, text: "Verified professionals" },
            { icon: "shield" as const, text: "Safe & secure service" },
            { icon: "star" as const, text: "Top-rated providers" },
          ].map((item) => (
            <View key={item.text} style={styles.featureRow}>
              <Feather name={item.icon} size={20} color="#f97316" />
              <Text style={styles.featureText}>{item.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [styles.loginButton, pressed && styles.loginButtonPressed]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.loginButtonText}>Continue</Text>
                <Feather name="arrow-right" size={20} color="#fff" />
              </>
            )}
          </Pressable>
          <Text style={styles.disclaimer}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
    justifyContent: "space-between",
  },
  hero: {
    alignItems: "center",
    paddingTop: 64,
    gap: 16,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: "#f97316",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#f97316",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  appName: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
  },
  features: {
    gap: 16,
    paddingVertical: 32,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff7ed",
    padding: 16,
    borderRadius: 12,
  },
  featureText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: "#374151",
  },
  footer: {
    gap: 16,
  },
  loginButton: {
    backgroundColor: "#f97316",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#f97316",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  disclaimer: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 18,
  },
});
