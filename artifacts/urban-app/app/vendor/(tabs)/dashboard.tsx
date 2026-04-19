import { Icon as Feather } from "@/components/Icon";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/auth";
import { useColors } from "@/hooks/useColors";

interface StatCard {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  value: string;
  sub: string;
  color: string;
}

const RECENT_JOBS = [
  {
    id: 1,
    service: "Deep House Cleaning",
    customer: "Priya S.",
    date: "Today, 10:00 AM",
    amount: 1499,
    status: "completed",
  },
  {
    id: 2,
    service: "Plumbing Repair",
    customer: "Rahul M.",
    date: "Yesterday, 2:30 PM",
    amount: 899,
    status: "completed",
  },
  {
    id: 3,
    service: "Electrical Work",
    customer: "Anita K.",
    date: "Apr 14, 11:00 AM",
    amount: 1200,
    status: "completed",
  },
];

const STATUS_COLOR: Record<string, string> = {
  completed: "#22c55e",
  pending: "#f59e0b",
  cancelled: "#ef4444",
};

export default function VendorDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(false);

  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}`
    : "Provider";

  const stats: StatCard[] = [
    {
      icon: "briefcase",
      label: "Jobs Today",
      value: "3",
      sub: "+2 from yesterday",
      color: colors.primary,
    },
    {
      icon: "dollar-sign",
      label: "Today's Earnings",
      value: "₹3,598",
      sub: "Across 3 jobs",
      color: "#22c55e",
    },
    {
      icon: "star",
      label: "Rating",
      value: "4.8",
      sub: "Based on 124 reviews",
      color: "#f59e0b",
    },
    {
      icon: "trending-up",
      label: "This Month",
      value: "₹28,400",
      sub: "22 jobs completed",
      color: "#8b5cf6",
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: insets.top + (Platform.OS === "web" ? 20 : 8),
        paddingBottom: insets.bottom + 100,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
            Welcome back
          </Text>
          <Text style={[styles.name, { color: colors.foreground }]}>
            {displayName}
          </Text>
        </View>
        <Pressable
          onPress={() => setIsOnline((v) => !v)}
          style={[
            styles.onlinePill,
            {
              backgroundColor: isOnline
                ? "#dcfce7"
                : colors.muted,
            },
          ]}
        >
          <View
            style={[
              styles.onlineDot,
              { backgroundColor: isOnline ? "#22c55e" : colors.mutedForeground },
            ]}
          />
          <Text
            style={[
              styles.onlineLabel,
              { color: isOnline ? "#16a34a" : colors.mutedForeground },
            ]}
          >
            {isOnline ? "Online" : "Go Online"}
          </Text>
        </Pressable>
      </View>

      {isOnline && (
        <View
          style={[
            styles.onlineBanner,
            { backgroundColor: "#dcfce7", borderColor: "#86efac" },
          ]}
        >
          <Feather name="zap" size={14} color="#16a34a" />
          <Text style={[styles.onlineBannerText, { color: "#16a34a" }]}>
            You're live — go to Jobs tab to receive requests
          </Text>
        </View>
      )}

      <View style={styles.statsGrid}>
        {stats.map((s, i) => (
          <View
            key={i}
            style={[
              styles.statCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View
              style={[
                styles.statIcon,
                { backgroundColor: s.color + "18" },
              ]}
            >
              <Feather name={s.icon} size={18} color={s.color} />
            </View>
            <Text style={[styles.statValue, { color: colors.foreground }]}>
              {s.value}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
              {s.label}
            </Text>
            <Text style={[styles.statSub, { color: colors.mutedForeground }]}>
              {s.sub}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Recent Jobs
          </Text>
          <Feather name="clock" size={16} color={colors.mutedForeground} />
        </View>

        <View
          style={[
            styles.jobList,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {RECENT_JOBS.map((job, idx) => (
            <View key={job.id}>
              {idx > 0 && (
                <View
                  style={[styles.divider, { backgroundColor: colors.border }]}
                />
              )}
              <View style={styles.jobRow}>
                <View
                  style={[
                    styles.jobIconWrap,
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
                <View style={styles.jobRight}>
                  <Text
                    style={[styles.jobAmount, { color: colors.foreground }]}
                  >
                    ₹{job.amount}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          STATUS_COLOR[job.status] + "18",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: STATUS_COLOR[job.status] },
                      ]}
                    >
                      {job.status}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Performance
        </Text>
        <View
          style={[
            styles.perfCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {[
            { label: "Acceptance Rate", value: "94%", icon: "check-circle" as const, color: "#22c55e" },
            { label: "On-time Arrival", value: "98%", icon: "clock" as const, color: colors.primary },
            { label: "Repeat Customers", value: "67%", icon: "users" as const, color: "#8b5cf6" },
          ].map((item, i) => (
            <View key={i} style={styles.perfRow}>
              <View style={styles.perfLeft}>
                <Feather name={item.icon} size={16} color={item.color} />
                <Text
                  style={[styles.perfLabel, { color: colors.mutedForeground }]}
                >
                  {item.label}
                </Text>
              </View>
              <Text style={[styles.perfValue, { color: item.color }]}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular" },
  name: { fontSize: 22, fontFamily: "Inter_700Bold", marginTop: 2 },
  onlinePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  onlineDot: { width: 8, height: 8, borderRadius: 4 },
  onlineLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  onlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  onlineBannerText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: "46.5%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 4,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  statSub: { fontSize: 11, fontFamily: "Inter_400Regular" },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  jobList: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  jobRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  divider: { height: StyleSheet.hairlineWidth, marginHorizontal: 16 },
  jobIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  jobInfo: { flex: 1 },
  jobService: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  jobMeta: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  jobRight: { alignItems: "flex-end", gap: 4 },
  jobAmount: { fontSize: 14, fontFamily: "Inter_700Bold" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  perfCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginTop: 12,
  },
  perfRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  perfLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  perfLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  perfValue: { fontSize: 15, fontFamily: "Inter_700Bold" },
});
