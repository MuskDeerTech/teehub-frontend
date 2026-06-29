import type { Metadata } from "next";
import TrackOrderForm from "./TrackOrderForm";

export const metadata: Metadata = {
  title: "Track Order - TeeHub",
  description: "Track your TeeHub shipment using your order ID or tracking ID/AWB.",
};

export default function TrackOrderPage() {
  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#f7f7f7] px-[clamp(16px,4vw,80px)] py-10 sm:py-14">
      <TrackOrderForm />
    </main>
  );
}
