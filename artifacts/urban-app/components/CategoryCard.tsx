import { Icon as Feather } from "@/components/Icon";
import { BlurView } from "expo-blur";
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
  const isIOS = Platform.OS === "ios";

  const handlePress = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/category/${id}`);
  };

  const CardInner = (
    <>
      <View style={[styles.iconBg, { backgroundColor: bgColor }]}>
        <Feather name={icon as any} size={22} color={color} />
      </View>
      <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
        {name}
      </Text>
      <Text style={[styles.count, { color: colors.mutedForeground }]}>
        {serviceCount}
      </Text>
    </>
  );

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        pressed && { opacity: 0.82, transform: [{ scale: 0.95 }] },
      ]}
    >
      {isIOS ? (
        <BlurView intensity={50} tint="light" style={styles.blurCard}>
          {CardInner}
        </BlurView>
      ) : (
        <View
          style={[
            styles.blurCard,
            { backgroundColor: colors.glass, borderColor: colors.glassBorder, borderWidth: StyleSheet.hairlineWidth },
          ]}
        >
          {CardInner}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 88,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#6080c0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  blurCard: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.6)",
    minHeight: 108,
  },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  name: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
    marginBottom: 2,
  },
  count: {
    fontSize: 10,
    textAlign: "center",
  },
});
