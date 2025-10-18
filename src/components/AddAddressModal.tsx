// src/components/AddAddressModal.tsx
"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import type { Location } from "./MapWithSearch";

type Address = {
  _id?: string;
  name: string;
  label: string;
  phone?: string;
  flatHouse?: string;
  areaLocality?: string;
  landmark?: string;
  lat?: number;
  lng?: number;
  type?: string;
  address?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: (addr: Address) => void; // update parent after saving
};

export default function AddAddressModal({ open, onClose, onSaved }: Props) {
  const [pick, setPick] = useState<Location | null>(null);
  const [labelType, setLabelType] = useState<
    "Home" | "Work" | "Hotel" | "Other"
  >("Home");
  const [flatHouse, setFlatHouse] = useState("");
  const [floor, setFloor] = useState("");
  const [area, setArea] = useState("");
  const [landmark, setLandmark] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  // called by child map when user picks pos or search
  const handlePick = (loc: Location) => {
    setPick(loc);
    if (loc.display_name) setArea(loc.display_name);
    else if (loc.area) setArea(loc.area);
  };

  const saveAddress = async () => {
    if (!name || !flatHouse || !area || !pick) {
      alert("Please fill required fields and pick a location on the map");
      return;
    }

    setSaving(true);

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const body = {
        user: user?.id, // logged in user's ID
        label: labelType.toLowerCase(),
        name,
        phone,
        flatHouse,
        floor,
        areaLocality: area,
        landmark,
        lat: pick.lat,
        lng: pick.lng,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/addresses`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      const data = await res.json();
      console.log("Address save response:", res.status, data);

      if (!res.ok)
        throw new Error(data?.message || `Save failed (${res.status})`);

      // use correct key: backend returns { message, address }
      onSaved(data.address);
      onClose();
    } catch (err: unknown) {
      console.error("save addr err", err);
      alert(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const MapWithSearch = dynamic(() => import("./MapWithSearch"), {
    ssr: false, // 🚀 disables server-side rendering for Leaflet
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-lg font-semibold">Enter complete address</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="p-4 md:p-6 flex flex-col md:flex-row gap-4">
          {/* Left: MapWithSearch */}
          <div className="md:w-1/2">
            <MapWithSearch
              initial={{ lat: 13.0827, lng: 80.2707 }}
              onPick={handlePick}
            />
            <div className="mt-3 text-sm text-gray-500">
              Delivering to:{" "}
              <span className="font-medium">
                {pick?.display_name ?? "Pick a point"}
              </span>
            </div>
          </div>

          {/* Right: Form */}
          <div className="md:w-1/2 space-y-3">
            <div className="flex gap-2">
              {(["Home", "Work", "Hotel", "Other"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setLabelType(t)}
                  className={`px-3 py-2 border rounded-md ${
                    labelType === t
                      ? "bg-orange-50 border-orange-500 text-orange-600"
                      : "bg-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Flat / House no / Building name *"
              value={flatHouse}
              onChange={(e) => setFlatHouse(e.target.value)}
              required
            />
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Floor (optional)"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
            />
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Area / Sector / Locality *"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              required
            />
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Nearby landmark (optional)"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
            />

            <div className="pt-2">
              <p className="text-sm text-gray-500 mb-2">
                Enter your details for seamless delivery experience
              </p>
              <input
                className="w-full border rounded px-3 py-2 mb-2"
                placeholder="Your name *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="Your phone number *"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="flex gap-3 mt-2">
              <button
                onClick={saveAddress}
                disabled={saving}
                className="flex-1 bg-orange-600 text-white py-2 rounded-md hover:bg-green-700"
              >
                {saving ? "Saving..." : "Save Address"}
              </button>
              <button
                onClick={onClose}
                className="flex-1 border py-2 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
