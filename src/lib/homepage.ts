import { getPayload } from "payload";
import config from "@payload-config";
import type { Category as CategoryDoc, Media } from "../../payload-types";
import type { Product as ProductDoc } from "../../payload-types";
import { toProduct } from "@/lib/catalog";
import {
  DEFAULT_HERO_BANNER,
  type Product,
  type Seo,
  teams as fallbackHeroTeams,
  type Team,
} from "@/lib/products";

export type HomepageCategorySection = {
  slug: string;
  label: string;
};

export type HomepageBanner = {
  image?: string;
  heading?: string;
  subtext?: string;
  showCta: boolean;
  ctaLabel: string;
  ctaHref: string;
};

export type HomepageHero = {
  showCta: boolean;
  ctaLabel: string;
  ctaHref: string;
  teams: Team[];
};

export type HomepageWatchAndBuyItem = {
  product: Product;
  video: string;
};

export type HomepageTopCollectionItem = {
  label: string;
  href: string;
  image: string;
};

export type HomepageTopCollections = {
  title: string;
  discoverHref: string;
  items: HomepageTopCollectionItem[];
};

export type HomepageChildrensCornerItem = {
  name: string;
  href: string;
  cardImage: string | null;
  logoImage: string | null;
  tabColor: string;
};

export type HomepageChildrensCorner = {
  title: string;
  discoverHref: string;
  items: HomepageChildrensCornerItem[];
};

const FALLBACK_SECTIONS: [HomepageCategorySection, HomepageCategorySection] = [
  { slug: "hoodies", label: "Hoodies" },
  { slug: "polo", label: "Polo T-shirts" },
];

function toCategorySection(
  category: number | CategoryDoc | null | undefined,
  fallback: HomepageCategorySection,
): HomepageCategorySection {
  if (typeof category === "object" && category !== null) {
    return {
      slug: category.slug,
      label: category.name,
    };
  }
  return fallback;
}

function mediaUrl(media: number | Media | null | undefined) {
  return typeof media === "object" && media !== null ? media.url ?? undefined : undefined;
}

function textOr(value: string | null | undefined, fallback: string) {
  return value?.trim() || fallback;
}

function toBanner(
  banner:
    | {
        image?: (number | null) | Media;
        heading?: string | null;
        subtext?: string | null;
        showCta?: boolean | null;
        ctaLabel?: string | null;
        ctaHref?: string | null;
      }
    | null
    | undefined,
): HomepageBanner {
  return {
    image: mediaUrl(banner?.image),
    heading: banner?.heading?.trim() || undefined,
    subtext: banner?.subtext?.trim() || undefined,
    showCta: banner?.showCta ?? false,
    ctaLabel: textOr(banner?.ctaLabel, "SHOP NOW"),
    ctaHref: textOr(banner?.ctaHref, "/category/all"),
  };
}

function mediaDimensions(media: Media) {
  return {
    width: media.width ?? 300,
    height: media.height ?? 300,
  };
}

function toHeroTeam(
  team:
    | {
        name?: string | null;
        logo?: (number | null) | Media;
        backgroundImage?: (number | null) | Media;
        headlineTop?: string | null;
        headlineBottom?: string | null;
        theme?: ("dark" | "light") | null;
      }
    | null
    | undefined,
): Team | null {
  if (
    !team?.name ||
    typeof team.logo !== "object" ||
    team.logo === null ||
    typeof team.backgroundImage !== "object" ||
    team.backgroundImage === null
  ) {
    return null;
  }

  const logo = mediaUrl(team.logo);
  const background = mediaUrl(team.backgroundImage);
  if (!logo || !background) return null;

  const { width, height } = mediaDimensions(team.logo);
  return {
    name: team.name,
    logo,
    logoWidth: width,
    logoHeight: height,
    backgroundImage: background,
    headlineTop: team.headlineTop?.trim() || undefined,
    headlineBottom: team.headlineBottom?.trim() || undefined,
    theme: team.theme ?? "dark",
  };
}

/** CMS-editable SEO overrides for the homepage (from the SEO plugin `meta` group). */
export async function getHomepageSeo(): Promise<Seo | undefined> {
  const payload = await getPayload({ config });
  const homepage = (await payload.findGlobal({
    slug: "homepage",
    depth: 0,
  })) as {
    meta?: {
      title?: string | null;
      description?: string | null;
      canonicalURL?: string | null;
    };
  };

  const meta = homepage.meta;
  if (!meta) return undefined;
  const seo: Seo = {
    title: meta.title ?? undefined,
    description: meta.description ?? undefined,
    canonicalURL: meta.canonicalURL ?? undefined,
  };
  return seo.title || seo.description || seo.canonicalURL ? seo : undefined;
}

export async function getHomepageHero(): Promise<HomepageHero> {
  const payload = await getPayload({ config });
  const homepage = (await payload.findGlobal({
    slug: "homepage",
    depth: 1,
  })) as {
    heroShowCta?: boolean | null;
    heroCtaLabel?: string | null;
    heroCtaHref?: string | null;
    heroTeams?: Parameters<typeof toHeroTeam>[0][] | null;
  };

  const cmsTeams = homepage.heroTeams
    ?.map(toHeroTeam)
    .filter((team): team is Team => Boolean(team));

  return {
    showCta: homepage.heroShowCta ?? true,
    ctaLabel: textOr(homepage.heroCtaLabel, "SHOP NOW"),
    ctaHref: textOr(homepage.heroCtaHref, "/all/"),
    teams: cmsTeams?.length
      ? cmsTeams
      : fallbackHeroTeams.map((team) => ({
          ...team,
          bannerLeft: team.bannerLeft ?? DEFAULT_HERO_BANNER.left,
          bannerRight: team.bannerRight ?? DEFAULT_HERO_BANNER.right,
        })),
  };
}

