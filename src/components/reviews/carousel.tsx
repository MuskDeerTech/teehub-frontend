"use client";

import { useRef, useState } from "react";

/**
 * Scroll-snap carousel plumbing, shared by the /reviews carousels.
 *
 * Both rows let the browser own the scrolling — the cards are different widths
 * in the featured row, and native scroll keeps trackpad, touch and keyboard
 * behaviour correct for free. This hook only reads the position back out so the
 * dots can reflect it and drive it.
 */
export function useCarouselDots<T extends HTMLElement>() {
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(T | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  /** The card whose left edge sits nearest the track's current scroll offset. */
  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) return;

    let nearest = 0;
    let smallest = Infinity;
    cardRefs.current.forEach((card, index) => {
      if (!card) return;
      const distance = Math.abs(card.offsetLeft - track.scrollLeft);
      if (distance < smallest) {
        smallest = distance;
        nearest = index;
      }
    });
    setActiveIndex(nearest);
  };

  const scrollTo = (index: number) => {
    const card = cardRefs.current[index];
    const track = trackRef.current;
    if (!card || !track) return;
    track.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
  };

  /** `ref` callback for card `index`. React 19 passes `ref` as a plain prop. */
  const setCardRef = (index: number) => (node: T | null) => {
    cardRefs.current[index] = node;
  };

  return { trackRef, setCardRef, activeIndex, handleScroll, scrollTo };
}

/** The dot row under a carousel: active dot stretches, the rest stay round. */
export function CarouselDots({
  count,
  activeIndex,
  onSelect,
  className = "",
}: {
  count: number;
  activeIndex: number;
  onSelect: (index: number) => void;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <button
          key={index}
          type="button"
          aria-label={`Go to slide ${index + 1}`}
          aria-current={index === activeIndex}
          onClick={() => onSelect(index)}
          className={`h-2 cursor-pointer rounded-full transition-all ${
            index === activeIndex ? "w-5 bg-[#111]" : "w-2 bg-[#d9d9d9]"
          }`}
        />
      ))}
    </div>
  );
}
