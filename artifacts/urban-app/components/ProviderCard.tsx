import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { Provider } from "@/constants/data";

interface ProviderCardProps {
  provider: Provider;
}

export function ProviderCard({ provider }: ProviderCardProps) {
  const colors = useColors();

  const avatarColors = [
    "#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899",
  ];
  const avatarColor = avatarColors[parseInt(provider.id.replace("p", "")) % avatarColors.length];

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={[styles.avatar, { backgroundColor: avatarColor + "22" }]}>
        <Text style={[styles.avatarText, { color: avatarColor }]}>
          {provider.avatar}
        </Text>
      </View>
      {provider.verified && (
        <View style={[styles.verifiedBadge, { backgroundColor: colors.success + "22" }]}>
          <Feather name="check-circle" size={10} color={colors.success ?? "#22c55e"} />
          <Text style={[styles.verifiedText, { color: colors.success ?? "#22c55e" }]}>
            Verified
          </Text>
        </View>
      )}
      <Text style={[styles.name, { color: colors.foreground }]}>
        {provider.name}
      </Text>
      <View style={styles.ratingRow}>
        <Feather name="star" size={12} color="#f59e0b" />
        <Text style={[styles.rating, { color: colors.foreground }]}>
          {provider.rating}
        </Text>
        <Text style={[styles.reviews, { color: colors.mutedForeground }]}>
          ({provider.reviewCount})
        </Text>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.foreground }]}>
            {provider.jobsCompleted.toLocaleString()}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
            Jobs
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.foreground }]}>
            {provider.experience}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
            Exp.
          </Text>
        </View>
      </View>
      <View style={styles.tags}>
        {provider.specializations.slice(0, 2).map((spec) => (
          <View
            key={spec}
            style={[styles.tag, { backgroundColor: colors.muted }]}
          >
            <Text style={[styles.tagText, { color: colors.mutedForeground }]}>
              {spec}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 160,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  verifiedText: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
  },
  name: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  rating: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  reviews: {
    fontSize: 11,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
  },
  stat: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 10,
  },
  statDivider: {
    width: 1,
    height: 24,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    justifyContent: "center",
    marginTop: 2,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 10,
  },
});
