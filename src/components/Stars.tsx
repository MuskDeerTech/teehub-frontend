// src/components/Stars.tsx
import React from "react";

interface StarsProps {
  rating: number;
}

export const Stars = ({ rating }: StarsProps) => (
  <div className="flex">
    {[...Array(5)].map((_, i) => (
      <span key={i} className={i < rating ? "text-yellow-400" : "text-gray-300"}>
        ★
      </span>
    ))}
  </div>
);
