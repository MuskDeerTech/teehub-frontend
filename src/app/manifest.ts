import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TeeHub - Premium Sports Jerseys, Hoodies & Polos",
    short_name: "TeeHub",
    description:
      "Shop IPL jerseys, football hoodies, jackets and polo t-shirts at TeeHub.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
