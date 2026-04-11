import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useRef } from "react";
import {
  Animated,
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useListServices,
  useListProviders,
} from "@workspace/api-client-react";

import { CategoryCard } from "@/components/CategoryCard";
import { ProviderCard } from "@/components/ProviderCard";
import { ServiceCard } from "@/components/ServiceCard";
import { CATEGORIES } from "@/constants/data";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { selectedAddress } = useApp();
  const scrollY = useRef(new Animated.Value(0)).current;

  const { data: services, isLoading: servicesLoading } = useListServices();
  const { data: providers, isLoading: providersLoading } = useListProviders();

  const popularServices = services?.filter((s) => s.popular) ?? [];
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [1, 0.97],
    extrapolate: "clamp",
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View
        style={[
          styles.header,
          {
            backgroundColor: colors.primary,
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 16,
            opacity: headerOpacity,
          },
        ]}
      >
        <View style={styles.headerContent}>
          <View style={styles.locationRow}>
            <Pressable
              style={styles.locationBtn}
              onPress={() => router.push("/address")}
            >
              <Feather name="map-pin" size={14} color="#fff" />
              <Text style={styles.locationLabel} numberOfLines={1}>
                {selectedAddress}
              </Text>
              <Feather name="chevron-down" size={14} color="#fff" />
            </Pressable>
            <Pressable
              onPress={() => {
                if (Platform.OS !== "web") Haptics.selectionAsync();
                router.push("/notifications");
              }}
              style={styles.notifBtn}
            >
              <Feather name="bell" size={20} color="#fff" />
              <View style={styles.notifDot} />
            </Pressable>
          </View>
          <Text style={styles.greeting}>Hello there!</Text>
          <Text style={styles.subGreeting}>What service do you need today?</Text>
          <Pressable
            style={[styles.searchBar, { backgroundColor: "#fff" }]}
            onPress={() => router.push("/search")}
          >
            <Feather name="search" size={18} color={colors.mutedForeground} />
            <Text style={[styles.searchPlaceholder, { color: colors.mutedForeground }]}>
              Search for services...
            </Text>
          </Pressable>
        </View>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.offersCard}>
          <Image
            source={require("@/assets/images/hero.png")}
            style={styles.offerImage}
            contentFit="cover"
          />
          <View style={styles.offerOverlay}>
            <View style={[styles.offerBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.offerBadgeText}>LIMITED OFFER</Text>
            </View>
            <Text style={styles.offerTitle}>20% off on first booking</Text>
            <Text style={styles.offerSubtitle}>Use code: FIRST20</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Our Services
            </Text>
            <Pressable onPress={() => router.push("/all-categories")}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          >
            {CATEGORIES.map((cat) => (
              <CategoryCard key={cat.id} {...cat} />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Popular Services
            </Text>
            <Pressable onPress={() => router.push("/search")}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
            </Pressable>
          </View>
          {servicesLoading ? (
            <ActivityIndicator color={colors.primary} style={{ paddingLeft: 20 }} />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.serviceList}
            >
              {popularServices.map((service) => (
                <ServiceCard key={service.id} {...service} image={service.imageKey} />
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Top Professionals
            </Text>
          </View>
          {providersLoading ? (
            <ActivityIndicator color={colors.primary} style={{ paddingLeft: 20 }} />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.providerList}
            >
              {(providers ?? []).map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </ScrollView>
          )}
        </View>

        <View style={[styles.whySection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.whyTitle, { color: colors.foreground }]}>
            Why choose Urban?
          </Text>
          {[
            { icon: "shield", title: "Verified Professionals", desc: "Background-checked and trained" },
            { icon: "clock", title: "On-time Guarantee", desc: "Punctual or we refund" },
            { icon: "award", title: "Quality Assured", desc: "100% satisfaction guarantee" },
          ].map(({ icon, title, desc }) => (
            <View key={title} style={styles.whyItem}>
              <View style={[styles.whyIcon, { backgroundColor: colors.primary + "15" }]}>
                <Feather name={icon as any} size={18} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.whyItemTitle, { color: colors.foreground }]}>{title}</Text>
                <Text style={[styles.whyItemDesc, { color: colors.mutedForeground }]}>{desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { zIndex: 10 },
  headerContent: { paddingHorizontal: 20, paddingBottom: 20 },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  locationBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
    marginRight: 16,
  },
  locationLabel: { color: "#fff", fontSize: 13, fontFamily: "Inter_500Medium", flex: 1 },
  notifBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  notifDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fbbf24",
    borderWidth: 1.5,
    borderColor: "#f97316",
  },
  greeting: { color: "#fff", fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 2 },
  subGreeting: { color: "rgba(255,255,255,0.8)", fontSize: 14, marginBottom: 16 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  searchPlaceholder: { fontSize: 14 },
  scroll: { flex: 1 },
  scrollContent: { gap: 4 },
  offersCard: { margin: 16, borderRadius: 16, overflow: "hidden", height: 160 },
  offerImage: { ...StyleSheet.absoluteFillObject },
  offerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(26, 26, 46, 0.55)",
    padding: 20,
    justifyContent: "flex-end",
  },
  offerBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  offerBadgeText: { color: "#fff", fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1 },
  offerTitle: { color: "#fff", fontSize: 20, fontFamily: "Inter_700Bold" },
  offerSubtitle: { color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 2 },
  section: { marginTop: 16 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  seeAll: { fontSize: 13, fontFamily: "Inter_500Medium" },
  categoryList: { paddingHorizontal: 20, gap: 10 },
  serviceList: { paddingHorizontal: 20, gap: 12 },
  providerList: { paddingHorizontal: 20, gap: 12 },
  whySection: { margin: 16, marginTop: 24, padding: 20, borderRadius: 16, borderWidth: 1, gap: 16 },
  whyTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 4 },
  whyItem: { flexDirection: "row", alignItems: "center", gap: 14 },
  whyIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  whyItemTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  whyItemDesc: { fontSize: 12, marginTop: 1 },
});
