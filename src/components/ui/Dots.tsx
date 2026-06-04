/**
 * Slider/carousel dots. The original markup rendered these but had no CSS
 * (so they were invisible); given minimal visible styling here.
 * No "use client" — usable from both server and client components.
 */
export default function Dots({
  tone = "light",
  count = 4,
  active = 2,
}: {
  tone?: "light" | "dark";
  count?: number;
  active?: number;
}) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={`h-2 w-2 rounded-full transition-colors ${
            i === active
              ? tone === "light"
                ? "bg-white"
                : "bg-[#ff5b1f]"
              : tone === "light"
                ? "bg-white/50"
                : "bg-black/30"
          }`}
        />
      ))}
    </div>
  );
}
