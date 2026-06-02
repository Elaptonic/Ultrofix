import { Icon as Feather } from "@/components/Icon";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const OFFERS = [
  {
    code: "FIRST50",
    title: "50% off your first booking",
    desc: "Valid on all services for new users. Max discount ₹300.",
    expiry: "31 Jul 2026",
    color: "#f97316",
  },
  {
    code: "CLEAN20",
    title: "20% off home cleaning",
    desc: "Use on any cleaning service booking above ₹500.",
    expiry: "15 Jul 2026",
    color: "#06b6d4",
  },
  {
    code: "PLUMB15",
    title: "₹150 off plumbing services",
    desc: "Flat discount on plumbing bookings. Min. booking value ₹400.",
    expiry: "30 Jun 2026",
    color: "#8b5cf6",
  },
  {
    code: "REFER200",
    title: "₹200 referral bonus",
    desc: "Refer a friend and earn ₹200 when they complete their first booking.",
    expiry: "No expiry",
    color: "#10b981",
  },
];

export default function OffersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    setCopiedCode(code);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 16,
            borderBottomColor: colors.border,
            backgroundColor: colors.card,
          },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Offers & Coupons</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Tap a coupon code to copy it. Apply at checkout.
        </Text>

        {OFFERS.map((offer) => (
          <View
            key={offer.code}
            style={[styles.offerCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.offerStripe, { backgroundColor: offer.color }]} />
            <View style={styles.offerBody}>
              <View style={styles.offerTop}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.offerTitle, { color: colors.foreground }]}>{offer.title}</Text>
                  <Text style={[styles.offerDesc, { color: colors.mutedForeground }]}>{offer.desc}</Text>
                </View>
                <Pressable
                  onPress={() => handleCopy(offer.code)}
                  style={[styles.codeBtn, { borderColor: offer.color, backgroundColor: offer.color + "12" }]}
                >
                  <Text style={[styles.codeText, { color: offer.color }]}>{offer.code}</Text>
                  <Feather
                    name={copiedCode === offer.code ? "check" : "copy"}
                    size={12}
                    color={offer.color}
                  />
                </Pressable>
              </View>
              <View style={styles.offerFooter}>
                <Feather name="clock" size={12} color={colors.mutedForeground} />
                <Text style={[styles.expiryText, { color: colors.mutedForeground }]}>
                  Expires: {offer.expiry}
                </Text>
              </View>
            </View>
          </View>
        ))}

        <View style={[styles.emptyTip, { backgroundColor: colors.muted, borderRadius: 14 }]}>
          <Feather name="info" size={16} color={colors.mutedForeground} />
          <Text style={[styles.emptyTipText, { color: colors.mutedForeground }]}>
            New offers are added every week. Check back regularly!
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { width: 36, height: 36, justifyContent: "center" },
  headerTitle: { flex: 1, fontSize: 18, fontFamily: "Inter_700Bold", textAlign: "center" },
  content: { padding: 20, gap: 14 },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular" },
  offerCard: {
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    overflow: "hidden",
  },
  offerStripe: { width: 5 },
  offerBody: { flex: 1, padding: 16, gap: 10 },
  offerTop: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  offerTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 3, lineHeight: 20 },
  offerDesc: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
  codeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 80,
    justifyContent: "center",
  },
  codeText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  offerFooter: { flexDirection: "row", alignItems: "center", gap: 5 },
  expiryText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  emptyTip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    marginTop: 4,
  },
  emptyTipText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
});
