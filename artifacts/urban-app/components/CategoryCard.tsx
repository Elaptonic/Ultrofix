import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface CategoryCardProps {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  serviceCount: number;
}

export function CategoryCard({
  id,
  name,
  icon,
  color,
  bgColor,
  serviceCount,
}: CategoryCardProps) {
  const colors = useColors();
  const router = useRouter();

  const handlePress = () => {
    if (Platform.OS !== "web") Haptics.selectionAsync();
    router.push(`/category/${id}`);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && { opacity: 0.85, transform: [{ scale: 0.96 }] },
      ]}
    >
      <View style={[styles.iconBg, { backgroundColor: bgColor }]}>
        <Feather name={icon as any} size={22} color={color} />
      </View>
      <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
        {name}
      </Text>
      <Text style={[styles.count, { color: colors.mutedForeground }]}>
        {serviceCount} services
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 90,
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
  count: {
    fontSize: 10,
    textAlign: "center",
  },
});
