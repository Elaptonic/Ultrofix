import { Router } from "express";

const router = Router();

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";
const NOMINATIM_UA = "UrbanApp/1.0 (home-services-marketplace)";

type Prediction = {
  place_id: string;
  description: string;
};

// ---------------------------------------------------------------------------
// Google Places (primary) — requires Places API enabled & unrestricted key
// ---------------------------------------------------------------------------
const searchGooglePlaces = async (query: string): Promise<Prediction[]> => {
  const key = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
  if (!key) throw new Error("GOOGLE_MAPS_API_KEY not set");

  const url = new URL("https://maps.googleapis.com/maps/api/place/autocomplete/json");
  url.searchParams.set("input", query);
  url.searchParams.set("key", key);
  url.searchParams.set("language", "en");
  // "establishment" finds shops, businesses, buildings; no country restriction so it works everywhere
  url.searchParams.set("types", "establishment");
  url.searchParams.set("components", "country:in");
  url.searchParams.set("sessiontoken", `${Date.now()}-${Math.random().toString(36).slice(2)}`);

  const response = await fetch(url.toString());
  const data = await response.json() as {
    status: string;
    predictions?: Array<{ place_id: string; description: string }>;
    error_message?: string;
  };

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    const msg = `Google Places: ${data.status}${data.error_message ? ` — ${data.error_message}` : ""}`;
    console.error("[places] Google autocomplete failed:", msg);
    throw new Error(msg);
  }

  return (data.predictions ?? []).map((p) => ({ place_id: p.place_id, description: p.description }));
};

// ---------------------------------------------------------------------------
// Google reverse geocode (primary)
// ---------------------------------------------------------------------------
const reverseGeocodeGoogle = async (lat: number, lon: number): Promise<string | null> => {
  const key = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
  if (!key) throw new Error("GOOGLE_MAPS_API_KEY not set");

  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("latlng", `${lat},${lon}`);
  url.searchParams.set("key", key);
  url.searchParams.set("language", "en");

  const response = await fetch(url.toString());
  const data = await response.json() as {
    status: string;
    results?: Array<{ formatted_address?: string }>;
    error_message?: string;
  };

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    const msg = `Google Geocode: ${data.status}${data.error_message ? ` — ${data.error_message}` : ""}`;
    console.error("[places] Google reverse geocode failed:", msg);
    throw new Error(msg);
  }

  return data.results?.[0]?.formatted_address ?? null;
};

// ---------------------------------------------------------------------------
// Nominatim (fallback) — open, no key needed
// ---------------------------------------------------------------------------
const searchNominatim = async (query: string): Promise<Prediction[]> => {
  const url = new URL(`${NOMINATIM_BASE}/search`);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "15");
  url.searchParams.set("accept-language", "en");
  url.searchParams.set("dedupe", "1");

  const response = await fetch(url.toString(), { headers: { "User-Agent": NOMINATIM_UA } });
  if (!response.ok) throw new Error(`Nominatim search failed: ${response.status}`);

  const results: any[] = await response.json();
  return results.map((item) => ({
    place_id: String(item.place_id),
    description: item.display_name as string,
  }));
};

const reverseGeocodeNominatim = async (lat: number, lon: number): Promise<string | null> => {
  const url = new URL(`${NOMINATIM_BASE}/reverse`);
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("accept-language", "en");

  const response = await fetch(url.toString(), { headers: { "User-Agent": NOMINATIM_UA } });
  if (!response.ok) throw new Error(`Nominatim reverse failed: ${response.status}`);

  const data: any = await response.json();
  return (data.display_name as string) ?? null;
};

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
router.get("/places/autocomplete", async (req, res) => {
  const input = req.query["input"] as string | undefined;

  if (!input || input.trim().length < 2) {
    res.json({ predictions: [] });
    return;
  }

  try {
    // Try Google first; fall back to Nominatim if Google rejects the call
    let predictions: Prediction[];
    try {
      predictions = await searchGooglePlaces(input.trim());
    } catch (googleErr) {
      console.warn("[places] Falling back to Nominatim for autocomplete:", (googleErr as Error).message);
      predictions = await searchNominatim(input.trim());
    }
    res.json({ predictions });
  } catch (err) {
    console.error("[places] autocomplete error:", err);
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

  try {
    let address: string | null;
    try {
      address = await reverseGeocodeGoogle(lat, lon);
    } catch (googleErr) {
      console.warn("[places] Falling back to Nominatim for reverse geocode:", (googleErr as Error).message);
      address = await reverseGeocodeNominatim(lat, lon);
    }
    res.json({ address });
  } catch (err) {
    console.error("[places] reverse geocode error:", err);
    res.status(500).json({ error: "Failed to reverse geocode", address: null });
  }
});

export default router;
