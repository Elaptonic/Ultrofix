import { Feather } from "@expo/vector-icons";
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

import { useColors } from "@/hooks/useColors";

const PERIODS = ["Week", "Month", "Year"] as const;
type Period = (typeof PERIODS)[number];

const EARNINGS_DATA: Record<Period, { total: string; jobs: number; avg: string; payouts: Array<{ date: string; amount: number; jobs: number }> }> = {
  Week: {
    total: "₹8,598",
    jobs: 6,
    avg: "₹1,433",
    payouts: [
      { date: "Today", amount: 1499, jobs: 1 },
      { date: "Yesterday", amount: 899, jobs: 1 },
      { date: "Mon", amount: 2400, jobs: 2 },
      { date: "Sun", amount: 1800, jobs: 1 },
      { date: "Sat", amount: 2000, jobs: 1 },
    ],
  },
  Month: {
    total: "₹28,400",
    jobs: 22,
    avg: "₹1,291",
    payouts: [
      { date: "Week 3", amount: 8598, jobs: 6 },
      { date: "Week 2", amount: 7200, jobs: 5 },
      { date: "Week 1", amount: 6900, jobs: 5 },
      { date: "Week 0", amount: 5702, jobs: 6 },
    ],
  },
  Year: {
    total: "₹3,12,800",
    jobs: 248,
    avg: "₹1,261",
    payouts: [
      { date: "Q1 2026", amount: 78400, jobs: 62 },
      { date: "Q4 2025", amount: 92000, jobs: 73 },
      { date: "Q3 2025", amount: 82000, jobs: 65 },
      { date: "Q2 2025", amount: 60400, jobs: 48 },
    ],
  },
};

const BAR_COLORS = ["#f97316", "#fb923c", "#fdba74", "#fed7aa", "#ffedd5"];

export default function VendorEarningsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<Period>("Month");

  const data = EARNINGS_DATA[period];
  const maxAmount = Math.max(...data.payouts.map((p) => p.amount));

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: insets.top + (Platform.OS === "web" ? 20 : 8),
        paddingBottom: insets.bottom + 100,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.pageTitle, { color: colors.foreground }]}>
        Earnings
      </Text>

      <View style={[styles.periodRow, { backgroundColor: colors.muted }]}>
        {PERIODS.map((p) => (
          <Pressable
            key={p}
            onPress={() => setPeriod(p)}
            style={[
              styles.periodBtn,
              period === p && {
                backgroundColor: colors.card,
                shadowColor: "#000",
                shadowOpacity: 0.08,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
              },
            ]}
          >
            <Text
              style={[
                styles.periodLabel,
                {
                  color:
                    period === p ? colors.foreground : colors.mutedForeground,
                  fontFamily:
                    period === p ? "Inter_600SemiBold" : "Inter_400Regular",
                },
              ]}
            >
              {p}
            </Text>
          </Pressable>
        ))}
      </View>

      <View
        style={[
          styles.summaryCard,
          { backgroundColor: colors.primary, shadowColor: colors.primary },
        ]}
      >
        <Text style={styles.summaryLabel}>Total Earned</Text>
        <Text style={styles.summaryTotal}>{data.total}</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Feather name="briefcase" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.summaryItemText}>{data.jobs} jobs</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Feather name="trending-up" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.summaryItemText}>{data.avg} avg</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Breakdown
        </Text>
        <View
          style={[
            styles.chartCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.barsRow}>
            {data.payouts.map((p, i) => {
              const barHeight = Math.max(8, (p.amount / maxAmount) * 120);
              return (
                <View key={i} style={styles.barCol}>
                  <Text
                    style={[styles.barAmount, { color: colors.mutedForeground }]}
                  >
                    ₹{p.amount >= 1000 ? (p.amount / 1000).toFixed(0) + "k" : p.amount}
                  </Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: barHeight,
                          backgroundColor: BAR_COLORS[i % BAR_COLORS.length],
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[styles.barLabel, { color: colors.mutedForeground }]}
                  >
                    {p.date}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Payout History
        </Text>
        <View
          style={[
            styles.payoutList,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {data.payouts.map((p, idx) => (
            <View key={idx}>
              {idx > 0 && (
                <View
                  style={[styles.divider, { backgroundColor: colors.border }]}
                />
              )}
              <View style={styles.payoutRow}>
                <View
                  style={[
                    styles.payoutIcon,
                    { backgroundColor: colors.primary + "15" },
                  ]}
                >
                  <Feather name="arrow-up-right" size={16} color={colors.primary} />
                </View>
                <View style={styles.payoutInfo}>
                  <Text
                    style={[styles.payoutDate, { color: colors.foreground }]}
                  >
                    {p.date}
                  </Text>
                  <Text
                    style={[
                      styles.payoutJobs,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    {p.jobs} {p.jobs === 1 ? "job" : "jobs"} completed
                  </Text>
                </View>
                <Text
                  style={[styles.payoutAmount, { color: "#22c55e" }]}
                >
                  +₹{p.amount.toLocaleString("en-IN")}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Payment Method
        </Text>
        <View
          style={[
            styles.bankCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.bankIcon,
              { backgroundColor: colors.primary + "15" },
            ]}
          >
            <Feather name="credit-card" size={20} color={colors.primary} />
          </View>
          <View style={styles.bankInfo}>
            <Text style={[styles.bankName, { color: colors.foreground }]}>
              HDFC Bank ••••4521
            </Text>
            <Text style={[styles.bankSub, { color: colors.mutedForeground }]}>
              Savings Account · Linked
            </Text>
          </View>
          <Feather name="check-circle" size={18} color="#22c55e" />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pageTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  periodRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  periodBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 10,
  },
  periodLabel: { fontSize: 14 },
  summaryCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    marginBottom: 28,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  summaryLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    marginBottom: 4,
  },
  summaryTotal: {
    color: "#fff",
    fontSize: 34,
    fontFamily: "Inter_700Bold",
    marginBottom: 16,
  },
  summaryRow: { flexDirection: "row", alignItems: "center" },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  summaryItemText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  summaryDivider: {
    width: 1,
    height: 14,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginHorizontal: 16,
  },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    marginBottom: 12,
  },
  chartCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  barsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    gap: 8,
    height: 160,
  },
  barCol: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
  },
  barTrack: {
    width: "100%",
    height: 120,
    justifyContent: "flex-end",
  },
  bar: {
    width: "100%",
    borderRadius: 6,
    minHeight: 8,
  },
  barAmount: { fontSize: 10, fontFamily: "Inter_400Regular" },
  barLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  payoutList: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  payoutRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  divider: { height: StyleSheet.hairlineWidth, marginHorizontal: 16 },
  payoutIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  payoutInfo: { flex: 1 },
  payoutDate: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  payoutJobs: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  payoutAmount: { fontSize: 15, fontFamily: "Inter_700Bold" },
  bankCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  bankIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  bankInfo: { flex: 1 },
  bankName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  bankSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
});
