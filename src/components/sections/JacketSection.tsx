import Image from "next/image";

export default function JacketSection() {
  return (
    <section className="relative grid h-[500px] w-full grid-cols-2 overflow-hidden sm:h-[650px] lg:h-[857px]">
      {/* LEFT IMAGE */}
      <div className="relative h-full overflow-hidden">
        <Image
          src="/images/newjacketl.png"
          alt="New Jacket"
          fill
          sizes="50vw"
          className="object-cover object-top"
        />
      </div>

      {/* RIGHT IMAGE */}
      <div className="relative h-full overflow-hidden">
        <Image
          src="/images/newjacketr.png"
          alt="New Jacket"
          fill
          sizes="50vw"
          className="object-cover object-top"
        />
      </div>

      {/* OVERLAY CONTENT */}
      <div className="absolute inset-0 z-10 flex items-end justify-center bg-black/20 px-4 pb-8 sm:pb-12 lg:pb-[60px]">
        <div className="flex flex-col items-center gap-3 text-center sm:gap-4">
          <h2 className="max-w-[280px] text-[22px] font-normal uppercase leading-[1.1] tracking-[0.01em] text-white sm:max-w-[400px] sm:text-[34px] lg:max-w-[500px] lg:text-[48px]">
            NEW JACKET AT BEST PRICE
          </h2>
          <button className="flex h-10 cursor-pointer items-center justify-center gap-2.5 whitespace-nowrap rounded-[143.25px] border border-white bg-transparent px-5 text-[13px] font-bold tracking-[1.5px] text-white transition-colors duration-200 hover:bg-white hover:text-black sm:h-11 sm:px-6 sm:text-[14px] lg:h-12 lg:px-[30px] lg:py-2.5 lg:text-[16px] lg:tracking-[2px]">
            SHOP NOW
          </button>
        </div>
      </div>
    </section>
  );
}