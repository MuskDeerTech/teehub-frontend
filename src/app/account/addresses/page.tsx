"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const center = {
  lat: 12.9344, // Default latitude for Bengaluru
  lng: 77.6168, // Default longitude for Bengaluru
};
type Address = {
  name: string;
  phone: string;
  flatHouse: string;
  areaLocality: string;
  landmark: string;
  lat: number;
  lng: number;
  floor?: string;
  type: string;
  address?: string;
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    flatHouse: "",
    areaLocality: "",
    landmark: "",
    lat: center.lat,
    lng: center.lng,
    floor: "", // ✅ added
    type: "Home", // ✅ added
  });

  const router = useRouter();

  useEffect(() => {
    async function fetchAddresses() {
      try {
        const res = await fetch(
          "https://ecommerce-backend-psi-rose.vercel.app/api/addresses",
          {
            credentials: "include",
          }
        );
        const data = await res.json();
        setAddresses(data?.docs || []);
      } catch (err) {
        console.error("Failed to fetch addresses:", err);
      }
    }
    fetchAddresses();
  }, []);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(
        "https://ecommerce-backend-psi-rose.vercel.app/api/addresses",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            ...newAddress,
            address: `${newAddress.flatHouse}, ${newAddress.areaLocality}, ${newAddress.landmark}`,
          }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setAddresses([...addresses, data.doc]);
        setShowAddForm(false);
        setNewAddress({
          name: "",
          phone: "",
          flatHouse: "",
          areaLocality: "",
          landmark: "",
          lat: center.lat,
          lng: center.lng,
          floor: "", // ✅ add this
          type: "Home", // ✅ add this
        });
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Failed to save address:", err);
      alert("Failed to save address");
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          {addresses.length === 0 && !showAddForm ? (
            <>
              <h2 className="font-semibold text-lg mb-1">
                You have no saved addresses
              </h2>
              <p className="text-gray-500 mb-4">
                Tell us where you want your orders delivered
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
              >
                Add New Address
              </button>
            </>
          ) : addresses.length > 0 ? (
            <div className="w-full">
              <h2 className="font-semibold text-lg mb-4">Saved Addresses</h2>
              <ul className="space-y-3">
                {addresses.map((addr, i) => (
                  <li
                    key={i}
                    className="p-4 border rounded-md flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{addr.name}</p>
                      <p className="text-sm text-gray-600">
                        {addr.address || addr.areaLocality}
                      </p>
                    </div>
                    <button className="text-blue-600 text-sm hover:underline">
                      Edit
                    </button>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-4 bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
              >
                Add New Address
              </button>
            </div>
          ) : null}

          {showAddForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Map Section */}
                  <div className="w-full md:w-1/2">
               
                    <p className="text-sm text-gray-500 mt-2">
                      Click on the map to select your location
                    </p>
                  </div>

                  {/* Form Section */}
                  <div className="w-full md:w-1/2 space-y-4">
                    <h2 className="font-semibold text-lg mb-4">
                      Enter complete address
                    </h2>
                    <form onSubmit={handleAddAddress} className="space-y-4">
                      <select
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-600"
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, type: e.target.value })
                        }
                        required
                      >
                        <option value="Home">Home</option>
                        <option value="Work">Work</option>
                        <option value="Hotel">Hotel</option>
                        <option value="Other">Other</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Flat / House no / Building name *"
                        value={newAddress.flatHouse}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            flatHouse: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-600"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Floor (optional)"
                        value={newAddress.floor || ""}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            floor: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-600"
                      />
                      <input
                        type="text"
                        placeholder="Area / Sector / Locality *"
                        value={newAddress.areaLocality}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            areaLocality: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-600"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Nearby landmark (optional)"
                        value={newAddress.landmark}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            landmark: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-600"
                      />
                      <p className="text-sm text-gray-500">
                        Enter your details for seamless delivery experience
                      </p>
                      <input
                        type="text"
                        placeholder="Your name *"
                        value={newAddress.name}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, name: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-600"
                        required
                      />
                      <input
                        type="tel"
                        placeholder="Your phone number (optional)"
                        value={newAddress.phone}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            phone: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-600"
                      />
                      <button
                        type="submit"
                        className="w-full bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
                      >
                        Save Address
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="w-full text-gray-600 hover:underline"
                      >
                        Cancel
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
