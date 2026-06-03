import Image from "next/image";
import type { ApparelProduct } from "@/lib/products";

type Variant = "hoodie" | "polo";

type CardStyles = {
  card: string;
  imageWrap: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
  info: string;
  title: string;
  priceRow: string;
  oldPrice: string;
  newPrice: string;
  addBtn: string;
};

/**
 * Reusable apparel product card. The per-section responsive styling lives in
 * this `styles` map (keyed by variant) so the call sites stay clean while the
 * markup/look stays identical to the original design for each section.
 */
const styles: Record<Variant, CardStyles> = {
  hoodie: {
    card: "group flex flex-col min-[1440px]:w-full max-[1024px]:w-[calc(50%_-_10px)] max-[1024px]:shrink-0 max-[1024px]:snap-start max-[1024px]:overflow-hidden max-[768px]:w-[calc(50%_-_8px)] max-[768px]:shrink-0 max-[768px]:snap-start max-[480px]:w-[98%] max-[360px]:w-full max-[360px]:snap-start",
    imageWrap:
      "flex h-[380px] w-full items-end justify-start overflow-hidden min-[1440px]:h-[400px] min-[1440px]:justify-center max-[1024px]:relative max-[1024px]:top-[-200px] max-[1024px]:h-[660px] max-[1024px]:w-[400px] max-[1024px]:items-center max-[1024px]:justify-center max-[768px]:mt-[170px] max-[768px]:h-[420px] max-[768px]:w-full max-[768px]:items-center max-[768px]:justify-center max-[480px]:relative max-[480px]:h-[100px] max-[480px]:items-end max-[480px]:justify-center max-[480px]:p-0 max-[360px]:h-[300px] max-[360px]:items-center max-[360px]:justify-center max-[360px]:overflow-visible",
    image:
      "h-full w-full object-contain object-left transition-transform duration-300 group-hover:scale-[1.04] min-[1440px]:object-cover min-[1440px]:object-right-bottom max-[1024px]:absolute max-[1024px]:left-[-50px] max-[1024px]:top-[45px] max-[1024px]:h-[660px] max-[1024px]:w-[500%] max-[1024px]:object-bottom max-[768px]:h-[80%] max-[768px]:object-bottom max-[480px]:absolute max-[480px]:left-0 max-[480px]:top-0 max-[480px]:h-[50%] max-[480px]:object-bottom max-[360px]:relative max-[360px]:left-[-15px] max-[360px]:mt-[100px] max-[360px]:h-full max-[360px]:object-left",
    imageWidth: 400,
    imageHeight: 460,
    info: "flex w-full flex-col items-start min-[1440px]:mt-[-100px] min-[1440px]:text-left max-[1024px]:mt-[-150px] max-[768px]:mt-2 max-[360px]:mt-[-55%] max-[360px]:overflow-visible max-[360px]:p-2.5",
    title:
      "mb-2 line-clamp-4 min-h-[calc(1.3em*4)] max-w-[45ch] overflow-visible text-[12.5px] font-bold uppercase leading-[1.3] text-[#111] min-[1440px]:mt-[100px] min-[1440px]:max-w-[30ch] min-[1440px]:text-[17px] min-[1440px]:font-normal max-[1024px]:line-clamp-3 max-[1024px]:text-[18px] max-[1024px]:font-bold max-[1024px]:leading-[1.4] max-[768px]:mt-[-230px] max-[768px]:max-w-[35ch] max-[768px]:text-[15px] max-[768px]:leading-[1.2] max-[480px]:line-clamp-3 max-[480px]:px-3.5 max-[480px]:text-[10px] max-[360px]:mb-px max-[360px]:mt-px max-[360px]:max-w-[33ch] max-[360px]:text-[14px] max-[360px]:leading-[1.3]",
    priceRow:
      "mt-1.5 flex w-[80%] items-center justify-between min-[1440px]:justify-start min-[1440px]:gap-[25px] max-[1024px]:justify-start max-[1024px]:gap-[25px] max-[768px]:justify-start max-[768px]:gap-[25px]",
    oldPrice:
      "text-[10px] text-[#999] line-through min-[1440px]:text-[20px] max-[1024px]:text-[20px] max-[768px]:text-[20px] max-[768px]:text-[#aaa] max-[360px]:text-[15px]",
    newPrice:
      "text-[10px] font-bold text-[#111] min-[1440px]:text-[20px] max-[1024px]:text-[20px] max-[768px]:ml-2.5 max-[768px]:text-[18px] max-[768px]:font-normal max-[768px]:text-black max-[360px]:text-[15px]",
    addBtn:
      "ml-auto shrink-0 cursor-pointer text-[20px] text-black min-[1440px]:w-[60%] min-[1440px]:whitespace-nowrap min-[1440px]:text-[30px] max-[1024px]:w-[75%] max-[1024px]:text-[35px] max-[768px]:w-1/2 max-[768px]:text-[30px] max-[360px]:w-[30%] max-[360px]:whitespace-nowrap",
  },
  polo: {
    card: "group flex flex-[0_0_calc(25%_-_18px)] snap-start flex-col min-[1440px]:w-full max-[1024px]:flex-[0_0_calc(50%_-_10px)] max-[1024px]:min-w-0 max-[1024px]:snap-start max-[1024px]:overflow-hidden max-[768px]:flex-[0_0_calc(50%_-_8px)] max-[768px]:snap-start max-[480px]:flex-[0_0_100%] max-[360px]:flex-[0_0_100%] max-[360px]:snap-start",
    imageWrap:
      "flex h-[500px] w-full items-end justify-center overflow-hidden min-[1440px]:h-[400px] max-[1024px]:relative max-[1024px]:top-[-150px] max-[1024px]:h-[550px] max-[1024px]:w-[400px] max-[1024px]:items-center max-[768px]:h-[500px] max-[768px]:w-full max-[768px]:items-end max-[360px]:h-[300px] max-[360px]:items-center max-[360px]:overflow-visible",
    image:
      "mt-[30px] h-full w-full object-cover object-left-bottom transition-transform duration-300 group-hover:scale-[1.04] min-[1440px]:object-right-bottom max-[1024px]:absolute max-[1024px]:left-[-50px] max-[1024px]:top-2.5 max-[1024px]:h-[600px] max-[1024px]:w-[500%] max-[1024px]:object-contain max-[1024px]:object-bottom max-[768px]:left-[-40px] max-[768px]:mt-[50px] max-[768px]:h-[500px] max-[768px]:object-contain max-[768px]:object-bottom max-[360px]:relative max-[360px]:mt-[350px] max-[360px]:h-full max-[360px]:object-contain max-[360px]:object-bottom",
    imageWidth: 394,
    imageHeight: 426,
    info: "mt-2.5 w-full text-left min-[1440px]:mt-4 max-[1024px]:mt-[30px] max-[768px]:mt-10 max-[360px]:mt-[15px] max-[360px]:max-w-[20ch] max-[360px]:overflow-visible max-[360px]:px-[15px] max-[360px]:py-2.5 max-[360px]:text-center",
    title:
      "line-clamp-4 min-h-[calc(1.3em*4)] max-w-[40ch] overflow-hidden text-[12.5px] font-normal uppercase leading-[1.3] text-[#111] min-[1440px]:mb-2 min-[1440px]:max-w-[20ch] min-[1440px]:text-[20px] min-[1440px]:leading-[1.4] max-[1024px]:mb-2.5 max-[1024px]:mt-[-150px] max-[1024px]:line-clamp-3 max-[1024px]:text-[18px] max-[1024px]:font-bold max-[1024px]:leading-[1.4] max-[768px]:mb-[-40px] max-[768px]:line-clamp-2 max-[768px]:max-w-[30ch] max-[768px]:overflow-visible max-[768px]:text-[15px] max-[768px]:leading-none max-[480px]:m-0 max-[480px]:text-[16px] max-[480px]:leading-none max-[360px]:mb-px max-[360px]:overflow-visible max-[360px]:text-left max-[360px]:text-[13px] max-[360px]:leading-[1.3]",
    priceRow:
      "mt-1.5 flex w-[9%] items-center justify-between min-[1440px]:w-full min-[1440px]:gap-5 max-[768px]:justify-start max-[768px]:gap-5 max-[480px]:flex-wrap max-[480px]:gap-2 max-[360px]:w-[75%] max-[360px]:flex-nowrap max-[360px]:justify-between max-[360px]:gap-2 max-[360px]:text-left",
    oldPrice:
      "text-[10px] text-[#999] line-through max-[768px]:text-[15px] max-[360px]:text-[15px]",
    newPrice:
      "text-[10px] font-bold text-[#111] max-[768px]:text-[15px] max-[768px]:font-normal max-[360px]:text-[15px] max-[360px]:font-normal",
    addBtn:
      "ml-[15%] cursor-pointer text-[20px] text-[#111] min-[1440px]:ml-auto min-[1440px]:flex min-[1440px]:h-[34px] min-[1440px]:w-[34px] min-[1440px]:items-center min-[1440px]:justify-center min-[1440px]:text-[30px] max-[1024px]:flex max-[1024px]:h-[34px] max-[1024px]:w-[4%] max-[1024px]:items-center max-[1024px]:justify-center max-[1024px]:rounded-full max-[1024px]:text-[35px] max-[768px]:ml-[90px] max-[768px]:flex max-[768px]:h-[34px] max-[768px]:w-[34px] max-[768px]:items-center max-[768px]:justify-center max-[768px]:rounded-full max-[360px]:w-[1%] max-[360px]:shrink-0 max-[360px]:whitespace-nowrap max-[360px]:text-[30px] max-[360px]:text-black",
  },
};

export default function ProductCard({
  variant,
  product,
}: {
  variant: Variant;
  product: ApparelProduct;
}) {
  const s = styles[variant];
  return (
    <div className={s.card}>
      <div className={s.imageWrap}>
        <Image
          src={product.image}
          alt={product.alt}
          width={s.imageWidth}
          height={s.imageHeight}
          className={s.image}
        />
      </div>

      <div className={s.info}>
        <h3 className={s.title}>{product.title}</h3>
        <div className={s.priceRow}>
          <span className={s.oldPrice}>{product.oldPrice}</span>
          <span className={s.newPrice}>{product.newPrice}</span>
          <button className={s.addBtn}>+</button>
        </div>
      </div>
    </div>
  );
}
