import type { Metadata } from "next";
import CategoryMarquee from "@/components/layout/CategoryMarquee";
import ReviewsHero from "@/components/reviews/ReviewsHero";
import FeaturedReviews from "@/components/reviews/FeaturedReviews";
import ReviewsByProduct from "@/components/reviews/ReviewsByProduct";
import FanGallery from "@/components/reviews/FanGallery";
import VideoTestimonials from "@/components/reviews/VideoTestimonials";
import ReviewStats from "@/components/reviews/ReviewStats";
import { featuredReviews } from "@/lib/reviewsPage";
import { buildMetadata } from "@/lib/seo";

// The page's own content is static, but the storefront layout reads the search
// global from Payload, so render at request time like the sibling routes.
export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Customer Reviews - TeeHub",
  description:
    "Rated 4.8/5 across 12000+ reviews. See what TeeHub customers say about our custom jerseys, polos and hoodies.",
  path: "/reviews",
});

export default function ReviewsPage() {
  return (
    <main>
      <CategoryMarquee />
      <ReviewsHero />
      <FeaturedReviews reviews={featuredReviews} />
      <ReviewsByProduct />
      <FanGallery />
      <VideoTestimonials />
      <ReviewStats />
    </main>
  );
}
