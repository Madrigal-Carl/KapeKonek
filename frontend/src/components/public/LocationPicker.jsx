import { useState } from "react";
import { AlertTriangle, Crosshair, MapPin, X } from "lucide-react";
import { fmtCoord } from "@/utils/format";
import { LeafletMap } from "./LeafletMap";

export function LocationPicker({ value, onChange }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const useMyLocation = () => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported in this browser.");
      return;
    }
    setBusy(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
        });
        setBusy(false);
      },
      (err) => {
        setError(err.message || "Unable to get current location.");
        setBusy(false);
      },
      { enableHighAccuracy: true, timeout: 1e4 },
    );
  };

  return (
    <div className="space-y-3 border border-border bg-muted/30 p-3">
      <div className="flex items-start gap-2 text-xs text-muted-foreground">
        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
        <span>
          Click anywhere on the map to drop a pin. Drag it to refine the
          farm&apos;s exact location.
        </span>
      </div>
      <LeafletMap location={value} onPick={onChange} className="h-64" />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm">
          {value ? (
            <span className="font-mono text-foreground">
              {fmtCoord(value.lat, "N", "S")}, {fmtCoord(value.lng, "E", "W")}
            </span>
          ) : (
            <span className="text-muted-foreground">No pin dropped yet.</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={useMyLocation}
            disabled={busy}
            className="inline-flex items-center gap-1.5 border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-60"
          >
            <Crosshair className="h-3.5 w-3.5 text-accent" />
            {busy ? "Locating…" : "Use my location"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="inline-flex items-center gap-1 border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" /> Clear
            </button>
          )}
        </div>
      </div>
      {error && (
        <div className="flex items-start gap-1.5 text-xs text-destructive">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
