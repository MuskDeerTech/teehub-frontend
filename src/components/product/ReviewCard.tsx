import Image from "next/image";
import { format, formatDistanceToNow } from "date-fns";
import {
  IconPlayerPlayFilled,
  IconRosetteDiscountCheck,
  IconThumbDown,
  IconThumbUp,
} from "@tabler/icons-react";
import Stars from "@/components/product/Stars";
import type { Review } from "@/lib/reviews";

/**
 * One customer review: attribution, score, body, uploaded media and the
 * purchase footer.
 *
 * The helpful/not-helpful figures render as read-only counts. There's no vote
 * endpoint yet, and buttons that silently do nothing are worse than plain
 * numbers — they can become interactive when the review page ships its route.
 */
export default function ReviewCard({ review }: { review: Review }) {
  const posted = new Date(review.createdAt);

  return (
    <article className="border-t border-[#ededed] py-4 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="flex items-center gap-1 text-[13px] font-semibold text-[#111]">
            {review.authorName}
            {review.isVerifiedBuyer && (
              <IconRosetteDiscountCheck
                size={15}
                aria-label="Verified buyer"
                className="text-[#0f7a45]"
              />
            )}
          </span>

          <Stars rating={review.rating} size={12} />
          <span className="text-[12px] font-medium text-[#111]">
            {review.rating}
          </span>

          <span className="text-[11px] text-[#9a9a9a]">
            {formatDistanceToNow(posted, { addSuffix: true })}
          </span>
        </div>

        {review.helpfulCount > 0 && (
          <span className="flex items-center gap-2 text-[11px] text-[#8a8a8a]">
            {review.helpfulCount} People found this helpful
            <IconThumbUp size={15} stroke={1.7} aria-hidden="true" />
            <IconThumbDown size={15} stroke={1.7} aria-hidden="true" />
          </span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-start gap-3">
        <p className="min-w-[200px] flex-1 text-[12px] leading-relaxed text-[#555]">
          {review.body}
        </p>

        {review.media.length > 0 && (
          <ul className="flex shrink-0 gap-2">
            {review.media.map((media) => (
              <li
                key={media.src}
                className="relative h-16 w-16 overflow-hidden rounded-md bg-[#f2f2f2]"
              >
                {media.isVideo ? (
                  // The poster frame comes from the video itself; the overlay
                  // marks it as playable in the list.
                  <>
                    <video
                      src={media.src}
                      muted
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e8342a] shadow-sm">
                        <IconPlayerPlayFilled
                          size={12}
                          className="text-white"
                          aria-label="Video review"
                        />
                      </span>
                    </span>
                  </>
                ) : (
                  <Image
                    src={media.src}
                    alt={media.alt}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {(review.sizeBought || review.purchasedAt) && (
        <p className="mt-2 text-[10px] text-[#a5a5a5]">
          {review.sizeBought && <>Size Bought {review.sizeBought}</>}
          {review.sizeBought && review.purchasedAt && " | "}
          {review.purchasedAt && (
            <>
              Purchased on {format(new Date(review.purchasedAt), "do MMM yyyy")}
            </>
          )}
        </p>
      )}
    </article>
  );
}
