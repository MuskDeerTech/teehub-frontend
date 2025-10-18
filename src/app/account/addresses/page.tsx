// src/app/account/addresses/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import AddAddressModal from "@/components/AddAddressModal";

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

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
  console.log(window.innerWidth); // safe
}, []);


  useEffect(() => {
    // fetch addresses from your backend
    const fetchAddresses = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/addresses`,
          { credentials: "include" }
        );
        if (!res.ok) return;
        const data = await res.json();
        setAddresses(data?.docs || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAddresses();
  }, []);

  const onSaved = (addr: Address) => {
    // add saved address to list (backend returns doc ideally)
    setAddresses((prev) => [addr, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div>
        <div className="bg-white rounded-md shadow-sm p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">My addresses</h2>
            <button
              onClick={() => setOpenModal(true)}
              className="text-green-600"
            >
              + Add new address
            </button>
          </div>

          {addresses.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">You have no saved addresses</p>
              <button
                onClick={() => setOpenModal(true)}
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md"
              >
                Add New Address
              </button>
            </div>
          ) : (
            <ul className="mt-6 space-y-4">
              {addresses.map((a, i) => (
                <li
                  key={a._id ?? i}
                  className="p-4 border rounded-md flex items-start gap-4"
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                    <svg
                      width="50px"
                      height="50px"
                      viewBox="0 -398 1820 1820"
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M521.481481 860.254815h245.191112L803.081481 709.783704l-201.481481 24.272592zM1045.807407 624.82963l104.296297-12.136297-31.478519-53.475555h-92.254815zM1179.306667 666.074074L924.444444 695.182222l4.835556 165.072593h368.924444z"
                        fill="#5FFFBA"
                      />
                      <path
                        d="M1023.905185 229.167407C977.825185 182.992593 921.979259 161.185185 858.832593 161.185185s-118.897778 21.807407-165.072593 67.982222c-46.08 46.08-67.982222 99.555556-67.982222 162.607408 0 58.216296 26.737778 114.062222 77.653333 172.373333l2.465185 2.465185 70.352593 84.954074c12.136296 19.437037 24.272593 36.408889 33.943704 55.845926 19.437037 38.874074 36.408889 89.78963 51.01037 155.306667 14.601481-65.517037 31.573333-116.527407 51.01037-155.306667 19.437037-38.874074 48.545185-80.118519 87.41926-123.828148l14.601481-19.437037c51.01037-58.216296 77.653333-114.062222 77.653333-172.373333 0-63.146667-21.807407-118.897778-67.982222-162.607408zM856.462222 510.672593c-67.982222 0-123.828148-55.845926-123.828148-123.828149s55.845926-123.828148 123.828148-123.828148 123.828148 55.845926 123.828148 123.828148S924.444444 510.672593 856.462222 510.672593z"
                        fill="#FFA28D"
                      />
                      <path
                        d="M642.844444 666.074074l133.49926-14.601481-70.352593-84.954074z"
                        fill="#5FFFBA"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {a.label
                            ? a.label.charAt(0).toUpperCase() + a.label.slice(1)
                            : "Other"}
                        </div>

                        {/* Capitalize label */}
                        <div className="text-sm text-gray-600">{`${a.name},${a.flatHouse}, ${a.areaLocality}`}</div>
                      </div>
                      <div className="text-sm text-gray-400">⋮</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <AddAddressModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSaved={onSaved}
      />
    </div>
  );
}
