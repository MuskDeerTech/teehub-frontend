import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "localhost", // local dev
      "ecommerce-backend-psi-rose.vercel.app", // Payload backend prod
      "teehub-frontend.vercel.app", // Frontend prod if needed
      "teehubshop.com", // ✅ WordPress domain
      "www.teehubshop.com", // ✅ WordPress domain with www
      "https://teehubshop.com/", // ✅ Full URL variant
    ],
  },
};

export default nextConfig;