"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconMapPin, IconUserCircle } from "@tabler/icons-react";
import { useAuth } from "@/components/auth/AuthContext";

/** Addresses are stored as one line; the form edits it as two fields. */
function splitAddress(address?: string | null) {
  const [flatHouse = "", ...rest] = (address ?? "").split(",");
  return {
    flatHouse: flatHouse.trim(),
    apartment: rest.join(",").trim(),
  };
}

/**
 * The customer's own details: delivery address, contact information, and the
 * label the address is saved under. Body of `/account`.
 *
 * `isWelcome` comes from `?welcome=1` after registration — the only thing it
 * changes here is that saving drops the parameter, so a refresh doesn't
 * re-greet someone who has already filled the form in.
 */
export default function ProfileDetails({
  isWelcome = false,
}: {
  isWelcome?: boolean;
}) {
  const router = useRouter();
  const { user, updateProfile } = useAuth();

  // Prefill straight into initial state rather than syncing in an effect:
  // AccountShell only renders this once the customer has loaded, so the values
  // are already here on the first render. It also means a save refreshing the
  // context can't overwrite something half-typed.
  const primary =
    user?.addresses?.find((a) => a.isDefault) ?? user?.addresses?.[0];
  const savedAddress = splitAddress(primary?.address);

  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [flat, setFlat] = useState(savedAddress.flatHouse);
  const [area, setArea] = useState(savedAddress.apartment);
  const [city, setCity] = useState(primary?.city ?? "");
  const [state, setState] = useState(primary?.state ?? "");
  const [pincode, setPincode] = useState(primary?.pincode ?? "");
  const [label, setLabel] = useState<"Home" | "Work">(
    primary?.label === "Work" ? "Work" : "Home",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  if (!user) return null;

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaved(false);
    setSaving(true);
    setError("");
    const fullAddress = [flat.trim(), area.trim()].filter(Boolean).join(", ");
    try {
      await updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
        addresses: fullAddress
          ? [
              {
                label,
                fullName: fullName.trim(),
                phone: phone.trim(),
                address: fullAddress,
                city: city.trim(),
                state: state.trim(),
                pincode: pincode.trim(),
                isDefault: true,
              },
            ]
          : [],
      });
      setSaved(true);
      if (isWelcome) router.replace("/account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSave}
      className="w-full max-w-[1100px] rounded-2xl border border-[#ECECEC] bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)] lg:p-8"
    >
      {saved && (
        <div className="mb-5 rounded-lg bg-green-100 py-2 text-center text-sm font-medium text-green-700">
          Saved successfully
        </div>
      )}

      {/* Two columns from `lg`, where the three-across pincode/city/state row
          still has room to breathe. Below that they stack in the same order
          they read in — address, then who it's going to. */}
      <div className="grid grid-cols-1 items-start gap-x-[clamp(24px,3.5vw,56px)] gap-y-7 lg:grid-cols-2">
        <div>
          <SectionTitle icon={<IconMapPin size={20} />}>
            Add Delivery Address
          </SectionTitle>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <Input
              label="Pincode"
              value={pincode}
              onChange={setPincode}
              inputMode="numeric"
            />
            <Input label="City" value={city} onChange={setCity} />
            <Input label="State" value={state} onChange={setState} />
          </div>
          <div className="mt-3 flex flex-col gap-3">
            <Input label="Flat / House Number" value={flat} onChange={setFlat} />
            <Input
              label="Apartment, Area, Sector, Village"
              value={area}
              onChange={setArea}
            />
          </div>

          {/* Sits with the address because that is what it labels. */}
          <div className="mt-6">
            <p className="mb-2 text-sm font-medium">Save Address As</p>
            <div className="flex gap-3">
              {(["Home", "Work"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setLabel(option)}
                  className={`flex-1 cursor-pointer rounded-lg border py-2 text-sm font-medium transition ${
                    label === option
                      ? "border-[#F26522] text-[#F26522]"
                      : "border-gray-300 text-gray-600"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <SectionTitle icon={<IconUserCircle size={20} />}>
            Customer Information
          </SectionTitle>
          <div className="mt-4 flex flex-col gap-3">
            <Input label="Full Name*" value={fullName} onChange={setFullName} />
            <Input
              label="Phone Number*"
              value={phone}
              onChange={setPhone}
              inputMode="numeric"
            />
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-gray-500">Email Address*</span>
              <input
                type="email"
                value={user.email ?? ""}
                readOnly
                className="h-11 cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-4 text-gray-500"
              />
            </label>
          </div>

          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="mt-6 h-12 w-full cursor-pointer rounded-[10px] bg-[#F26522] font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Continue"}
          </button>
          <p className="mt-3 text-center text-[11px] text-gray-400">
            By proceeding, I agree to TeeHub&apos;s Privacy Policy and T&amp;C
          </p>
        </div>
      </div>
    </form>
  );
}

function SectionTitle({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 font-semibold">
      {icon}
      {children}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: "numeric" | "text";
}) {
  return (
    <label className="flex flex-1 flex-col gap-1 text-sm">
      <span className="text-gray-500">{label}</span>
      <input
        type="text"
        value={value}
        inputMode={inputMode}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 rounded-lg border border-gray-300 px-4 outline-none transition-colors focus:border-[#F26522]"
      />
    </label>
  );
}
