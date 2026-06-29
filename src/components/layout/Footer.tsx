import Image from "next/image";

const paymentLogos = [
  { src: "/images/visa.png", alt: "Visa", width: 79, height: 26 },
  { src: "/images/pay-pal.png", alt: "PayPal", width: 167, height: 45 },
  { src: "/images/stripe.png", alt: "Stripe", width: 91, height: 38 },
  { src: "/images/verisign.png", alt: "VeriSign", width: 136, height: 57 },
];

const orderSupport = [
  { label: "Make a return/Exchange", href: "/policies/return-exchange-policy" },
  {
    label: "Refund & Cancellation policy",
    href: "/policies/refund-cancellation-policy",
  },
  { label: "Track your order", href: "/track-order" },
  { label: "Shipping policy", href: "/policies/shipping-policy" },
  { label: "FAQ's", href: "#" },
  { label: "Terms", href: "/policies/terms-of-service" },
];

const connectWithUs = ["Call", "Whatsapp", "Instagram", "YouTube", "LinkedIn"];

const linkClass =
  "text-[14px] font-normal text-white/70 no-underline transition-colors duration-200 hover:text-white max-[768px]:text-[13px] max-[480px]:text-[12px]";

const colTitleClass =
  "mb-1 text-[16px] font-bold uppercase tracking-[1px] text-white max-[768px]:text-[14px] max-[480px]:text-[13px]";

export default function Footer() {
  return (
    <footer className="box-border w-full bg-[#252525] py-12 max-[1024px]:py-10 max-[480px]:py-8 max-[360px]:py-6">
      <div
        className="
          flex w-full items-start justify-between
          gap-[clamp(40px,6vw,160px)]
          px-[clamp(16px,4vw,80px)]
          max-[1024px]:gap-10
          max-[768px]:grid max-[768px]:grid-cols-2 max-[768px]:gap-8
          max-[360px]:grid-cols-1 max-[360px]:gap-6
        "
      >
        {/* WE ARE TEEHUB — spans both columns on tablet/mobile grid, full width on the smallest phones */}
        <div className="flex min-w-0 flex-1 flex-col gap-3 max-[768px]:col-span-2 max-[360px]:col-span-1">
          <h3 className="mb-1 text-[15px] font-bold uppercase tracking-[1px] text-white max-[768px]:text-[14px] max-[480px]:text-[13px]">
            WE ARE TEEHUB
          </h3>
          <a href="#" className={linkClass}>
            Our story
          </a>

          <div className="mt-6">
            <h4 className="mb-3 text-[13.4px] font-normal uppercase tracking-[1px] text-white">
              PAYMENT METHODS
            </h4>
            <div className="mb-5 h-px w-full bg-white/20" />
            <div className="flex flex-wrap items-center gap-[50px] max-[768px]:gap-7 max-[480px]:gap-5 max-[360px]:gap-3.5">
              {paymentLogos.map((logo) => (
                <Image
                  key={logo.alt}
                  src={logo.src}
                  alt={logo.alt}
                  width={logo.width}
                  height={logo.height}
                  className="h-[32px] w-auto object-contain brightness-0 invert max-[480px]:h-7 max-[360px]:h-[22px]"
                />
              ))}
            </div>
          </div>
        </div>

        {/* ORDER SUPPORT */}
        <div className="flex min-w-[220px] flex-col gap-[13px] max-[1024px]:min-w-[140px]">
          <h3 className={colTitleClass}>ORDER SUPPORT</h3>
          {orderSupport.map((link) => (
            <a key={link.label} href={link.href} className={linkClass}>
              {link.label}
            </a>
          ))}
        </div>

        {/* CONNECT WITH US */}
        <div className="flex flex-col gap-[13px] min-w-[220px] max-[1024px]:min-w-[140px]">
          <h3 className={colTitleClass}>CONNECT WITH US</h3>
          {connectWithUs.map((link) => (
            <a key={link} href="#" className={linkClass}>
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
