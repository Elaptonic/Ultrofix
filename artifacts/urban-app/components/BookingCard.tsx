import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  useUpdateBooking,
  getListBookingsQueryKey,
  Booking,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

import { useColors } from "@/hooks/useColors";
import { USER_ID } from "@/constants/user";

interface BookingCardProps {
  booking: Booking;
}

export function BookingCard({ booking }: BookingCardProps) {
  const colors = useColors();
  const queryClient = useQueryClient();
  const updateBooking = useUpdateBooking({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getListBookingsQueryKey({ userId: USER_ID }),
        });
      },
    },
  });
  const [localRating, setLocalRating] = useState<number>(booking.rating ?? 0);

  const getStatusColor = () => {
    switch (booking.status) {
      case "upcoming":
        return { bg: "#dbeafe", text: "#3b82f6" };
      case "completed":
        return { bg: "#d1fae5", text: "#10b981" };
      case "cancelled":
        return { bg: "#fee2e2", text: "#ef4444" };
    }
  };
  const statusStyle = getStatusColor();

  const handleCancel = () => {
    if (Platform.OS !== "web") {
      Alert.alert("Cancel Booking", "Are you sure you want to cancel?", [
        { text: "No" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () => {
            updateBooking.mutate({ id: booking.id, data: { status: "cancelled" } });
            if (Platform.OS !== "web")
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ]);
    } else {
      updateBooking.mutate({ id: booking.id, data: { status: "cancelled" } });
    }
  };

  const handleRate = (stars: number) => {
    setLocalRating(stars);
    updateBooking.mutate({ id: booking.id, data: { rating: stars } });
    if (Platform.OS !== "web")
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const formattedDate = new Date(booking.date).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <View
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={styles.header}>
        <View style={styles.providerRow}>
          <View style={[styles.avatar, { backgroundColor: colors.primary + "22" }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>
              {booking.providerInitials}
            </Text>
          </View>
          <View style={styles.providerInfo}>
            <Text style={[styles.serviceName, { color: colors.foreground }]}>
              {booking.serviceName}
            </Text>
            <Text style={[styles.providerName, { color: colors.mutedForeground }]}>
              by {booking.providerName}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Feather name="calendar" size={14} color={colors.mutedForeground} />
          <Text style={[styles.detailText, { color: colors.foreground }]}>
            {formattedDate} · {booking.time}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Feather name="map-pin" size={14} color={colors.mutedForeground} />
          <Text
            style={[styles.detailText, { color: colors.foreground }]}
            numberOfLines={1}
          >
            {booking.address}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Feather name="tag" size={14} color={colors.mutedForeground} />
          <Text style={[styles.priceText, { color: colors.primary }]}>
            ₹{booking.price}
          </Text>
        </View>
      </View>

      {booking.status === "completed" && (
        <View style={styles.ratingSection}>
          <Text style={[styles.rateLabel, { color: colors.mutedForeground }]}>
            Rate your experience
          </Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable key={star} onPress={() => handleRate(star)} hitSlop={4}>
                <Feather
                  name="star"
                  size={22}
                  color={star <= localRating ? "#f59e0b" : colors.border}
                />
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {booking.status === "upcoming" && (
        <Pressable
          onPress={handleCancel}
          style={({ pressed }) => [
            styles.cancelBtn,
            { borderColor: colors.destructive },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={[styles.cancelText, { color: colors.destructive }]}>
            Cancel Booking
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  providerRow: { flexDirection: "row", alignItems: "center", flex: 1, gap: 10 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  providerInfo: { flex: 1 },
  serviceName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  providerName: { fontSize: 12, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  divider: { height: 1, marginVertical: 12 },
  details: { gap: 8 },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  detailText: { fontSize: 13, flex: 1 },
  priceText: { fontSize: 15, fontFamily: "Inter_700Bold" },
  ratingSection: { marginTop: 14, alignItems: "center", gap: 8 },
  rateLabel: { fontSize: 13 },
  stars: { flexDirection: "row", gap: 8 },
  cancelBtn: {
    marginTop: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  cancelText: { fontSize: 14, fontFamily: "Inter_500Medium" },
});
