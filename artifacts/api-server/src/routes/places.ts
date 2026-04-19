import { Router } from "express";

const router = Router();

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

type Prediction = {
  place_id: string;
  description: string;
};

const searchPlaces = async (query: string): Promise<Prediction[]> => {
  const url = new URL("https://maps.googleapis.com/maps/api/place/autocomplete/json");
  url.searchParams.set("input", query);
  url.searchParams.set("key", GOOGLE_MAPS_API_KEY);
  url.searchParams.set("components", "country:in");
  url.searchParams.set("language", "en");
  url.searchParams.set("sessiontoken", `${Date.now()}-${Math.random().toString(36).slice(2)}`);
  url.searchParams.set("types", "geocode|establishment");
  url.searchParams.set("strictbounds", "false");

  const response = await fetch(url.toString());
  const data = await response.json() as { status: string; predictions?: Prediction[]; error_message?: string };

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(data.error_message ?? `Google Places autocomplete failed: ${data.status}`);
  }

  return data.predictions ?? [];
};

const reverseGeocode = async (lat: number, lon: number): Promise<string | null> => {
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("latlng", `${lat},${lon}`);
  url.searchParams.set("key", GOOGLE_MAPS_API_KEY);
  url.searchParams.set("language", "en");

  const response = await fetch(url.toString());
  const data = await response.json() as { status: string; results?: Array<{ formatted_address?: string }>; error_message?: string };

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(data.error_message ?? `Google reverse geocode failed: ${data.status}`);
  }

  return data.results?.[0]?.formatted_address ?? null;
};

router.get("/places/autocomplete", async (req, res) => {
  const input = req.query["input"] as string | undefined;

  if (!input || input.trim().length < 2) {
    res.json({ predictions: [] });
    return;
  }

  if (!GOOGLE_MAPS_API_KEY) {
    res.status(500).json({ error: "Google Maps API key not configured on server", predictions: [] });
    return;
  }

  try {
    const predictions = await searchPlaces(input.trim());
    res.json({ predictions });
  } catch {
    res.status(500).json({ error: "Failed to search locations", predictions: [] });
  }
});

router.get("/places/reverse", async (req, res) => {
  const lat = parseFloat(req.query["lat"] as string);
  const lon = parseFloat(req.query["lon"] as string);

  if (isNaN(lat) || isNaN(lon)) {
    res.status(400).json({ error: "Invalid coordinates", address: null });
    return;
  }

  if (!GOOGLE_MAPS_API_KEY) {
    res.status(500).json({ error: "Google Maps API key not configured on server", address: null });
    return;
  }

  try {
    const address = await reverseGeocode(lat, lon);
    res.json({ address });
  } catch {
    res.status(500).json({ error: "Failed to reverse geocode", address: null });
  }
});

export default router;
