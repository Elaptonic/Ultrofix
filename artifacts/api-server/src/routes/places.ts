import { Router } from "express";

const router = Router();

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

type Prediction = {
  place_id: string;
  description: string;
};

const fetchAutocomplete = async (query: string) => {
  const url = new URL("https://maps.googleapis.com/maps/api/place/autocomplete/json");
  url.searchParams.set("input", query);
  url.searchParams.set("key", GOOGLE_MAPS_API_KEY);
  url.searchParams.set("components", "country:in");
  url.searchParams.set("language", "en");
  url.searchParams.set("sessiontoken", `${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const response = await fetch(url.toString());
  return response.json() as Promise<{ status: string; predictions?: Prediction[] }>;
};

const fetchTextSearch = async (query: string) => {
  const url = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
  url.searchParams.set("query", query);
  url.searchParams.set("key", GOOGLE_MAPS_API_KEY);
  url.searchParams.set("language", "en");
  const response = await fetch(url.toString());
  return response.json() as Promise<{ status: string; results?: Array<{ place_id: string; formatted_address?: string; name?: string }> }>;
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
    const query = input.trim();
    const [autocompleteData, textSearchData] = await Promise.all([
      fetchAutocomplete(query),
      fetchTextSearch(query),
    ]);

    const autocompletePredictions = (autocompleteData.predictions ?? []).map((item) => ({
      place_id: item.place_id,
      description: item.description,
    }));

    const textSearchPredictions = (textSearchData.results ?? []).map((item) => ({
      place_id: item.place_id,
      description: item.formatted_address ?? item.name ?? query,
    }));

    const merged = [...autocompletePredictions, ...textSearchPredictions];
    const deduped = merged.filter((item, index, self) => index === self.findIndex((candidate) => candidate.place_id === item.place_id));

    res.json({ predictions: deduped.slice(0, 15) });
  } catch {
    res.status(500).json({ error: "Failed to reach Google Places API", predictions: [] });
  }
});

export default router;
