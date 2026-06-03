import Image from "next/image";

export default function JacketSection() {
  return (
    <section className="relative grid h-[857px] w-full grid-cols-2 overflow-hidden">
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
      <div className="absolute inset-0 z-10 flex items-end justify-center bg-black/20 pb-[60px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="max-w-[500px] text-center text-[48px] font-normal uppercase leading-[1.1] tracking-[0.01em] text-white">
            NEW JACKET AT BEST PRICE
          </h2>
          <button className="flex h-12 cursor-pointer items-center justify-center gap-2.5 whitespace-nowrap rounded-[143.25px] border border-white bg-transparent px-[30px] py-2.5 text-[16px] font-bold tracking-[2px] text-white transition-colors duration-200 hover:bg-white hover:text-black">
            SHOP NOW
          </button>
        </div>
      </div>
    </section>
  );
}
