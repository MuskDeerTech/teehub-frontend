import Image from "next/image";
import Link from "next/link";
import type {
  HomepageChildrensCorner,
  HomepageChildrensCornerItem,
} from "@/lib/homepage";

const config = {
  section: {
    paddingX: "px-[30px]",
    paddingXLg: "min-[1440px]:px-20",
    paddingY: "py-[40px]",
    paddingYLg: "min-[1440px]:py-[60px]",
  },
  header: {
    gapHeaderToCards: "mb-[30px]",
  },
} as const;

const CARD_BODY_PATH =
  "M167.333 0.5H8.66667C4.15634 0.5 0.5 4.15634 0.5 8.66667V167.333C0.5 171.844 4.15634 175.5 8.66667 175.5H167.333C171.844 175.5 175.5 171.844 175.5 167.333V8.66667C175.5 4.15634 171.844 0.5 167.333 0.5Z";

/**
 * Card shell exported from Figma (public/svg/children.svg) inlined so the
 * CMS can drive it: the uploaded card artwork fills the body (falling back
 * to the original blue gradient while empty), and the bottom tab + outlines
 * take the colour picked in Payload.
 */
function CardShell({
  tabColor,
  cardImage,
  uid,
}: {
  tabColor: string;
  cardImage: string | null;
  uid: string;
}) {
  const gradientId = `cc-grad-${uid}`;
  const clipId = `cc-clip-${uid}`;

  return (
    <svg
      viewBox="0 0 186 236"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="block h-auto w-full"
      aria-hidden="true"
    >
      {/* coloured tab poking out below the white strip */}
      <path
        d="M184.5 166.979V223.499C184.5 229.574 179.575 234.499 173.5 234.499H28.1858C19.9015 234.499 13.1858 227.783 13.1858 219.499V166.979H184.5Z"
        fill={tabColor}
        stroke={tabColor}
        strokeWidth="2"
      />
      {/* card body: uploaded artwork, or the blue gradient placeholder */}
      <path
        d={CARD_BODY_PATH}
        fill={cardImage ? "#e9e9e9" : `url(#${gradientId})`}
        stroke={tabColor}
      />
      {cardImage && (
        <image
          href={cardImage}
          x="0.5"
          y="0.5"
          width="175"
          height="175"
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#${clipId})`}
        />
      )}
      {/* white logo strip */}
      <path
        d="M174.227 157.858V211.682C174.227 217.757 169.302 222.682 163.227 222.682H17.0869C8.80265 222.682 2.08691 215.966 2.08691 207.682V157.858H174.227Z"
        fill="white"
        stroke={tabColor}
        strokeWidth="2"
      />
      <defs>
        <radialGradient
          id={gradientId}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(96.75 84.5) scale(136.5)"
        >
          <stop stopColor="#2E75F0" />
          <stop offset="0.55" stopColor="#0A349F" />
          <stop offset="1" stopColor="#061C62" />
        </radialGradient>
        <clipPath id={clipId}>
          <path d={CARD_BODY_PATH} />
        </clipPath>
      </defs>
    </svg>
  );
}

function CharacterCard({
  item,
  uid,
}: {
  item: HomepageChildrensCornerItem;
  uid: string;
}) {
  return (
    <Link href={item.href} className="group relative block">
      <CardShell tabColor={item.tabColor} cardImage={item.cardImage} uid={uid} />

      {/* Logo centred in the white strip (strip region of the 186x236 viewBox) */}
      {item.logoImage && (
        <div className="absolute bottom-[7.5%] left-[4%] right-[9%] top-[69%]">
          <Image
            src={item.logoImage}
            alt={item.name}
            fill
            sizes="(min-width: 1024px) 13vw, 32vw"
            className="object-contain transition-transform duration-200 group-hover:scale-105"
          />
        </div>
      )}
    </Link>
  );
}

export default function ChildrensCorner({
  data,
}: {
  data: HomepageChildrensCorner;
}) {
  if (data.items.length === 0) return null;

  return (
    <section
      className={`w-full ${config.section.paddingX} ${config.section.paddingY} ${config.section.paddingXLg} ${config.section.paddingYLg} max-[480px]:px-4 max-[480px]:py-6 max-[360px]:px-3 max-[360px]:py-5`}
    >
      <div
        className={`flex items-center justify-between ${config.header.gapHeaderToCards}`}
      >
        <h2 className="m-0 text-[clamp(18px,2.2vw,32px)] font-normal tracking-[1px] text-[#111] max-[480px]:flex-1 max-[480px]:text-left max-[480px]:text-[16px] max-[480px]:leading-[1.3]">
          {data.title}
        </h2>
        <Link
          href={data.discoverHref}
          className="flex h-11 items-center rounded-full bg-[#ff5b1f] px-6 text-[14px] font-medium text-white max-[480px]:ml-auto max-[480px]:whitespace-nowrap max-[480px]:px-3.5 max-[480px]:py-2 max-[480px]:text-[11px] max-[360px]:px-3 max-[360px]:py-[7px] max-[360px]:text-[10px]"
        >
          DISCOVER MORE
        </Link>
      </div>

      <div
        className="
          scrollbar-hide
          flex gap-4
          snap-x snap-mandatory overflow-x-auto pb-2.5
          [&>*]:w-[38%] [&>*]:shrink-0 [&>*]:snap-start
          sm:[&>*]:w-[28%]

          lg:grid lg:grid-cols-6 lg:gap-6 lg:overflow-visible lg:snap-none lg:pb-0
          lg:[&>*]:w-auto lg:[&>*]:shrink
        "
      >
        {data.items.map((item, index) => (
          <CharacterCard
            key={`${item.name}-${index}`}
            item={item}
            uid={String(index)}
          />
        ))}
      </div>
    </section>
  );
}
