import Image from "next/image";
import Link from "next/link";
import {
  IconArrowRight,
  IconBrandInstagram,
  IconRosetteDiscountCheckFilled,
} from "@tabler/icons-react";
import Stars from "@/components/product/Stars";
import { REVIEWS_GUTTER } from "@/components/reviews/gutter";
import { formatRupees } from "@/lib/products";
import { fanGallery, type FanGalleryPost } from "@/lib/reviewsPage";

const ORANGE = "#f26522";

/** Type ramp, same construction as the rest of the page: each maximum is the
 *  Figma value at 1440 and the `vw` figure is that value over 1440. */
const TEXT_40 = "text-[clamp(22px,2.78vw,40px)]"; // section heading (SF Pro)
const TEXT_14 = "text-[clamp(10px,0.97vw,14px)]"; // reviewer name
const TEXT_13 = "text-[clamp(9.5px,0.9vw,13px)]"; // body, product name, price
const TEXT_12 = "text-[clamp(9px,0.83vw,12px)]"; // rating figure, CTA
const TEXT_11 = "text-[clamp(8.5px,0.76vw,11px)]"; // product variant line

/** The card's own dark surface, and the darker inset the product sits on. */
const CARD_BG = "#141414";
const PRODUCT_BG = "#1e1e1e";

/**
 * The product a fan is wearing: thumbnail, name, colourway, price, and an
 * arrow through to the product page.
 *
 * The whole tile is the link rather than just the arrow — the arrow is the
 * affordance, but a 12px hit target inside a card this dense is not one.
 */
function ProductTile({ product }: { product: FanGalleryPost["product"] }) {
  return (
    <Link
      href={product.href}
      className="group mt-auto flex items-center gap-[clamp(6px,0.83vw,12px)] rounded-[clamp(5px,0.7vw,10px)] border border-white/10 p-[clamp(5px,0.7vw,10px)] transition-colors hover:border-white/25"
      style={{ background: PRODUCT_BG }}
    >
      <span className="relative aspect-square w-[clamp(34px,4.3vw,62px)] shrink-0 overflow-hidden rounded-[clamp(4px,0.55vw,8px)] bg-white/5">
        <Image
          src={product.image.src}
          alt=""
          fill
          sizes="62px"
          className="object-contain"
        />
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={`block truncate font-sans ${TEXT_13} font-semibold text-white`}
        >
          {product.name}
        </span>
        <span
          className={`mt-[0.2em] block truncate font-sans ${TEXT_11} text-[#9a9a9a]`}
        >
          {product.variant}
        </span>
        <span
          className={`mt-[0.35em] block font-sans ${TEXT_13} font-semibold text-white`}
        >
          {formatRupees(product.price)}
        </span>
      </span>

      <span
        aria-hidden="true"
        className="flex aspect-square w-[clamp(20px,2.15vw,31px)] shrink-0 items-center justify-center rounded-full border transition-colors group-hover:bg-[#f26522] group-hover:text-white"
        // Font size matches the circle so the glyph inside scales with it
        // rather than staying pinned to the inherited body size.
        style={{
          borderColor: ORANGE,
          color: ORANGE,
          fontSize: "clamp(20px,2.15vw,31px)",
        }}
      >
        <IconArrowRight size="0.45em" stroke={2.2} />
      </span>
    </Link>
  );
}

function FanCard({ post }: { post: FanGalleryPost }) {
  return (
    <article
      className="flex flex-col overflow-hidden rounded-[clamp(8px,1.1vw,16px)]"
      style={{ background: CARD_BG }}
    >
      <div className="relative aspect-305/252 w-full shrink-0 overflow-hidden bg-[#222]">
        <Image
          src={post.photo.src}
          alt={post.photo.alt}
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 305px"
          className="object-cover"
        />

        {/* Lets the photo settle into the card instead of ending on a hard
            edge, which is what the mock does under every tile. */}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-[#141414] to-transparent"
        />

        <IconBrandInstagram
          size="1em"
          stroke={1.8}
          aria-hidden="true"
          className="absolute top-[clamp(6px,0.83vw,12px)] right-[clamp(6px,0.83vw,12px)] text-white/85"
          style={{ fontSize: "clamp(11px,1.1vw,16px)" }}
        />
      </div>

      <div className="flex flex-1 flex-col p-[clamp(8px,0.83vw,12px)] pt-[clamp(4px,0.5vw,7px)]">
        <div className="flex items-center justify-between gap-[clamp(4px,0.7vw,10px)]">
          <span
            className={`flex min-w-0 items-center gap-[0.35em] font-sans ${TEXT_14} font-semibold text-white`}
          >
            <span className="truncate">{post.authorName}</span>
            {post.isVerified && (
              <IconRosetteDiscountCheckFilled
                size="1em"
                aria-label="Verified buyer"
                className="shrink-0"
                style={{ color: ORANGE }}
              />
            )}
          </span>

          <span
            className={`flex shrink-0 items-center gap-[0.35em] font-sans ${TEXT_12} font-medium text-white`}
          >
            <Stars
              rating={post.rating}
              size="1em"
              color={ORANGE}
              className="text-[clamp(8px,0.76vw,11px)]"
            />
            {post.rating.toFixed(1)} ({post.ratingCount})
          </span>
        </div>

        <p
          className={`mt-[clamp(5px,0.7vw,10px)] mb-[clamp(8px,1.1vw,16px)] font-sans ${TEXT_13} leading-[1.55] text-[#b8b8b8]`}
        >
          {post.body}
        </p>

        <ProductTile product={post.product} />
      </div>
    </article>
  );
}

/**
 * "Fan Gallery" — four customer photos with the piece each one bought.
 *
 * A plain grid rather than a carousel: the design shows the full set at once
 * and there is no overflow to scroll through. It steps down to two columns and
 * then one, since a card any narrower than this truncates the product name to
 * nothing.
 */
export default function FanGallery() {
  return (
    <section className={`py-[clamp(32px,5.4vw,78px)] ${REVIEWS_GUTTER}`}>
      <div className="flex items-center justify-between gap-4">
        <h2
          className={`font-sfpro ${TEXT_40} font-bold uppercase tracking-[0.2px] text-[#111]`}
        >
          Fan Gallery
        </h2>

        <Link
          href="/all/"
          className={`shrink-0 rounded-full px-[clamp(14px,2vw,29px)] py-[clamp(7px,1vw,15px)] font-sans ${TEXT_12} font-semibold uppercase tracking-[0.5px] text-white transition-opacity hover:opacity-90`}
          style={{ background: ORANGE }}
        >
          View All
        </Link>
      </div>

      <div className="mt-[clamp(18px,3vw,43px)] grid grid-cols-1 gap-[clamp(10px,1.25vw,18px)] sm:grid-cols-2 lg:grid-cols-4">
        {fanGallery.map((post) => (
          <FanCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
