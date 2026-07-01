import WatchAndBuyCards from "@/components/sections/WatchAndBuyCards";
import { getHomepageWatchAndBuy } from "@/lib/homepage";

export default async function WatchAndBuy() {
  const items = await getHomepageWatchAndBuy();

  if (items.length === 0) return null;

  return <WatchAndBuyCards items={items} />;
}
