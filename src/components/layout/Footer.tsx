import Image from "next/image";
import Link from "next/link";
import {
  InstagramIcon,
  LinkedinIcon,
  MailIcon,
  PhoneIcon,
  WhatsappIcon,
  YoutubeIcon,
} from "@/components/ui/icons";

/**
 * Payment badges. Each Figma export already contains its own rounded, stroked
 * box around the mark — so these render at their natural 48px height with no
 * CSS frame of ours, and no colour filtering (the marks are full colour).
 */
const paymentLogos = [
  { src: "/images/card-logo/visa-logo.svg", alt: "Visa", width: 106 },
  { src: "/images/card-logo/Rupay-logo.svg", alt: "RuPay", width: 125 },
  { src: "/images/card-logo/paytm-logo.svg", alt: "Paytm", width: 108 },
  { src: "/images/card-logo/mastercard-logo.svg", alt: "Mastercard", width: 82 },
  { src: "/images/card-logo/google.svg", alt: "Google Pay", width: 80 },
  { src: "/images/card-logo/phonepe-logo.svg", alt: "PhonePe", width: 82 },
];

const shop = [
  { label: "New Drops", href: "/new-in" },
  { label: "Jersey", href: "/category/ipl-jersey" },
  { label: "Hoodies", href: "/category/hoodies" },
  { label: "Polos", href: "/category/polo" },
  { label: "T-shirts", href: "/category/polo" },
];

const orderSupport = [
  { label: "Make a return/Exchange", href: "/policies/return-exchange-policy" },
  { label: "Refund/Exchange policy", href: "/policies/refund-cancellation-policy" },
  { label: "Track your order", href: "/track-order" },
  { label: "Shipping policy", href: "/policies/shipping-policy" },
  { label: "FAQ's", href: "#" },
  { label: "Terms", href: "/policies/terms-of-service" },
];

const PHONE = "+91 81229 07987";
const PHONE_DIGITS = "918122907987";

const connectWithUs = [
  { label: "teehubshop@gmail.com", href: "mailto:teehubshop@gmail.com", Icon: MailIcon },
  { label: PHONE, href: `tel:+${PHONE_DIGITS}`, Icon: PhoneIcon },
  { label: "Whatsapp", href: `https://wa.me/${PHONE_DIGITS}`, Icon: WhatsappIcon },
  { label: "Instagram", href: "https://www.instagram.com/tee_hub_shop/", Icon: InstagramIcon },
  { label: "YouTube", href: "https://youtube.com", Icon: YoutubeIcon },
  { label: "LinkedIn", href: "https://linkedin.com", Icon: LinkedinIcon },
];

// Type scale straight from Figma: Inter Regular 13.4/24.2 at 70% for links,
// 16.3 for the column headings. The 24.2px line box plus the 9px column gap is
// what produces the design's ~33px row rhythm.
const linkClass =
  "text-[13.4px] font-normal leading-[24.2px] text-white/70 no-underline transition-colors duration-200 hover:text-white";

const colTitleClass =
  "text-[16.3px] font-semibold leading-[24.2px] text-white";

/** Internal routes get <Link>; mailto/tel/external stay plain anchors. */
function isInternal(href: string) {
  return href.startsWith("/");
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  if (isInternal(href)) {
    return (
      <Link href={href} className={linkClass}>
        {children}
      </Link>
    );
  }
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      className={linkClass}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

export default function Footer() {
  return (
    <footer className="box-border w-full bg-[linear-gradient(180deg,#2B2B2B_0%,#000000_100%)] py-12 max-[1024px]:py-10 max-[480px]:py-8">
      <div
        className="
          flex w-full items-start justify-between
          gap-[clamp(40px,6vw,120px)]
          px-[clamp(16px,4vw,80px)]
          max-[1024px]:gap-12
          max-[900px]:flex-col max-[900px]:gap-10
        "
      >
        {/* BRAND + PAYMENT METHODS */}
        <div className="flex min-w-0 flex-1 flex-col max-[900px]:w-full">
          <p className="text-[30px] font-bold leading-none text-[#FF5820] max-[1024px]:text-[26px] max-[480px]:text-[22px]">
            © 2026 TeeHub
          </p>
          <p className="mt-4 text-[13.4px] font-normal leading-[24.2px] text-white">
            Premium Sports Apparel for True Fans. Wear Your Passion with Pride.
          </p>

          <div className="mt-14">
            {/* Label with the hairline running off to its right, per the design. */}
            <div className="flex items-center gap-5">
              <h3 className="shrink-0 text-[13.4px] font-normal leading-[24.2px] text-white">
                Payment Methods
              </h3>
              <span className="h-px flex-1 bg-white" />
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-5 max-[480px]:gap-3">
              {paymentLogos.map((logo) => (
                <Image
                  key={logo.alt}
                  src={logo.src}
                  alt={logo.alt}
                  width={logo.width}
                  height={48}
                  className="h-14 w-auto object-contain max-[480px]:h-11"
                />
              ))}
            </div>
          </div>
        </div>

        {/* LINK COLUMNS */}
        <div className="flex shrink-0 gap-[60px] max-[1024px]:gap-10 max-[900px]:w-full max-[900px]:justify-between max-[560px]:grid max-[560px]:grid-cols-2 max-[560px]:gap-8">
          <div className="flex flex-col gap-2.25">
            <h3 className={colTitleClass}>Shop</h3>
            {shop.map((link) => (
              <FooterLink key={link.label} href={link.href}>
                {link.label}
              </FooterLink>
            ))}
          </div>

          <div className="flex flex-col gap-2.25">
            <h3 className={colTitleClass}>Order Support</h3>
            {orderSupport.map((link) => (
              <FooterLink key={link.label} href={link.href}>
                {link.label}
              </FooterLink>
            ))}
          </div>

          <div className="flex flex-col gap-2.25 max-[560px]:col-span-2">
            <h3 className={colTitleClass}>Connect with us</h3>
            {connectWithUs.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                {...(href.startsWith("http")
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className={`group flex items-center gap-2 ${linkClass}`}
              >
                <Icon className="h-[18px] w-[18px] shrink-0 text-white/70 transition-colors duration-200 group-hover:text-white" />
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
