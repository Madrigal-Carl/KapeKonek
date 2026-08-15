import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Search } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useFarms } from "@/hooks/useFarms";

const BOAC_CENTER = { lat: 13.4477, lng: 121.8407 };
const MARKER_ICON_URL =
  "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const MARKER_ICON_2X_URL =
  "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const MARKER_SHADOW_URL =
  "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export function FarmMapPage() {
  const [query, setQuery] = useState("");
  const [mapReady, setMapReady] = useState(false);
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersLayerRef = useRef(null);

  const { data: farms = [], isLoading, isError } = useFarms({ all: true });

  const filteredFarms = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return farms;

    return farms.filter((farm) =>
      `${farm.propertyNumber ?? ""} ${farm.address ?? ""}`
        .toLowerCase()
        .includes(search),
    );
  }, [farms, query]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const icon = L.icon({
      iconUrl: MARKER_ICON_URL,
      iconRetinaUrl: MARKER_ICON_2X_URL,
      shadowUrl: MARKER_SHADOW_URL,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    const map = L.map(containerRef.current, {
      center: [BOAC_CENTER.lat, BOAC_CENTER.lng],
      zoom: 11,
    });
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayer.icon = icon;
    markersLayerRef.current = markersLayer;

    const resizeObserver = new ResizeObserver(() => map.invalidateSize());
    resizeObserver.observe(containerRef.current);
    setTimeout(() => map.invalidateSize(), 50);
    setMapReady(true);

    return () => {
      resizeObserver.disconnect();
      setMapReady(false);
      map.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !markersLayerRef.current) return;

    const map = mapRef.current;
    const layer = markersLayerRef.current;
    const icon = layer.icon;
    const bounds = [];

    layer.clearLayers();

    filteredFarms.forEach((farm) => {
      const latitude = Number(farm.latitude);
      const longitude = Number(farm.longitude);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;

      const marker = L.marker([latitude, longitude], { icon }).addTo(layer);
      const owner = farm.owner?.fullName ?? "—";
      const farmerCount = farm.assignedFarmers?.length ?? 0;

      const popupHtml = `
        <div style="min-width:190px">
          <div style="font-weight:600;margin-bottom:4px">${escapeHtml(farm.propertyNumber)}</div>
          <div style="font-size:12px;color:#555">${escapeHtml(farm.address)}</div>
          <div style="margin-top:6px;font-size:12px"><strong>Hectares:</strong> ${escapeHtml(farm.size)} ha</div>
          <div style="font-size:12px"><strong>Owner:</strong> ${escapeHtml(owner)}</div>
          <div style="font-size:12px"><strong>Farmers:</strong> ${farmerCount}</div>
        </div>
      `;

      marker.bindTooltip(popupHtml, {
        direction: "top",
        offset: [0, -30],
        opacity: 1,
      });
      bounds.push([latitude, longitude]);
    });

    if (bounds.length) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    } else {
      map.setView([BOAC_CENTER.lat, BOAC_CENTER.lng], 11);
    }
  }, [filteredFarms, mapReady]);

  return (
    <div className="py-8">
      <div className="mb-6 border-b border-border pb-6">
        <p className="label-mono mb-2 text-accent">Mapping</p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Farm Map
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Geotagged farms available to your role. Search by property number or
          address.
        </p>
      </div>

      <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search property number or address…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-accent"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {filteredFarms.length} farm{filteredFarms.length === 1 ? "" : "s"} total
        </p>
      </div>

      {isError && (
        <div className="mb-4 border border-destructive bg-card px-4 py-3 text-sm text-destructive">
          Failed to load farms for the map.
        </div>
      )}

      <div className="border border-border bg-card p-2">
        <div
          ref={containerRef}
          className="relative z-0 h-[600px] w-full border border-border bg-muted"
        >
          {isLoading && (
            <div className="absolute inset-0 z-10 grid place-items-center bg-background/70">
              <div className="inline-flex items-center gap-2 border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading farms…
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
