import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const BOAC_CENTER = { lat: 13.4477, lng: 121.8407 };

const MARKER_ICON_URL =
  "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const MARKER_ICON_2X_URL =
  "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const MARKER_SHADOW_URL =
  "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

const FARMS = [
  {
    id: "FM-001",
    name: "Sitio Malusak Farm",
    address: "Sitio Malusak, Boac, Marinduque",
    size: 4.2,
    yieldKg: 1820,
    location: { lat: 13.4521, lng: 121.8389 },
  },
  {
    id: "FM-002",
    name: "Barangay Tugos Farm",
    address: "Barangay Tugos, Mogpog, Marinduque",
    size: 2.6,
    yieldKg: 940,
    location: { lat: 13.4731, lng: 121.8612 },
  },
  {
    id: "FM-003",
    name: "Sitio Hinapulan Farm",
    address: "Sitio Hinapulan, Gasan, Marinduque",
    size: 6.8,
    yieldKg: 3120,
    location: { lat: 13.3221, lng: 121.8693 },
  },
];

export function FarmMapPage() {
  const [query, setQuery] = useState("");
  const [mapReady, setMapReady] = useState(false);
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersLayerRef = useRef(null);

  const filteredFarms = FARMS.filter((farm) => {
    const text = `${farm.name} ${farm.address}`.toLowerCase();
    return text.includes(query.trim().toLowerCase());
  });

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

    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(containerRef.current);
    setTimeout(() => map.invalidateSize(), 50);
    setMapReady(true);

    return () => {
      ro.disconnect();
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
    layer.clearLayers();
    const bounds = [];
    filteredFarms.forEach((farm) => {
      const marker = L.marker([farm.location.lat, farm.location.lng], {
        icon,
      }).addTo(layer);
      const tooltipHtml = `
        <div style="min-width:180px">
          <div style="font-weight:600;margin-bottom:4px">${farm.name}</div>
          <div style="font-size:12px;color:#555">${farm.address}</div>
          <div style="margin-top:6px;font-size:12px"><strong>Hectares:</strong> ${farm.size} ha</div>
          <div style="font-size:12px"><strong>Total yield:</strong> ${farm.yieldKg.toLocaleString()} kg</div>
        </div>
      `;
      marker.bindTooltip(tooltipHtml, {
        direction: "top",
        offset: [0, -30],
        opacity: 1,
      });
      bounds.push([farm.location.lat, farm.location.lng]);
    });
    if (bounds.length) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    } else {
      map.setView([BOAC_CENTER.lat, BOAC_CENTER.lng], 11);
    }
  }, [mapReady, filteredFarms]);

  return (
    <div className="py-8">
      <div className="mb-6 border-b border-border pb-6">
        <p className="label-mono mb-2 text-accent">Mapping</p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Farm Map
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Geotagged farms across Marinduque. Hover a pin to see the farm name,
          hectares, and total yield.
        </p>
      </div>

      <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search farm..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground outline-none ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-accent"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {filteredFarms.length} farm{filteredFarms.length === 1 ? "" : "s"}{" "}
          total
        </p>
      </div>

      <div className="border border-border bg-card p-2">
        <div
          ref={containerRef}
          className="relative z-0 h-[600px] w-full border border-border bg-muted"
        />
      </div>
    </div>
  );
}
