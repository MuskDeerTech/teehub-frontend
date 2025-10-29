"use client";

import Image from "next/image";

interface SizeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  chartType: "men" | "women" | "kids";
}

export default function SizeChartModal({
  isOpen,
  onClose,
  chartType,
}: SizeChartModalProps) {
  if (!isOpen) return null;

  const chartImage =
    chartType === "women"
      ? "/images/size-chart-women.jpg"
      : chartType === "kids"
      ? "/images/size-chart-kid.jpg"
      : "/images/size-chart-men.jpg";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white  max-w-3xl w-full max-h-[80vh] overflow-y-auto relative shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-gray-100 hover:bg-gray-200 rounded-full p-2 w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-800 transition"
        >
          ✕
        </button>

        <div className="p-4 text-center">
          <h2 className="text-xl font-semibold mb-4 capitalize">
            Size Chart for {chartType}
          </h2>

          <Image
            unoptimized
            src={chartImage}
            alt={`Size Chart - ${chartType}`}
            width={800}
            height={600}
            className="mx-auto rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}
