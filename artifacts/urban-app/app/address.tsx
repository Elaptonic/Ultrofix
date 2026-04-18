import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LocationTracker } from "@/components/LocationTracker";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const SAVED_ADDRESSES = [
  { id: "1", label: "Home", address: "123 MG Road, Bangalore 560001", icon: "home" },
  { id: "2", label: "Work", address: "Tech Park, Whitefield, Bangalore 560066", icon: "briefcase" },
  { id: "3", label: "Other", address: "45 Koramangala, Bangalore 560034", icon: "map-pin" },
];

export default function AddressScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { selectedAddress, setSelectedAddress } = useApp();
  const [customAddress, setCustomAddress] = useState("");
  const [liveAddress, setLiveAddress] = useState<string | null>(null);

  const handleSelect = (address: string) => {
    setSelectedAddress(address);
    if (Platform.OS !== "web") Haptics.selectionAsync();
    router.back();
  };

  const fillFromCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;
    const current = await Location.getCurrentPositionAsync({});
    const [result] = await Location.reverseGeocodeAsync({
      latitude: current.coords.latitude,
      longitude: current.coords.longitude,
    });
    const formatted = [result?.name, result?.street, result?.district, result?.city, result?.postalCode]
      .filter(Boolean)
      .join(", ");
    if (formatted) {
      setCustomAddress(formatted);
      setLiveAddress(formatted);
    }
  };

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
        <Text style={[styles.title, { color: colors.foreground }]}>Select Address</Text>
        <View style={{ width: 22 }} />
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
        <LocationTracker compact onLocationUpdate={async () => {
          try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") return;
            const current = await Location.getCurrentPositionAsync({});
            const [result] = await Location.reverseGeocodeAsync({
              latitude: current.coords.latitude,
              longitude: current.coords.longitude,
            });
            const formatted = [result?.name, result?.street, result?.district, result?.city, result?.postalCode]
              .filter(Boolean)
              .join(", ");
            if (formatted) setLiveAddress(formatted);
          } catch {
          }
        }} />

        <Pressable
          onPress={fillFromCurrentLocation}
          style={({ pressed }) => [
            styles.currentBtn,
            { backgroundColor: colors.primary },
            pressed && { opacity: 0.85 },
          ]}
        >
          <Feather name="navigation" size={16} color="#fff" />
          <Text style={styles.currentBtnText}>Use current location</Text>
        </Pressable>

        {liveAddress ? (
          <View style={[styles.liveCard, { backgroundColor: colors.accent, borderColor: colors.primary }]}>
            <Feather name="map-pin" size={16} color={colors.primary} />
            <Text style={[styles.liveText, { color: colors.foreground }]} numberOfLines={2}>{liveAddress}</Text>
          </View>
        ) : null}

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Saved Addresses</Text>
        {SAVED_ADDRESSES.map((addr) => (
          <Pressable
            key={addr.id}
            onPress={() => handleSelect(addr.address)}
            style={({ pressed }) => [
              styles.addressCard,
              {
                backgroundColor: selectedAddress === addr.address ? colors.accent : colors.card,
                borderColor: selectedAddress === addr.address ? colors.primary : colors.border,
              },
              pressed && { opacity: 0.85 },
            ]}
          >
            <View
              style={[
                styles.addrIcon,
                {
                  backgroundColor: selectedAddress === addr.address ? colors.primary + "22" : colors.muted,
                },
              ]}
            >
              <Feather
                name={addr.icon as any}
                size={18}
                color={selectedAddress === addr.address ? colors.primary : colors.mutedForeground}
              />
            </View>
            <View style={styles.addrInfo}>
              <Text style={[styles.addrLabel, { color: colors.foreground }]}>{addr.label}</Text>
              <Text style={[styles.addrText, { color: colors.mutedForeground }]} numberOfLines={2}>
                {addr.address}
              </Text>
            </View>
            {selectedAddress === addr.address && (
              <Feather name="check-circle" size={20} color={colors.primary} />
            )}
          </Pressable>
        ))}

        <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 12 }]}>Enter Custom Address</Text>
        <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="map-pin" size={18} color={colors.primary} />
          <TextInput
            value={customAddress}
            onChangeText={setCustomAddress}
            placeholder="Type your address..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { color: colors.foreground }]}
            multiline
          />
        </View>
        {customAddress.length > 5 && (
          <Pressable
            onPress={() => handleSelect(customAddress)}
            style={({ pressed }) => [styles.useBtn, { backgroundColor: colors.primary }, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.useBtnText}>Use this address</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  title: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  scroll: { flex: 1 },
  content: { padding: 20, gap: 10 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 4 },
  currentBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
  },
  currentBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  liveCard: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderRadius: 14, padding: 14 },
  liveText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium", lineHeight: 18 },
  addressCard: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 14, borderWidth: 1.5, gap: 12 },
  addrIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  addrInfo: { flex: 1 },
  addrLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  addrText: { fontSize: 13, marginTop: 2, lineHeight: 18 },
  inputRow: { flexDirection: "row", alignItems: "flex-start", padding: 14, borderRadius: 14, borderWidth: 1, gap: 10 },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 22, maxHeight: 100 },
  useBtn: { paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  useBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});