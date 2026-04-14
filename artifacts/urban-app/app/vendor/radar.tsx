import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useVendorSocket } from "@/hooks/useSocket";

const PROVIDER_ID = 1;

const STATUS_LABEL: Record<string, string> = {
  connecting: "Connecting…",
  connected: "Online — Waiting for jobs",
  disconnected: "Offline",
  error: "Connection error",
};

const STATUS_COLOR: Record<string, string> = {
  connecting: "#f59e0b",
  connected: "#22c55e",
  disconnected: "#8896aa",
  error: "#ef4444",
};

export default function RadarScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { status } = useVendorSocket(PROVIDER_ID);

  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;
  const pulse3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status !== "connected") {
      pulse1.setValue(0);
      pulse2.setValue(0);
      pulse3.setValue(0);
      return;
    }

    const makePulse = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );

    const a1 = makePulse(pulse1, 0);
    const a2 = makePulse(pulse2, 600);
    const a3 = makePulse(pulse3, 1200);
    a1.start();
    a2.start();
    a3.start();

    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, [status]);

  const makePulseStyle = (anim: Animated.Value) => ({
    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 3] }) }],
    opacity: anim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 0.35, 0] }),
  });

  const dotColor = STATUS_COLOR[status] ?? "#8896aa";

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + (Platform.OS === "web" ? 20 : 0),
          paddingBottom: insets.bottom + 24,
        },
      ]}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Provider Radar</Text>
        <View style={{ width: 34 }} />
      </View>

      <View style={styles.radarWrap}>
        <Animated.View style={[styles.ring, { borderColor: dotColor }, makePulseStyle(pulse1)]} />
        <Animated.View style={[styles.ring, { borderColor: dotColor }, makePulseStyle(pulse2)]} />
        <Animated.View style={[styles.ring, { borderColor: dotColor }, makePulseStyle(pulse3)]} />

        <View style={[styles.centerDot, { backgroundColor: dotColor }]}>
          <Feather
            name={status === "connected" ? "radio" : "wifi-off"}
            size={28}
            color="#fff"
          />
        </View>
      </View>

      <View style={[styles.statusCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.statusDot, { backgroundColor: dotColor }]} />
        <Text style={[styles.statusText, { color: colors.foreground }]}>
          {STATUS_LABEL[status]}
        </Text>
      </View>

      <Text style={[styles.hint, { color: colors.mutedForeground }]}>
        You will receive job requests here when consumers book your service.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  radarWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 48,
    marginBottom: 48,
    height: 260,
  },
  ring: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
  },
  centerDot: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 24,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusText: { fontSize: 15, fontFamily: "Inter_500Medium" },
  hint: {
    textAlign: "center",
    paddingHorizontal: 36,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
});
