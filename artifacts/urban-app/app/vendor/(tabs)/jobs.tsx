import { Feather } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { type NewLead, useVendorSocket } from "@/hooks/useSocket";

const PROVIDER_ID = 1;

const STATUS_COLOR: Record<string, string> = {
  connecting: "#f59e0b",
  connected: "#22c55e",
  disconnected: "#94a3b8",
  error: "#ef4444",
};

const STATUS_LABEL: Record<string, string> = {
  connecting: "Connecting…",
  connected: "Online — Waiting for jobs",
  disconnected: "Offline",
  error: "Connection error",
};

const PAST_JOBS = [
  {
    id: 101,
    service: "Deep House Cleaning",
    customer: "Priya S.",
    date: "Today, 10:00 AM",
    amount: 1499,
    status: "completed",
  },
  {
    id: 102,
    service: "Plumbing Repair",
    customer: "Rahul M.",
    date: "Yesterday, 2:30 PM",
    amount: 899,
    status: "completed",
  },
  {
    id: 103,
    service: "Electrical Work",
    customer: "Anita K.",
    date: "Apr 14, 11:00 AM",
    amount: 1200,
    status: "completed",
  },
  {
    id: 104,
    service: "AC Servicing",
    customer: "Vikram P.",
    date: "Apr 13, 3:00 PM",
    amount: 750,
    status: "completed",
  },
];

