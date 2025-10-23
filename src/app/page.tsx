"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types/Product";

interface AttributeValue {
  id: string;
  value: string;
  attribute: {
    id: string;
    name: string;
  };
}

interface Review {
  id: string;
  rating: number;
  review: string;
  user?: {
    id: string;
    name: string;
    image?: {
      url: string;
    };
  };
  createdAt: string;
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [tabs, setTabs] = useState<string[]>([]);
  const [colors, setColors] = useState<AttributeValue[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/products?limit=100`
        );
        const data = (await res.json()) as { docs: Product[] };
        const allProducts = data?.docs || [];
        setProducts(allProducts);

        // Extract distinct themes
        const themes = Array.from(
          new Set(
            allProducts
              .map((p) => {
                const themeAttr = p.attributes?.find(
                  (a) => a.attribute.name.toLowerCase() === "theme"
                );
                return themeAttr?.values?.map((v) => v.value) || [];
              })
              .flat()
              .filter(Boolean)
          )
        );
        setTabs(themes);
        if (themes.length) setActiveTab(themes[0]);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };

    const fetchColors = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/attribute-values?limit=50`
        );
        const data = (await res.json()) as { docs: AttributeValue[] };
        const colorValues = data.docs.filter(
          (v) => v.attribute?.name?.toLowerCase() === "colors"
        );
        setColors(colorValues);
      } catch (err) {
        console.error("Failed to fetch colors:", err);
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/reviews?limit=10`
        );
        const data = (await res.json()) as { docs: Review[] };
        setReviews(data.docs || []);
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
      }
    };

    fetchProducts();
    fetchColors();
    fetchReviews();
  }, []);

  // Filter products by active tab (theme)
  const filteredProducts = products.filter((p) =>
    p.attributes?.some(
      (a) =>
        a.attribute.name.toLowerCase() === "theme" &&
        a.values.some((v) => v.value === activeTab)
    )
  );

  return (
    <div className="flex flex-col">
      {/* 🔶 HERO + SIDE CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative md:col-span-2 rounded-3xl overflow-hidden bg-gray-900 text-white h-[400px] md:h-[500px]  cursor-pointer"
        >
          <Image
            src="/Custom-Tees-Banner.png"
            alt="Custom Tees Banner"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 flex flex-col justify-between p-8 md:p-12">
            <h1 className="text-3xl md:text-5xl font-bold leading-tight max-w-lg">
              Custom Tees & Jerseys that speak your style
            </h1>
            <div className="flex justify-end">
              <Link href="/custom-design">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="bg-white text-black font-semibold px-6 py-3 rounded-full shadow-md hover:bg-gray-200"
                >
                  Design Yours
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col gap-4">
          {[
            { title: "Outdoor Active", img: "/Outdoor-Active.png" },
            { title: "Casual Comfort", img: "/Casual-Comfort.png" },
          ].map((item) => (
            <motion.div
              key={item.title}
              whileHover={{ scale: 1.03 }}
              className="relative rounded-3xl overflow-hidden h-[240px] group cursor-pointer"
            >
              <Image
                src={item.img}
                alt={item.title}
                fill
                className="object-cover group-hover:opacity-80 transition"
              />
              <div className="absolute inset-0 flex items-start justify-start p-6">
                <p className="text-lg md:text-xl font-semibold text-black">
                  {item.title}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 🔶 3-COLUMN SECTION */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 ">
        <div className="flex items-center justify-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-snug">
            Wear What You Stand For
          </h2>
        </div>
        {[
          { title: "Gear Up Game On", img: "/Gear-Up-Game-On.png" },
          { title: "Sport Your Spirit", img: "/Sport-Your-Spirit.png" },
        ].map((item) => (
          <motion.div
            key={item.title}
            whileHover={{ scale: 1.03 }}
            className="relative rounded-3xl overflow-hidden h-[300px] group cursor-pointer"
          >
            <Image
              src={item.img}
              alt={item.title}
              fill
              className="object-cover group-hover:opacity-80 transition"
            />
            <div className="absolute inset-0 flex items-end justify-between p-6">
              <p className="text-lg md:text-xl font-semibold text-white">
                {item.title}
              </p>
              <svg
                width="40"
                height="40"
                viewBox="0 0 50 50"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M32.617 20.3292L32.6318 30.8916H36.786V13.2139H19.1083L19.1083 17.3682L29.6708 17.3829L11.7426 35.311L14.6889 38.2573L32.617 20.3292Z"
                  fill="white"
                />
              </svg>
            </div>
          </motion.div>
        ))}
      </section>

      {/* 🔶 TRENDING SECTION */}
      <section className="py-12 px-6">
        <div className="flex justify-between mb-8 flex-wrap gap-4">
          <h2 className="text-3xl font-bold">Trending</h2>
          <div className="flex gap-3 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full font-medium transition ${
                  activeTab === tab
                    ? "bg-black text-white"
                    : "border border-gray-300 text-gray-700 hover:bg-black hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((p) => <ProductCard key={p.id} product={p} />)
          ) : (
            <p className="text-center col-span-full text-gray-500">
              No products found for {activeTab}.
            </p>
          )}
        </div>
      </section>

      {/* 🔶 EXPLORE BY COLORS */}
      <section className="py-12 border-t border-[#C7CBD4] px-6 grid-col-1 grid md:grid-cols-[30%_70%] items-start gap-6">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-6 leading-tight md:max-w-[100px]">
          Explore by Colors
        </h2>

        <div className="flex flex-wrap justify-start gap-4">
          {colors.length > 0 ? (
            colors.map((color) => {
              const bg = color.value.toLowerCase();
              const isWhite =
                bg === "white" || bg === "#ffffff" || bg === "rgb(255,255,255)";
              return (
                <Link
                  href={`/colors/${encodeURIComponent(
                    color.value.toLowerCase()
                  )}`}
                  key={color.id}
                  className="px-5 py-2 rounded-full flex items-center gap-2 cursor-pointer hover:bg-gray-100 border border-[#C7CBD4]"
                >
                  <span
                    className={`w-7 h-7 rounded-full ${
                      isWhite ? "border border-gray-300" : ""
                    }`}
                    style={{ backgroundColor: bg }}
                  ></span>
                  <span className="font-medium uppercase">{color.value}</span>
                </Link>
              );
            })
          ) : (
            <p className="text-gray-500">No colors found</p>
          )}
        </div>
      </section>

      {/* 🔶 WHAT THE BUZZ IS ABOUT */}
      <section className="py-12 border-t-[0.5px] border-[#C7CBD4] px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-10">
          What the Buzz Is About
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 ">
          {reviews.length > 0 ? (
            reviews.map((r) => (
              <div
                key={r.id}
                className="bg-white shadow-md rounded-2xl p-6 text-left flex flex-col justify-between"
              >
                {/* Stars */}
                <div className="flex text-yellow-400 mb-4">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.965a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.286 3.965c.3.921-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.197-1.539-1.118l1.285-3.965a1 1 0 00-.364-1.118L2.05 9.392c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.965z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 mb-6">{r.review}</p>
                <div className="flex items-center gap-3 mt-auto">
                  {r.user?.image ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}${r.user.image.url}`}
                      alt={r.user.name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300"></div>
                  )}
                  <div>
                    <p className="font-semibold">
                      {r.user?.name || "Anonymous"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 col-span-full">No reviews yet</p>
          )}
        </div>
      </section>

      {/* 🔶 WHAT MAKES SHOPPING SPECIAL */}
      <section className="py-16 px-6  border-t border-[#C7CBD4]">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-12 ">
          What Makes Shopping with Us Special
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 ">
          {[
            {
              icon: (
                <svg
                  width="50"
                  height="50"
                  viewBox="0 0 120 120"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="120" height="120" rx="60" fill="#121212" />
                  <g clip-path="url(#clip0_369_1447)">
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M44.8478 58.0425H45.7074L45.7222 50.0511C45.9003 46.2817 47.5333 42.9032 50.0644 40.4576L50.0844 40.4376C52.6631 37.9573 56.165 36.4316 60 36.4316C63.842 36.4316 67.3536 37.9624 69.9356 40.4576C72.5137 42.9501 74.1614 46.4109 74.2868 50.2658L74.2939 58.0425H75.1522C76.2123 58.0425 77.1799 58.4771 77.8723 59.1702L78.0581 59.3791C78.6438 60.0574 79 60.9356 79 61.8903V81.5738C79 82.6339 78.5654 83.6015 77.8723 84.2939C77.1799 84.987 76.2123 85.4216 75.1522 85.4216H44.8478C43.7877 85.4216 42.8201 84.987 42.1277 84.2939C41.4346 83.6015 41 82.6339 41 81.5738V61.8903C41 60.8392 41.4327 59.8793 42.1277 59.1792C42.8201 58.4771 43.7877 58.0425 44.8478 58.0425ZM60 65.0265C61.4221 65.0265 62.5749 66.1792 62.5749 67.6013C62.5749 68.7258 61.8548 69.6805 60.8506 70.0322L61.2871 72.0355L62.5749 77.9394H60H57.4251L58.7129 72.0355L59.1494 70.0322C58.1452 69.6805 57.4251 68.7258 57.4251 67.6013C57.4251 66.1792 58.5779 65.0265 60 65.0265ZM50.3229 58.0425H69.6771V50.3385C69.5807 47.7578 68.4678 45.4433 66.7422 43.7743C64.9967 42.0828 62.6186 41.0503 60 41.0503C57.3833 41.0503 55.0065 42.0816 53.27 43.7615C51.5541 45.4234 50.4463 47.7019 50.3209 50.244L50.3229 58.0425Z"
                      fill="white"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_369_1447">
                      <rect
                        width="48"
                        height="48"
                        fill="white"
                        transform="translate(36 36)"
                      />
                    </clipPath>
                  </defs>
                </svg>
              ),
              title: "Secure Payment",
              desc: "We take care your package with full of attention and of course full of love. We want to make sure you’ll receive your package like you receive your birthday gift.",
            },
            {
              icon: (
                <svg
                  width="50"
                  height="50"
                  viewBox="0 0 120 120"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="120" height="120" rx="60" fill="#121212" />
                  <path
                    d="M73.995 76C56.9317 76.0242 43.9818 62.919 44 46.005C44 44.9005 44.8955 44 46 44H51.2787C52.2699 44 53.1119 44.7283 53.2574 45.7087C53.6062 48.0584 54.2903 50.3459 55.289 52.5014L55.4945 52.945C55.7803 53.5618 55.5866 54.2947 55.0334 54.6897C53.3986 55.8572 52.7738 58.2071 54.0474 60.0407C55.6456 62.3417 57.6601 64.3558 59.9605 65.9532C61.794 67.2264 64.1436 66.6018 65.311 64.9673C65.7063 64.4138 66.4396 64.22 67.0568 64.5059L67.4984 64.7104C69.654 65.709 71.9417 66.3932 74.2917 66.7419C75.2721 66.8874 76 67.7294 76 68.7205V74C76 75.1045 75.1024 76 73.9978 76L73.995 76Z"
                    fill="white"
                  />
                </svg>
              ),
              title: "Friendly Service",
              desc: "You do not need to worry when you want to check your package. We will always answer whatever your questions. Just click on the chat icon and we will talk.",
            },
            {
              icon: (
                <svg
                  width="50"
                  height="50"
                  viewBox="0 0 120 120"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="120" height="120" rx="60" fill="#121212" />
                  <path
                    d="M44 76.0002V62.0002H58L51.566 68.4402C53.7859 70.7102 56.8249 71.993 60 72.0002C65.0789 71.9927 69.603 68.7886 71.296 64.0002H71.332C71.5611 63.3494 71.7344 62.6803 71.85 62.0002H75.874C74.8661 70 68.063 75.9999 60 76.0002H59.98C55.7375 76.0128 51.6663 74.3276 48.674 71.3202L44 76.0002ZM48.148 58.0002H44.124C45.1315 50.0034 51.93 44.0044 59.99 44.0001H60C64.2433 43.9865 68.3154 45.6718 71.308 48.6802L76 44.0001V58.0002H62L68.444 51.5602C66.2218 49.2875 63.1786 48.0044 60 48.0002C54.9211 48.0077 50.397 51.2117 48.704 56.0002H48.668C48.4371 56.6504 48.2638 57.3196 48.15 58.0002H48.148Z"
                    fill="white"
                  />
                </svg>
              ),
              title: "Refund Process",
              desc: "Refund is a such bad experience and we don’t want that thing happen to you. But when it’s happen we will make sure you will through smooth and friendly process.",
            },
          ].map((item) => (
            <div key={item.title} className="flex flex-col  px-4 ">
              {item.icon}
              <h3 className="text-xl font-semibold mb-2 mt-4">{item.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 🔶 CURRENTLY IN FASHION */}
      <section className="py-16 px-6 border-t border-[#C7CBD4] grid grid-cols-1 md:grid-cols-2 items-center gap-10 ">
        <div className="relative rounded-2xl overflow-hidden">
          <Image
            src="/fashion.png"
            alt="Currently in Fashion"
            width={600}
            height={400}
            className="rounded-2xl object-cover"
          />
        </div>
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Wear Your Team, Own the Game
          </h2>
          <p className="text-gray-700 mb-6">
            From stadium cheers to street style, our IPL T-shirts keep your
            spirit alive.
          </p>
          <Link href="/collections/ipl" className="inline-block">
            <button className="border border-black px-6 py-2 rounded-full font-medium hover:bg-black hover:text-white transition">
              View More
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
