import Image from "next/image";

export default function PlayBoldBanner() {
  return (
    <section className="relative h-[822px] w-full overflow-hidden max-[1024px]:h-[800px] max-[1024px]:w-[1200px] max-[768px]:h-[800px] max-[768px]:w-[150%] max-[480px]:h-[320px] max-[360px]:h-[500px] max-[360px]:w-[200%]">
      <Image
        src="/images/play-blod-banner.png"
        alt="Play Bold"
        width={2400}
        height={822}
        sizes="100vw"
        className="absolute left-1/2 top-0 z-[1] h-[822px] w-[2400px] -translate-x-1/2 object-cover object-top min-[1440px]:inset-0 min-[1440px]:h-full min-[1440px]:w-full min-[1440px]:translate-x-0 max-[1024px]:left-[-170px] max-[1024px]:h-[800px] max-[1024px]:w-[500%] max-[1024px]:translate-x-0 max-[768px]:left-[-300px] max-[768px]:h-[800px] max-[768px]:w-[150%] max-[480px]:left-0 max-[480px]:h-[320px] max-[480px]:w-full max-[360px]:left-[-250px] max-[360px]:h-[500px] max-[360px]:w-[150%]"
      />
      <Image
        src="/images/red.png"
        alt=""
        width={274}
        height={229}
        className="absolute bottom-0 right-0 z-[2] h-auto w-[274px] min-[1440px]:bottom-0 min-[1440px]:right-[120px] min-[1440px]:h-[150px] min-[1440px]:w-[200px] max-[1024px]:bottom-0 max-[1024px]:right-[250px] max-[1024px]:w-[200px] max-[768px]:bottom-0 max-[768px]:right-[380px] max-[768px]:w-[120px] max-[480px]:bottom-0 max-[480px]:right-0 max-[480px]:w-[110px]"
      />
      <Image
        src="/images/orange.png"
        alt=""
        width={274}
        height={409}
        className="absolute left-[173px] top-0 z-[2] h-auto w-[274px] min-[1440px]:left-[75px] min-[1440px]:top-0 min-[1440px]:h-[300px] min-[1440px]:w-[350px] max-[1024px]:left-[50px] max-[1024px]:top-[-50px] max-[1024px]:w-[200px] max-[768px]:left-[50px] max-[768px]:top-0 max-[768px]:w-[130px] max-[480px]:left-[60px] max-[480px]:top-0 max-[480px]:w-[110px] max-[360px]:hidden"
      />
      <Image
        src="/images/free-delivery.png"
        alt="Free Delivery"
        width={448}
        height={335}
        className="absolute left-5 top-[120px] z-[3] h-auto w-[447px] min-[1440px]:left-[60px] min-[1440px]:top-[160px] min-[1440px]:h-[325px] min-[1440px]:w-[400px] max-[1024px]:left-5 max-[1024px]:top-[100px] max-[1024px]:w-[300px] max-[768px]:left-[15px] max-[768px]:top-[80px] max-[768px]:w-[210px] max-[480px]:left-2 max-[480px]:top-10 max-[480px]:w-[150px] max-[360px]:hidden"
      />
      <Image
        src="/images/cod.png"
        alt="COD Available"
        width={329}
        height={238}
        className="absolute bottom-5 right-2.5 z-[3] h-auto w-[392px] min-[1440px]:bottom-[50px] min-[1440px]:right-[100px] min-[1440px]:h-[220px] min-[1440px]:w-[250px] max-[1024px]:bottom-4 max-[1024px]:right-[210px] max-[1024px]:w-[260px] max-[768px]:bottom-[50px] max-[768px]:right-[375px] max-[768px]:w-[150px] max-[480px]:bottom-2 max-[480px]:right-1 max-[480px]:w-[140px]"
      />
    </section>
  );
}
