import Image from "next/image";
import { REVIEWS_GUTTER } from "@/components/reviews/gutter";
import { reviewStats } from "@/lib/reviewsPage";

const TEXT_28 = "text-[clamp(17px,1.95vw,28px)]"; // the headline figure
const TEXT_13 = "text-[clamp(9.5px,0.9vw,13px)]"; // its caption

/**
 * The dark figures strip closing the page: four store-wide numbers with the
 * icon set from `/svg/review/`.
 *
 * Hairline dividers between the cells on desktop only — once the grid folds to
 * two columns the vertical rules land between unrelated pairs, so they go.
 */
export default function ReviewStats() {
  return (
    <section className={`pb-[clamp(32px,5.4vw,78px)] ${REVIEWS_GUTTER}`}>
      <div className="grid grid-cols-1 gap-y-[clamp(20px,2.4vw,35px)] rounded-[clamp(8px,1.1vw,16px)] bg-[#141414] px-[clamp(18px,2.4vw,35px)] py-[clamp(20px,2.4vw,35px)] sm:grid-cols-2 lg:grid-cols-4">
        {reviewStats.map((stat, index) => (
          <div
            key={stat.id}
            className={`flex items-center gap-[clamp(10px,1.4vw,20px)] lg:px-[clamp(10px,1.7vw,24px)] ${
              index > 0 ? "lg:border-l lg:border-white/12" : ""
            }`}
          >
            {/* The artwork carries its own orange, so it ships untouched. */}
            <Image
              src={stat.icon}
              alt=""
              width={53}
              height={58}
              className="h-auto w-[clamp(26px,3.26vw,47px)] shrink-0"
            />

            <div className="min-w-0">
              <p className={`font-sans ${TEXT_28} font-bold leading-none text-white`}>
                {stat.value}
              </p>
              <p
                className={`mt-[0.45em] font-sans ${TEXT_13} leading-[1.4] text-[#b8b8b8]`}
              >
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