export async function getHomepageCategorySections(): Promise<
  [HomepageCategorySection, HomepageCategorySection]
> {
  const payload = await getPayload({ config });
  const homepage = await payload.findGlobal({
    slug: "homepage",
    depth: 1,
  }) as {
    categorySectionOne?: number | CategoryDoc | null;
    categorySectionTwo?: number | CategoryDoc | null;
  };

  return [
    toCategorySection(homepage.categorySectionOne, FALLBACK_SECTIONS[0]),
    toCategorySection(homepage.categorySectionTwo, FALLBACK_SECTIONS[1]),
  ];
}

export async function getHomepageBanners(): Promise<
  [HomepageBanner, HomepageBanner, HomepageBanner]
> {
  const payload = await getPayload({ config });
  const homepage = (await payload.findGlobal({
    slug: "homepage",
    depth: 1,
  })) as {
    hoodiesBanner?: Parameters<typeof toBanner>[0];
    jacketBanner?: Parameters<typeof toBanner>[0];
    banner3?: Parameters<typeof toBanner>[0];
    playBoldImage?: (number | null) | Media;
  };

  return [
    toBanner(homepage.hoodiesBanner),
    toBanner(homepage.jacketBanner),
    {
      ...toBanner(homepage.banner3),
      image: mediaUrl(homepage.banner3?.image) ?? mediaUrl(homepage.playBoldImage),
    },
  ];
}

export async function getHomepageTopCollections(): Promise<HomepageTopCollections> {
  const payload = await getPayload({ config });
  const homepage = (await payload.findGlobal({
    slug: "homepage",
    depth: 1,
  })) as {
    topCollectionsTitle?: string | null;
    topCollectionsHref?: string | null;
    topCollectionsItems?:
      | {
          category?: number | CategoryDoc | null;
          image?: number | Media | null;
          labelOverride?: string | null;
          isActive?: boolean | null;
        }[]
      | null;
  };

  const items = (homepage.topCollectionsItems ?? [])
    .filter((item) => item.isActive !== false)
    .map((item): HomepageTopCollectionItem | null => {
      const image = mediaUrl(item.image);
      const category =
        typeof item.category === "object" && item.category !== null
          ? item.category
          : null;
      // A card with no artwork or no resolvable category has nothing to show,
      // so it's dropped rather than rendered as an empty tile.
      if (!image || !category) return null;

      return {
        label: textOr(item.labelOverride, category.name),
        href: `/category/${category.slug}`,
        image,
      };
    })
    .filter((item): item is HomepageTopCollectionItem => Boolean(item));

  return {
    title: textOr(homepage.topCollectionsTitle, "Top Collections"),
    discoverHref: textOr(homepage.topCollectionsHref, "/all/"),
    items,
  };
}

export async function getHomepageChildrensCorner(): Promise<HomepageChildrensCorner> {
  const payload = await getPayload({ config });
  const homepage = (await payload.findGlobal({
    slug: "homepage",
    depth: 1,
  })) as {
    childrensCornerTitle?: string | null;
    childrensCornerHref?: string | null;
    childrensCornerItems?:
      | {
          name?: string | null;
          category?: number | CategoryDoc | null;
          cardImage?: number | Media | null;
          logoImage?: number | Media | null;
          tabColor?: string | null;
          isActive?: boolean | null;
        }[]
      | null;
  };

  const items = (homepage.childrensCornerItems ?? [])
    .filter((item) => item.isActive !== false)
    .map((item): HomepageChildrensCornerItem | null => {
      if (!item.name) return null;
      const category =
        typeof item.category === "object" && item.category !== null
          ? item.category
          : null;
      return {
        name: item.name,
        href: category ? `/category/${category.slug}` : "/all/",
        cardImage: mediaUrl(item.cardImage) ?? null,
        logoImage: mediaUrl(item.logoImage) ?? null,
        tabColor: textOr(item.tabColor, "#295DBE"),
      };
    })
    .filter((item): item is HomepageChildrensCornerItem => Boolean(item));

  return {
    title: textOr(homepage.childrensCornerTitle, "Children's Corner"),
    discoverHref: textOr(homepage.childrensCornerHref, "/all/"),
    items,
  };
}

export async function getHomepageWatchAndBuy(): Promise<
  HomepageWatchAndBuyItem[]
> {
  const payload = await getPayload({ config });
  const homepage = (await payload.findGlobal({
    slug: "homepage",
    depth: 2,
  })) as {
    watchAndBuyItems?:
      | {
          product?: number | ProductDoc | null;
          video?: number | Media | null;
          isActive?: boolean | null;
        }[]
      | null;
  };

  return (homepage.watchAndBuyItems ?? [])
    .filter((item) => item.isActive !== false)
    .map((item) => {
      const video = mediaUrl(item.video);
      if (
        !video ||
        typeof item.product !== "object" ||
        item.product === null
      ) {
        return null;
      }

      return {
        product: toProduct(item.product),
        video,
      };
    })
    .filter((item): item is HomepageWatchAndBuyItem => Boolean(item));
}
