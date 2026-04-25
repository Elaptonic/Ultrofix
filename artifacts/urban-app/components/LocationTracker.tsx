import { Icon as Feather } from "@/components/Icon";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

type LocationTrackerProps = {
  onLocationUpdate?: (location: Location.LocationObject) => void;
  compact?: boolean;
};

export function LocationTracker({ onLocationUpdate, compact }: LocationTrackerProps) {
  const colors = useColors();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    let cancelled = false;

    const start = async () => {
      try {
        setLoading(true);
        setError(null);
        const { status } = await Location.getForegroundPermissionsAsync();
        if (cancelled) return;
        if (status !== "granted") {
          setError("Location permission denied");
          setLoading(false);
          return;
        }

        const current = await Location.getCurrentPositionAsync({});
        if (cancelled) return;
        setLocation(current);
        onLocationUpdate?.(current);
        setLoading(false);

        subscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, timeInterval: 30000, distanceInterval: 50 },
          (next) => {
            if (cancelled) return;
            setLocation(next);
          },
        );
      } catch {
        if (cancelled) return;
        setError("Unable to fetch location");
        setLoading(false);
      }
    };

    if (!started) {
      setStarted(true);
      start();
    }

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [onLocationUpdate, started]);

  const retry = async () => {
    setStarted(false);
    setLocation(null);
    setError(null);
    setLoading(true);
  };

  const coords = location?.coords;
  const label = coords ? `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}` : error ?? "Live location unavailable";

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}> 
      <View style={styles.row}>
        <View style={[styles.icon, { backgroundColor: colors.primary + "18" }]}> 
          <Feather name="crosshair" size={16} color={colors.primary} />
        </View>
        <View style={styles.textWrap}>
          <Text style={[styles.title, { color: colors.foreground }]}>Live Location</Text>
          <Text style={[styles.sub, { color: colors.mutedForeground }]} numberOfLines={compact ? 1 : 2}>
            {loading ? "Fetching your current location…" : label}
          </Text>
        </View>
        {loading ? <ActivityIndicator color={colors.primary} /> : <Feather name="map-pin" size={16} color={colors.primary} />}
      </View>
      {!compact && coords && (
        <Text style={[styles.hint, { color: colors.mutedForeground }]}>Auto-updates while the app is open.</Text>
      )}
      {error && !loading && (
        <Pressable onPress={retry}>
          <Text style={[styles.retry, { color: colors.primary }]}>Tap to retry</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 16, padding: 14, gap: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  icon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  textWrap: { flex: 1, gap: 2 },
  title: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  sub: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
  hint: { fontSize: 11, fontFamily: "Inter_400Regular" },
  retry: { fontSize: 12, fontFamily: "Inter_500Medium" },
});