import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
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

const NOTIFICATIONS = [
  {
    id: "n1",
    icon: "check-circle",
    iconColor: "#10b981",
    title: "Booking Confirmed",
    body: "Your Home Deep Cleaning booking is confirmed for Apr 15 at 10:00 AM.",
    time: "2 min ago",
    read: false,
  },
  {
    id: "n2",
    icon: "star",
    iconColor: "#f59e0b",
    title: "Rate Your Experience",
    body: "How was your Fan Installation by Vikram Singh? Please rate your experience.",
    time: "2 days ago",
    read: false,
  },
  {
    id: "n3",
    icon: "gift",
    iconColor: "#8b5cf6",
    title: "Exclusive Offer",
    body: "Get 20% off on your next salon booking. Use code: SALON20",
    time: "4 days ago",
    read: true,
  },
  {
    id: "n4",
    icon: "clock",
    iconColor: "#3b82f6",
    title: "Booking Reminder",
    body: "Your Women's Haircut is tomorrow at 2:00 PM. Our professional is on their way.",
    time: "5 days ago",
    read: true,
  },
];

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const unreadCount = NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.card,
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 12,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Pressable onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Notifications
          </Text>
          {unreadCount > 0 && (
            <Text style={[styles.unread, { color: colors.primary }]}>
              {unreadCount} unread
            </Text>
          )}
        </View>
        <Pressable>
          <Text style={[styles.markRead, { color: colors.primary }]}>
            Mark all read
          </Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 20,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {NOTIFICATIONS.map((notif) => (
          <Pressable
            key={notif.id}
            style={({ pressed }) => [
              styles.notifItem,
              {
                backgroundColor: !notif.read ? colors.accent : colors.card,
                borderColor: !notif.read ? colors.primary + "40" : colors.border,
              },
              pressed && { opacity: 0.85 },
            ]}
          >
            <View
              style={[
                styles.notifIcon,
                { backgroundColor: notif.iconColor + "22" },
              ]}
            >
              <Feather name={notif.icon as any} size={20} color={notif.iconColor} />
            </View>
            <View style={styles.notifContent}>
              <View style={styles.notifTitleRow}>
                <Text style={[styles.notifTitle, { color: colors.foreground }]}>
                  {notif.title}
                </Text>
                {!notif.read && (
                  <View
                    style={[styles.unreadDot, { backgroundColor: colors.primary }]}
                  />
                )}
              </View>
              <Text
                style={[styles.notifBody, { color: colors.mutedForeground }]}
                numberOfLines={2}
              >
                {notif.body}
              </Text>
              <Text style={[styles.notifTime, { color: colors.mutedForeground }]}>
                {notif.time}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
  },
  unread: {
    fontSize: 11,
  },
  markRead: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 10,
  },
  notifItem: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  notifIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  notifContent: {
    flex: 1,
    gap: 4,
  },
  notifTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  notifTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  notifBody: {
    fontSize: 13,
    lineHeight: 19,
  },
  notifTime: {
    fontSize: 11,
  },
});
