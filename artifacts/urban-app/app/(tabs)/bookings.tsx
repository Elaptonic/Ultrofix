import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useListBookings } from "@workspace/api-client-react";

import { BookingCard } from "@/components/BookingCard";
import { useColors } from "@/hooks/useColors";
import { useUserId } from "@/constants/user";

const TABS = ["Upcoming", "Completed", "Cancelled"] as const;
type Tab = typeof TABS[number];

export default function BookingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isIOS = Platform.OS === "ios";
  const [activeTab, setActiveTab] = useState<Tab>("Upcoming");
  const userId = useUserId();

  const { data: bookings, isLoading } = useListBookings({ userId });

  const filteredBookings = (bookings ?? []).filter((b) => {
    if (activeTab === "Upcoming") return b.status === "upcoming";
    if (activeTab === "Completed") return b.status === "completed";
    return b.status === "cancelled";
  });

  const HeaderEl = (
    <View style={styles.headerInner}>
      <Text style={[styles.title, { color: colors.foreground }]}>My Bookings</Text>
      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tab,
              activeTab === tab
                ? { backgroundColor: colors.primary }
                : { backgroundColor: colors.glass, borderColor: colors.glassBorder, borderWidth: StyleSheet.hairlineWidth },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === tab ? "#fff" : colors.mutedForeground },
              ]}
            >
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {isIOS ? (
        <BlurView
          intensity={70}
          tint="light"
          style={[styles.header, { paddingTop: insets.top + 16 }]}
        >
          {HeaderEl}
        </BlurView>
      ) : (
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.card,
              paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 16,
              borderBottomColor: colors.border,
              borderBottomWidth: StyleSheet.hairlineWidth,
            },
          ]}
        >
          {HeaderEl}
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : filteredBookings.length === 0 ? (
          <View style={styles.empty}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.glass }]}>
              <Feather name="calendar" size={36} color={colors.mutedForeground} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No {activeTab.toLowerCase()} bookings
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              {activeTab === "Upcoming"
                ? "Book a service to get started"
                : `Your ${activeTab.toLowerCase()} bookings will appear here`}
            </Text>
          </View>
        ) : (
          filteredBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerInner: {},
  title: { fontSize: 24, fontFamily: "Inter_700Bold", marginBottom: 16 },
  tabs: { flexDirection: "row", gap: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20 },
  tabText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  center: { alignItems: "center", paddingTop: 80 },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptyDesc: { fontSize: 14, textAlign: "center", paddingHorizontal: 40 },
});
