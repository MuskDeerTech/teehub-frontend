import Image from "next/image";

const config = {
  section: {
    // h-[mobile] sm:h-[tablet] md:h-[tablet-lg] lg:h-[desktop]
    className: "h-[340px] sm:h-[500px] md:h-[650px] lg:h-[822px]",
  },
 
  redAccent: {
    className:
      "w-[90px] sm:w-[130px] md:w-[180px] lg:w-[220px] xl:w-[200px] xl:h-[150px] bottom-0 right-0 xl:right-[120px]",
  },
 
  orangeAccent: {
    // hidden below sm: — was crowding the free-delivery badge on small phones
    className:
      "hidden sm:block sm:w-[140px] md:w-[180px] lg:w-[220px] xl:w-[350px] xl:h-[300px] top-0 left-[60px] sm:left-[50px] xl:left-[75px]",
  },
 
  freeDelivery: {
    className:
      "w-[130px] sm:w-[190px] md:w-[260px] lg:w-[320px] xl:w-[400px] xl:h-[325px] top-8 left-2 sm:top-12 sm:left-4 md:top-16 lg:top-[100px] lg:left-5 xl:top-[160px] xl:left-[60px]",
  },
 
  codBadge: {
    className:
      "w-[110px] sm:w-[160px] md:w-[210px] lg:w-[260px] xl:w-[250px] xl:h-[220px] bottom-2 right-1 sm:bottom-4 sm:right-2 xl:bottom-[50px] xl:right-[100px]",
  },
} as const;
 
export default function PlayBoldBanner() {
  return (
    <section className={`relative w-full overflow-hidden ${config.section.className}`}>
      <Image
        src="/images/play-blod-banner.png"
        alt="Play Bold"
        fill
        priority
        sizes="100vw"
        className="z-[1] object-cover object-top"
      />
 
      <Image
        src="/images/red.png"
        alt=""
        width={274}
        height={229}
        className={`absolute z-[2] h-auto ${config.redAccent.className}`}
      />
 
      <Image
        src="/images/orange.png"
        alt=""
        width={274}
        height={409}
        className={`absolute z-[2] h-auto ${config.orangeAccent.className}`}
      />
 
      <Image
        src="/images/free-delivery.png"
        alt="Free Delivery"
        width={448}
        height={335}
        className={`absolute z-[3] h-auto ${config.freeDelivery.className}`}
      />
 
      <Image
        src="/images/cod.png"
        alt="COD Available"
        width={329}
        height={238}
        className={`absolute z-[3] h-auto ${config.codBadge.className}`}
      />
    </section>
  );
}