import Hero from "@/components/sections/Hero";
import LatestDrops from "@/components/sections/LatestDrops";
import HoodiesBanner from "@/components/sections/HoodiesBanner";
import JacketSection from "@/components/sections/JacketSection";
import FootballHoodies from "@/components/sections/FootballHoodies";
import PlayBoldBanner from "@/components/sections/PlayBoldBanner";
import PoloShirts from "@/components/sections/PoloShirts";
import {
  getHomepageBanners,
  getHomepageCategorySections,
  getHomepageHero,
} from "@/lib/homepage";

export const dynamic = "force-dynamic";

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
      <HoodiesBanner banner={banner1} />
      <JacketSection banner={banner2} />
      <FootballHoodies category={categorySectionOne} />
      <PlayBoldBanner banner={banner3} />
      <PoloShirts category={categorySectionTwo} />
    </>
  );
}
