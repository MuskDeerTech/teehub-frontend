const footerLinkClass =
  "text-[13px] font-normal text-[#555] no-underline transition-colors duration-200 hover:text-[#ff5b1f] max-[480px]:text-[11px]";

export default function BottomBanner() {
  return (
    <div className="w-full overflow-hidden border-2 border-[#111] bg-white px-[clamp(16px,4vw,80px)] pb-[28px] pt-[24px] max-[768px]:pb-5 max-[768px]:pt-5 max-[480px]:pb-4 max-[480px]:pt-4">
      <div className="w-full">
        <img
          src="/svg/banner.svg"
          alt="TEE HUB"
          className="block h-auto w-full -mt-[clamp(40px,10.9vw,142px)] max-[480px]:-mt-8"
        />

        <div className="-mt-[60px] flex items-center justify-between gap-6 sm:-mt-[40px] max-[480px]:-mt-5 max-[480px]:flex-col max-[480px]:items-start max-[480px]:gap-2 max-[360px]:mt-[10px]">
           <a
            href="#"
            className="text-[13px] font-normal text-[#555] no-underline max-[480px]:text-[11px]"
          >
            Teehub © 2026. All Rights Reserved
          </a>
          <div className="flex gap-[64px] max-[768px]:gap-10 max-[480px]:gap-7 max-[360px]:gap-4">
            <a href="/policies/terms-of-service" className={footerLinkClass}>
              Terms & Conditions
            </a>
            <a href="/policies/privacy-policy" className={footerLinkClass}>
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
