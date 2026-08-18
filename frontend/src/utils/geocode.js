// Lightweight address geocoding via OpenStreetMap's Nominatim (no API key).
// Returns the best match's coordinates plus a bounding box used to draw the
// area highlight on the map.
export async function geocodeAddress(address) {
  const query = String(address ?? "").trim();
  if (!query) return null;

  const url =
    "https://nominatim.openstreetmap.org/search?format=json&limit=1&" +
    `q=${encodeURIComponent(query)}`;

  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("Geocoding service unavailable");

  const results = await response.json();
  const first = results?.[0];
  if (!first) return null;

  const hasBox = Array.isArray(first.boundingbox) && first.boundingbox.length === 4;

  return {
    lat: Number(first.lat),
    lng: Number(first.lon),
    displayName: first.display_name ?? "",
    // South, west, north, east — falls back to a small synthetic box around
    // the point when the service returns no bounding box.
    area: hasBox
      ? {
          south: Number(first.boundingbox[0]),
          west: Number(first.boundingbox[2]),
          north: Number(first.boundingbox[1]),
          east: Number(first.boundingbox[3]),
        }
      : {
          south: Number(first.lat) - 0.0025,
          west: Number(first.lon) - 0.0025,
          north: Number(first.lat) + 0.0025,
          east: Number(first.lon) + 0.0025,
        },
  };
}
