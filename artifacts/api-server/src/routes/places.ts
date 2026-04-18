import { Router } from "express";

const router = Router();

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

router.get("/places/autocomplete", async (req, res) => {
  const input = req.query["input"] as string | undefined;

  if (!input || input.trim().length < 2) {
    res.json({ predictions: [] });
    return;
  }

  if (!GOOGLE_MAPS_API_KEY) {
    res.status(500).json({ error: "Google Maps API key not configured on server" });
    return;
  }

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/place/autocomplete/json");
    url.searchParams.set("input", input.trim());
    url.searchParams.set("key", GOOGLE_MAPS_API_KEY);
    url.searchParams.set("components", "country:in");
    url.searchParams.set("types", "geocode");

    const response = await fetch(url.toString());
    const data = await response.json() as { status: string; predictions: unknown[] };

    if (!response.ok || data.status === "REQUEST_DENIED" || data.status === "INVALID_REQUEST") {
      res.status(400).json({ error: data.status, predictions: [] });
      return;
    }

    res.json({ predictions: data.predictions ?? [] });
  } catch (err) {
    res.status(500).json({ error: "Failed to reach Google Places API", predictions: [] });
  }
});

export default router;