export default function VendorJobsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [currentLead, setCurrentLead] = useState<NewLead | null>(null);
  const [isOnline, setIsOnline] = useState(false);

  const handleNewLead = useCallback((lead: NewLead) => {
    setCurrentLead(lead);
  }, []);

  const { status, acceptLead, denyLead } = useVendorSocket(
    isOnline ? PROVIDER_ID : null,
    handleNewLead,
  );

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
        ]),
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
  }, [status, pulse1, pulse2, pulse3]);

  const makePulseStyle = (anim: Animated.Value) => ({
    transform: [
      { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 3.2] }) },
    ],
    opacity: anim.interpolate({
      inputRange: [0, 0.3, 1],
      outputRange: [0, 0.3, 0],
    }),
  });

  const dotColor = isOnline ? STATUS_COLOR[status] ?? "#94a3b8" : "#94a3b8";

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + (Platform.OS === "web" ? 20 : 8),
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={[styles.pageTitle, { color: colors.foreground }]}>
            Jobs
          </Text>
          <Pressable
            onPress={() => setIsOnline((v) => !v)}
            style={[
              styles.toggleBtn,
              {
                backgroundColor: isOnline ? colors.primary : colors.muted,
              },
            ]}
          >
            <Text style={[styles.toggleLabel, { color: isOnline ? "#fff" : colors.mutedForeground }]}>
              {isOnline ? "Go Offline" : "Go Online"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.radarSection}>
          <View style={styles.radarWrap}>
            <Animated.View
              style={[
                styles.ring,
                { borderColor: dotColor },
                makePulseStyle(pulse1),
              ]}
            />
            <Animated.View
              style={[
                styles.ring,
                { borderColor: dotColor },
                makePulseStyle(pulse2),
              ]}
            />
            <Animated.View
              style={[
                styles.ring,
                { borderColor: dotColor },
                makePulseStyle(pulse3),
              ]}
            />
            <View style={[styles.centerDot, { backgroundColor: dotColor }]}>
              <Feather
                name={isOnline && status === "connected" ? "radio" : "wifi-off"}
                size={26}
                color="#fff"
              />
            </View>
          </View>

          <View
            style={[
              styles.statusCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={[styles.statusDot, { backgroundColor: dotColor }]} />
            <Text style={[styles.statusText, { color: colors.foreground }]}>
              {isOnline ? STATUS_LABEL[status] : "You are offline"}
            </Text>
          </View>

          {!isOnline && (
            <Text style={[styles.hint, { color: colors.mutedForeground }]}>
              Tap "Go Online" to start receiving job requests.
            </Text>
          )}
          {isOnline && status === "connected" && (
            <Text style={[styles.hint, { color: colors.mutedForeground }]}>
              You will receive job requests from nearby customers.
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Completed Jobs
          </Text>
          <View
            style={[
              styles.jobList,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            {PAST_JOBS.map((job, idx) => (
              <View key={job.id}>
                {idx > 0 && (
                  <View
                    style={[
                      styles.divider,
                      { backgroundColor: colors.border },
                    ]}
                  />
                )}
                <View style={styles.jobRow}>
                  <View
                    style={[
                      styles.jobIcon,
                      { backgroundColor: colors.primary + "12" },
                    ]}
                  >
                    <Feather name="tool" size={16} color={colors.primary} />
                  </View>
                  <View style={styles.jobInfo}>
                    <Text
                      style={[styles.jobService, { color: colors.foreground }]}
                    >
                      {job.service}
                    </Text>
                    <Text
                      style={[
                        styles.jobMeta,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      {job.customer} · {job.date}
                    </Text>
                  </View>
                  <Text style={[styles.jobAmount, { color: colors.foreground }]}>
                    ₹{job.amount}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={currentLead !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setCurrentLead(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <View
              style={[styles.modalHandle, { backgroundColor: colors.border }]}
            />
            <View
              style={[
                styles.leadBadge,
                { backgroundColor: colors.primary + "18" },
              ]}
            >
              <Feather name="zap" size={16} color={colors.primary} />
              <Text
                style={[styles.leadBadgeText, { color: colors.primary }]}
              >
                New Job Request
              </Text>
            </View>
            <Text style={[styles.leadService, { color: colors.foreground }]}>
              {currentLead?.serviceName}
            </Text>
            <View style={styles.leadRows}>
              <View style={styles.leadRow}>
                <Feather name="calendar" size={14} color={colors.mutedForeground} />
                <Text
                  style={[styles.leadRowText, { color: colors.mutedForeground }]}
                >
                  {currentLead?.date} · {currentLead?.time}
                </Text>
              </View>
              <View style={styles.leadRow}>
                <Feather name="map-pin" size={14} color={colors.mutedForeground} />
                <Text
                  style={[styles.leadRowText, { color: colors.mutedForeground }]}
                  numberOfLines={2}
                >
                  {currentLead?.address}
                </Text>
              </View>
              <View style={styles.leadRow}>
                <Feather name="credit-card" size={14} color={colors.mutedForeground} />
                <Text
                  style={[styles.leadRowText, { color: colors.foreground }]}
                >
                  ₹{currentLead?.price}
                </Text>
              </View>
            </View>
            <View style={styles.modalActions}>
              <Pressable
                onPress={() => {
                  if (currentLead) denyLead(currentLead);
                  setCurrentLead(null);
                }}
                style={({ pressed }) => [
                  styles.denyBtn,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.muted,
                  },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Feather name="x" size={18} color={colors.mutedForeground} />
                <Text
                  style={[
                    styles.denyBtnText,
                    { color: colors.mutedForeground },
                  ]}
                >
                  Deny
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (currentLead) acceptLead(currentLead);
                  setCurrentLead(null);
                }}
                style={({ pressed }) => [
                  styles.acceptBtn,
                  { backgroundColor: colors.primary },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Feather name="check" size={18} color="#fff" />
                <Text style={styles.acceptBtnText}>Accept Job</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  pageTitle: { fontSize: 26, fontFamily: "Inter_700Bold" },
  toggleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  toggleLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  radarSection: {
    alignItems: "center",
    paddingVertical: 16,
    paddingBottom: 24,
  },
  radarWrap: {
    alignItems: "center",
    justifyContent: "center",
    height: 200,
    width: 200,
    marginBottom: 24,
  },
  ring: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
  },
  centerDot: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    width: "85%",
  },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  hint: {
    textAlign: "center",
    paddingHorizontal: 36,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    marginBottom: 4,
  },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold", marginBottom: 12 },
  jobList: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  jobRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  divider: { height: StyleSheet.hairlineWidth, marginHorizontal: 16 },
  jobIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  jobInfo: { flex: 1 },
  jobService: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  jobMeta: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  jobAmount: { fontSize: 14, fontFamily: "Inter_700Bold" },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 4,
  },
  leadBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  leadBadgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  leadService: { fontSize: 22, fontFamily: "Inter_700Bold" },
  leadRows: { gap: 10 },
  leadRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  leadRowText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  modalActions: { flexDirection: "row", gap: 12, marginTop: 4 },
  denyBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    borderRadius: 14,
    borderWidth: 1,
  },
  denyBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  acceptBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    borderRadius: 14,
  },
  acceptBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
