"use client";

import { useState } from "react";
import Image from "next/image";
export default function ProductDetails() {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("L");
  const [showGuide, setShowGuide] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  const images = [
    "/images/front.png",
    "/images/back.png",
    "/images/detail1.png",
    "/images/detail2.png",
    "/images/detail3.png",
    "/images/detail4.png",
  ];

  return (
    <>
      <section className="mx-auto flex w-[1750px] gap-1 bg-[#EFEFEF] px-[21px] py-5">
        {/* LEFT FIXED IMAGE */}
        <div className="w-[32%] shrink-0">
          <div className="h-[700px] overflow-hidden rounded-[8px] bg-[#BF5550]">
            <Image
              src="images/Price-detail/rcb-pricedetailL.png"
              alt="Front Jersey"
              width={7000}
              height={900}
              className="h-full w-full object-contain"
            />
          </div>
        </div>

        {/* MIDDLE SCROLLABLE IMAGES */}
        <div className="h-[800px] w-[4525px] overflow-y-auto pr-1">
          <div className="flex flex-col gap-3">
            {/* Gallery 1 */}
            <div className="h-[700px] shrink-0 overflow-hidden rounded-[8px] bg-[#BF5550]">
              <Image
                src="/images/Price-detail/rcb-pricedetailR.png"
                alt="Gallery 1"
                width={700}
                height={900}
                className="h-full w-full object-contain"
              />
            </div>

            {/* Gallery 2+ */}
            {[
              "/images/detail1.png",
              "/images/detail2.png",
              "/images/detail3.png",
              "/images/detail4.png",
            ].map((img, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-[8px] bg-[#C45B53]"
              >
                <Image
                  src={img}
                  alt={`Gallery ${index + 2}`}
                  width={700}
                  height={900}
                  className="w-full object-contain"
                />
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PRODUCT DETAILS */}
        <div className="h-[800px] w-[4525px] overflow-y-auto pr-1">
          <div className="rounded-[10px] border border-[#ddd] bg-white p-4">
            {/* TITLE */}
            <h1 className="text-[24px] font-medium">
              Bengaluru Practice Jersey 2026
            </h1>

            {/* PRICE */}
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[40px] font-bold text-[#f97316]">
                ₹1200
              </span>

              <span className="text-gray-400 line-through">₹2500</span>

              <span className="rounded bg-orange-500 px-2 py-[2px] text-[10px] text-white">
                -45%
              </span>
            </div>

            <p className="text-sm text-green-600">You saved ₹1300</p>

            {/* SIZE */}
            <div className="mt-5">
              <div className="mb-3 flex justify-right gap-4">
                <button
                  onClick={() => setShowGuide(true)}
                  className="shrink-0 rounded bg-[#e9e9e9] px-7 py-2 text-11px text-right flex justify-right"
                >
                  Size Guide
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[90px] rounded-full border px-4 py-2 text-sm transition ${
                      selectedSize === size
                        ? "border-black bg-black text-white"
                        : "bg-white hover:border-black"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* QUANTITY + NAME */}
<div className="mt-8 flex gap-4">

  {/* Quantity */}
  <div className="w-1/2">
    <div className="mb-2 rounded bg-[#E9E9E9] py-2 text-center text-sm">
      Quantity
    </div>

    <div className="flex items-center justify-between rounded bg-white px-3 py-2">
      <button
        onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
        className="flex h-5 w-5 items-center justify-center rounded bg-black text-white"
      >
        −
      </button>

      <span className="text-[20px] font-medium">
        {quantity}
      </span>

      <button
        onClick={() => setQuantity((prev) => prev + 1)}
        className="flex h-5 w-5 items-center justify-center rounded bg-black text-white"
      >
        +
      </button>
    </div>
  </div>

  {/* Name & Number */}
  <div className="w-1/2">
    <div className="mb-2 rounded bg-[#E9E9E9] py-2 text-center text-sm">
      Name and T.shirt Number
    </div>

    <div className="flex gap-2">
      <input
        type="text"
        placeholder="MRUDULA"
        className="h-[47px] flex-1 rounded bg-white px-3 outline-none"
      />

      <input
        type="text"
        placeholder="07"
        className="h-[47px] w-[30px] rounded bg-white text-center outline-none"
      />
    </div>
  </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex gap-2">
              <button className="flex-1 rounded bg-[#EB6434E5] py-4 font-semibold text-white">
                ADD TO CART ₹330 to free shipping
              </button>

              <button className="flex h-[70px] w-[56px] items-center justify-center rounded border">
                ♡
              </button>

              <button className="flex h-[70px] w-[56px] items-center justify-center rounded border border-green-500 text-green-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 35 37"
                  fill="currentColor"
                  className="h-6 w-6"
                >
                  <path d="M16.04 3C8.84 3 3 8.72 3 15.78c0 2.47.72 4.86 2.08 6.92L3 29l6.53-2.02a13.2 13.2 0 006.51 1.72C23.24 28.7 29 22.98 29 15.92 29 8.72 23.24 3 16.04 3zm7.7 18.04c-.32.88-1.86 1.68-2.58 1.8-.66.1-1.5.15-2.42-.14-.56-.18-1.28-.42-2.2-.82-3.88-1.68-6.4-5.62-6.6-5.88-.18-.26-1.58-2.1-1.58-4.02s1-2.86 1.36-3.24c.36-.38.78-.48 1.04-.48h.74c.24 0 .56-.08.88.7.32.78 1.08 2.7 1.18 2.9.1.2.16.44.04.7-.12.26-.18.42-.36.64-.18.22-.38.48-.54.64-.18.18-.38.38-.16.74.22.36.98 1.62 2.1 2.62 1.44 1.28 2.66 1.68 3.04 1.86.38.18.6.16.82-.1.22-.26.94-1.1 1.2-1.48.26-.38.52-.32.88-.2.36.12 2.28 1.08 2.66 1.28.38.2.64.3.74.48.1.18.1 1.02-.22 1.9z" />
                </svg>
              </button>
            </div>

            {/* Description */}
            <div className="mt-6 text-sm leading-6">
              <p>
                <strong>Highly stretchable fabric.</strong> Order by your waist
                size it'll hug right.
              </p>

              <p className="mt-3">
                <strong>Real-buyer size fit:</strong> All sizes fit.
              </p>

              <p className="mt-3 text-gray-600">
                Every piece is hygiene-sealed. COD available only when it
                reaches you.
              </p>
            </div>

            {/* Tabs */}
            <div className="mt-8 rounded border">
              <div className="flex border-b">
                {["details & description", "washcare", "shipping"].map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-3 text-sm capitalize ${
                        activeTab === tab
                          ? "border-b-2 border-black font-medium"
                          : ""
                      }`}
                    >
                      {tab}
                    </button>
                  ),
                )}
              </div>

              <div className="p-4 text-sm text-gray-600">
                {activeTab === "details & description" && (
                  <>
                    <p>Details</p>
                    <p>100% cotton pique</p>
                    <p>Weight - 330 gsm</p>
                    <p>Embroidery (front & back)</p>
                    <br></br>
                    <p>Description</p>
                    <p>
                      make a powerful style statement with thebottle green
                      saddle league polo t-shirt, crafted for those who
                      appreciate bold design and premium quality. made from 100%
                      cotton with a solid 330 gsm weight, this green cotton polo
                      t-shirt offers a structured feel with everyday comfort.
                      the detailed saddle league embroidery adds depth and
                      character, giving this red embroidered polo t-shirt a
                      refined yet striking look.designed to elevate your
                      streetwear rotation, the bottle green saddle league polo
                      t-shirt pairs effortlessly with loose fit cargos for a
                      relaxed vibe or with streetwear jeans for a sharper urban
                      finish. easy to maintain with a machine reverse wash, it’s
                      a standout essential built for confident styling.
                    </p>
                  </>
                )}

                {activeTab === "washcare" && (
                  <p>Machine wash cold. Do not bleach.</p>
                )}

                {activeTab === "shipping" && (
                  <p>Standard delivery within 5–7 business days.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SIZE GUIDE MODAL */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-[500px] rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Size Guide</h2>

              <button onClick={() => setShowGuide(false)} className="text-lg">
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <p>XS - 34-36 inches</p>
              <p>S - 36-38 inches</p>
              <p>M - 38-40 inches</p>
              <p>L - 40-42 inches</p>
              <p>XL - 42-44 inches</p>
              <p>XXL - 44-46 inches</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
