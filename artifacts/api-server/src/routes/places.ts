import { Router } from "express";

const router = Router();

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";
const USER_AGENT = "UrbanApp/1.0 (home-services-marketplace)";

type Prediction = {
  place_id: string;
  description: string;
};

const searchPlaces = async (query: string): Promise<Prediction[]> => {
  const url = new URL(`${NOMINATIM_BASE}/search`);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "15");
  url.searchParams.set("accept-language", "en");
  url.searchParams.set("dedupe", "1");

  const response = await fetch(url.toString(), {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!response.ok) throw new Error(`Nominatim search failed: ${response.status}`);

  const results: any[] = await response.json();
  return results.map((item) => ({
    place_id: String(item.place_id),
    description: item.display_name as string,
  }));
};

const reverseGeocode = async (lat: number, lon: number): Promise<string | null> => {
  const url = new URL(`${NOMINATIM_BASE}/reverse`);
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("accept-language", "en");

  const response = await fetch(url.toString(), {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!response.ok) throw new Error(`Nominatim reverse failed: ${response.status}`);

  const data: any = await response.json();
  return (data.display_name as string) ?? null;
};

router.get("/places/autocomplete", async (req, res) => {
  const input = req.query["input"] as string | undefined;

  if (!input || input.trim().length < 2) {
    res.json({ predictions: [] });
    return;
  }

  try {
    const predictions = await searchPlaces(input.trim());
    res.json({ predictions });
  } catch (err) {
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
    const address = await reverseGeocode(lat, lon);
    res.json({ address });
  } catch (err) {
    res.status(500).json({ error: "Failed to reverse geocode", address: null });
  }
});

export default router;
