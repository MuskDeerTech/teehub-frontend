import Hero from "@/components/sections/Hero";
import LatestDrops from "@/components/sections/LatestDrops";
import WatchAndBuy from "@/components/sections/WatchAndBuy";
import HoodiesBanner from "@/components/sections/HoodiesBanner";
import JacketSection from "@/components/sections/JacketSection";
import FootballHoodies from "@/components/sections/FootballHoodies";
import PlayBoldBanner from "@/components/sections/PlayBoldBanner";
import PoloShirts from "@/components/sections/PoloShirts";
import ChildrensCorner, {
  demoChildrensCorner,
} from "@/components/sections/ChildrensCorner";
import type { Metadata } from "next";
import {
  getHomepageBanners,
  getHomepageCategorySections,
  getHomepageHero,
  getHomepageSeo,
} from "@/lib/homepage";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getHomepageSeo();
  return buildMetadata({
    title: "TeeHub - Premium Sports Jerseys, Hoodies & Polos",
    description:
      "Shop IPL jerseys, football hoodies, jackets and polo t-shirts at TeeHub.",
    path: "/",
    seo,
  });
}

export default async function Home() {
  const [
    hero,
    [categorySectionOne, categorySectionTwo],
    [banner1, banner2, banner3],
  ] = await Promise.all([
    getHomepageHero(),
    getHomepageCategorySections(),
    getHomepageBanners(),
  ]);

  return (
    <>
      <Hero hero={hero} />
      <LatestDrops />
      <WatchAndBuy />
      <HoodiesBanner banner={banner1} />
      <JacketSection banner={banner2} />
      <FootballHoodies category={categorySectionOne} />
      <PlayBoldBanner banner={banner3} />
      <PoloShirts category={categorySectionTwo} />
      <ChildrensCorner data={demoChildrensCorner} />
    </>
  );
}
