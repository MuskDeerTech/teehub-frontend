import Hero from "@/components/sections/Hero";
import LatestDrops from "@/components/sections/LatestDrops";
import HoodiesBanner from "@/components/sections/HoodiesBanner";
import JacketSection from "@/components/sections/JacketSection";
import FootballHoodies from "@/components/sections/FootballHoodies";
import PlayBoldBanner from "@/components/sections/PlayBoldBanner";
import PoloShirts from "@/components/sections/PoloShirts";

export default function Home() {
  return (
    <>
      <Hero />
      <LatestDrops />
      <HoodiesBanner />
      <JacketSection />
      <FootballHoodies />
      <PlayBoldBanner />
      <PoloShirts />
    </>
  );
}
