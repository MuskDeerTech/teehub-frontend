"use client";

import React, { useEffect, useRef, useState } from "react";
// import dynamic from "next/dynamic";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from "react-leaflet";
import L, { LeafletMouseEvent, Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";

// ✅ Fix default marker icons
delete (L.Icon.Default.prototype as { _getIconUrl?: () => string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

export type Location = {
  lat: number;
  lng: number;
  display_name?: string;
  area?: string;
};

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  type: string;
  address?: Record<string, string>;
}

interface MapWithSearchProps {
  initial?: { lat: number; lng: number };
  onPick: (loc: Location) => void;
  className?: string;
}

function MapClickHandler({
  onMapClick,
}: {
  onMapClick: (e: LeafletMouseEvent) => void;
}) {
  useMapEvents({
    click: onMapClick,
  });
  return null;
}

export default function MapWithSearch({
  initial = { lat: 13.0827, lng: 80.2707 },
  onPick,
  className,
}: MapWithSearchProps) {
  const [center, setCenter] = useState(initial);
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(
    initial
  );
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const mapRef = useRef<LeafletMap | null>(null);

  // 🔍 Search by name
  const search = async (q: string) => {
    if (!q.trim()) return setResults([]);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(
          q
        )}&limit=6`,
        { headers: { "User-Agent": "teehub-example" } }
      );
      const json: NominatimResult[] = await res.json();
      setResults(json);
    } catch (err) {
      console.error("Search error", err);
    }
  };

  // 🔁 Reverse geocode
  const reverse = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${lat}&lon=${lng}`,
        { headers: { "User-Agent": "teehub-example" } }
      );
      const json = await res.json();
      const display_name = json.display_name || "";
      const addr = json.address || {};
      const area =
        addr.neighbourhood || addr.suburb || addr.village || addr.city || "";
      onPick({ lat, lng, display_name, area });
    } catch (err) {
      console.error("Reverse geocode error", err);
      onPick({ lat, lng });
    }
  };

  // 🗺️ Handle map click
  const handleMapClick = (event: LeafletMouseEvent) => {
    const { lat, lng } = event.latlng;
    setMarker({ lat, lng });
    setCenter({ lat, lng });
    reverse(lat, lng);
  };

  // 📍 Pick from search
  const pickResult = (r: NominatimResult) => {
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    setMarker({ lat, lng });
    setCenter({ lat, lng });
    setQuery(r.display_name);
    setResults([]);
    onPick({
      lat,
      lng,
      display_name: r.display_name,
      area: r.address?.suburb || r.address?.city || r.address?.village,
    });
    mapRef.current?.flyTo([lat, lng], 16);
  };

  // 🧭 Use current location
  const useMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setCenter({ lat, lng });
        setMarker({ lat, lng });
        reverse(lat, lng);
        mapRef.current?.flyTo([lat, lng], 16);
      },
      (err) => {
        console.error(err);
        alert("Failed to get location");
      }
    );
  };

  // ⏱️ Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => search(query), 300);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className={`w-full ${className || ""}`}>
      {/* 🔍 Search */}
      <div className="mb-2 relative">
        <div className="flex items-center gap-2">
          <input
            placeholder="Search for locality, street or place..."
            className="w-full border rounded-md px-3 py-2 shadow-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            onClick={useMyLocation}
            className="px-3 py-2 rounded-md bg-orange-500 text-white hover:bg-orange-600"
            type="button"
            title="Use my location"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24" fill="none" > <path fill-rule="evenodd" clip-rule="evenodd" d="M11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19C12.8487 19 14.551 18.3729 15.9056 17.3199L19.2929 20.7071C19.6834 21.0976 20.3166 21.0976 20.7071 20.7071C21.0976 20.3166 21.0976 19.6834 20.7071 19.2929L17.3199 15.9056C18.3729 14.551 19 12.8487 19 11C19 6.58172 15.4183 3 11 3ZM5 11C5 7.68629 7.68629 5 11 5C14.3137 5 17 7.68629 17 11C17 14.3137 14.3137 17 11 17C7.68629 17 5 14.3137 5 11Z" fill="#ffffff" /> </svg>
          </button>
        </div>

        {results.length > 0 && (
          <div className="absolute z-30 left-0 right-0 bg-white border rounded-md mt-1 max-h-60 overflow-auto shadow-lg">
            {results.map((r, idx) => (
              <button
                key={idx}
                onClick={() => pickResult(r)}
                className="w-full text-left px-3 py-2 hover:bg-gray-50"
                type="button"
              >
                <div className="text-sm font-medium">{r.display_name}</div>
                <div className="text-xs text-gray-500">{r.type}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 🗺️ Map */}
      <div className="rounded-md overflow-hidden border">
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={13}
          style={{ width: "100%", height: 360 }}
          whenCreated={(map) => {
            mapRef.current = map;
          }}
        >
          <TileLayer
            attribution="© OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {marker && <Marker position={[marker.lat, marker.lng]} />}
          <MapClickHandler onMapClick={handleMapClick} />
        </MapContainer>
      </div>
    </div>
  );
}
