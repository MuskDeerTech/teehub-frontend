import { postgresAdapter } from "@payloadcms/db-postgres";
import {
  lexicalEditor,
  FixedToolbarFeature,
  EXPERIMENTAL_TableFeature as TableFeature,
} from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { seoPlugin } from "@payloadcms/plugin-seo";
import type { GenerateTitle, GenerateDescription, GenerateURL } from "@payloadcms/plugin-seo/types";
import path from "path";
import {
  buildConfig,
  type Access,
  type CollectionConfig,
  type Field,
  type FieldAccess,
  type GlobalConfig,
} from "payload";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { resendEmailAdapter } from "@/lib/email/resendAdapter";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const isAdmin: Access = ({ req: { user } }) =>
  Boolean(user && user.collection === "admins");
const isAdminField: FieldAccess = ({ req: { user } }) =>
  Boolean(user && user.collection === "admins");

// For PII-bearing customer records: an admin sees everything; a logged-in
// customer is scoped to their own document (Payload turns the returned query
// constraint into a `where id = self` filter). Anyone not logged in is denied.
const adminOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false;
  if (user.collection === "admins") return true;
  return { id: { equals: user.id } };
};

const adminOrOrderOwner: Access = ({ req: { user } }) => {
  if (!user) return false;
  if (user.collection === "admins") return true;
  if (user.collection === "customers") {
    return { customer: { equals: user.id } };
  }
  return false;
};

const homepageDefaultCategorySlugs = {
  categorySectionOne: "hoodies",
  categorySectionTwo: "polo",
} as const;

type HomepageCategoryField = keyof typeof homepageDefaultCategorySlugs;

async function findCategoryBySlug(req: any, slug: string) {
  const result = await req.payload.find({
    collection: "categories",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });
  return result.docs[0];
}

function valueId(value: unknown) {
  if (typeof value === "object" && value !== null && "id" in value) {
    return (value as { id?: string | number }).id;
  }
  return value;
}

const showHomepageCategoryDefaults = async ({
  doc,
  req,
}: {
  doc: any;
  req: any;
}) => {
  const next = { ...doc } as Record<string, unknown>;

  for (const field of Object.keys(
    homepageDefaultCategorySlugs,
  ) as HomepageCategoryField[]) {
    if (next[field]) continue;
    const category = await findCategoryBySlug(
      req,
      homepageDefaultCategorySlugs[field],
    );
    if (category) next[field] = category;
  }

  return next;
};

const saveHomepageCategoryDefaults = async ({
  data,
  req,
}: {
  data?: any;
  req: any;
}) => {
  const next = { ...(data ?? {}) } as Record<string, unknown>;

  for (const field of Object.keys(
    homepageDefaultCategorySlugs,
  ) as HomepageCategoryField[]) {
    const id = valueId(next[field]);
    if (id) {
      next[field] = id;
      continue;
    }

    const category = await findCategoryBySlug(
      req,
      homepageDefaultCategorySlugs[field],
    );
    if (category) next[field] = category.id;
  }

  return next;
};

const woocommerceIdField = {
  name: "woocommerceId",
  label: "WooCommerce ID",
  type: "number" as const,
  unique: true,
  index: true,
  access: {
    create: isAdminField,
    update: isAdminField,
  },
  admin: {
    position: "sidebar" as const,
    readOnly: true,
  },
};

const Admins: CollectionConfig = {
  slug: "admins",
  auth: true,
  admin: {
    useAsTitle: "email",
  },
  fields: [
    {
      name: "name",
      type: "text",
    },
    {
      name: "role",
      type: "select",
      defaultValue: "admin",
      options: [
        {
          label: "Admin",
          value: "admin",
        },
      ],
      required: true,
    },
  ],
};

const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    useAsTitle: "alt",
  },
  upload: true,
  fields: [
    woocommerceIdField,
    {
      name: "alt",
      type: "text",
      required: true,
    },
  ],
};

// The canonical override the SEO developer asked for. Optional: blank means the
// storefront uses the page's own URL (the common case); set it only to point
// search engines at a different master page.
const seoCanonicalField: Field = {
  name: "canonicalURL",
  type: "text",
  label: "Canonical URL",
};

// The SEO plugin's meta group (meta title, description, canonical, + the plugin's
// overview/preview widgets), rebuilt here so it can be dropped into a collection's
// existing tab bar as one more tab. This avoids the plugin's `tabbedUI`, which
// wraps ALL fields into a "Content" tab and thereby pulls sidebar fields into the
// main column. The `meta` group name + subfield names map to the existing meta_*
// columns, and the client component paths are the same ones the plugin registers.
const seoMetaGroup: Field = {
  name: "meta",
  type: "group",
  label: "SEO",
  fields: [
    {
      name: "overview",
      type: "ui",
      label: "Overview",
      admin: {
        components: {
          Field: {
            path: "@payloadcms/plugin-seo/client#OverviewComponent",
            clientProps: {},
          },
        },
      },
    },
    {
      name: "title",
      type: "text",
      admin: {
        components: {
          Field: {
            path: "@payloadcms/plugin-seo/client#MetaTitleComponent",
            clientProps: { hasGenerateTitleFn: true },
          },
        },
      },
    },
    {
      name: "description",
      type: "textarea",
      admin: {
        components: {
          Field: {
            path: "@payloadcms/plugin-seo/client#MetaDescriptionComponent",
            clientProps: { hasGenerateDescriptionFn: true },
          },
        },
      },
    },
    seoCanonicalField,
    {
      name: "preview",
      type: "ui",
      label: "Preview",
      admin: {
        components: {
          Field: {
            path: "@payloadcms/plugin-seo/client#PreviewComponent",
            clientProps: { hasGenerateURLFn: true },
          },
        },
      },
    },
  ],
};

const Categories: CollectionConfig = {
  slug: "categories",
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    useAsTitle: "name",
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Category",
          fields: [
            {
              name: "name",
              type: "text",
              required: true,
            },
            {
              name: "slug",
              label: "Slug (URL)",
              type: "text",
              required: true,
              unique: true,
            },
            {
              name: "description",
              type: "textarea",
            },
            {
              name: "thumbnailImage",
              label: "Menu Thumbnail",
              type: "upload",
              relationTo: "media",
              admin: {
                description: "Small image shown for this category in the navbar dropdown.",
              },
            },
            {
              name: "bg",
              type: "text",
              defaultValue: "#f1f1f1",
              admin: {
                description:
                  "Hex colour (e.g. #c0352f) behind the menu thumbnail in the navbar dropdown.",
                components: {
                  Field: "/src/components/admin/ColorPickerField#default",
                },
              },
            },
            // How the thumbnail sits inside the menu tile (drag + zoom editor).
            // Values are replayed by MegaMenu as a CSS transform, so the admin
            // preview and the storefront tile always match.
            {
              name: "thumbFit",
              label: "Thumbnail Fit",
              type: "group",
              admin: {
                description:
                  "Drag the image and zoom until it fits the tile the way you want.",
                components: {
                  Field: "/src/components/admin/ThumbFitField#default",
                },
              },
              fields: [
                {
                  name: "scale",
                  type: "number",
                  defaultValue: 100,
                  min: 20,
                  max: 300,
                },
                {
                  name: "x",
                  type: "number",
                  defaultValue: 0,
                  min: -100,
                  max: 100,
                },
                {
                  name: "y",
                  type: "number",
                  defaultValue: 0,
                  min: -100,
                  max: 100,
                },
              ],
            },
            {
              name: "sortOrder",
              type: "number",
              defaultValue: 0,
              min: 0,
            },
            {
              name: "isActive",
              type: "checkbox",
              defaultValue: true,
            },
          ],
        },
        {
          label: "SEO",
          fields: [seoMetaGroup],
        },
      ],
    },
  ],
};

// Field names deliberately mirror the `Product` type in src/lib/products.ts so
// the storefront swap is a 1:1 mapping. The facet select options below must
// stay in sync with the section option lists in
// src/components/category/FilterPanel.tsx.
const Products: CollectionConfig = {
  slug: "products",
  defaultSort: "-originalCreatedAt",
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === "create" && data && !data.originalCreatedAt) {
          data.originalCreatedAt = new Date().toISOString();
        }
        return data;
      },
    ],
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: [
      "title",
      "category",
      "priceMin",
      "isPublished",
      "originalCreatedAt",
    ],
  },
  fields: [
    woocommerceIdField,
    // Identity — shared by every screen.
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
    },
    {
      name: "category",
      type: "relationship",
      relationTo: "categories",
      required: true,
    },
    {
      name: "sku",
      label: "SKU",
      type: "text",
      index: true,
    },
    {
      name: "woocommerceStatus",
      type: "select",
      options: ["draft", "pending", "private", "publish", "trash"],
      admin: { position: "sidebar" },
    },
    {
      name: "woocommerceType",
      type: "select",
      options: ["simple", "grouped", "external", "variable"],
      admin: { position: "sidebar" },
    },
    {
      name: "originalCreatedAt",
      label: "Date",
      type: "date",
      index: true,
      admin: {
        readOnly: true,
        position: "sidebar",
        components: {
          Cell: "/src/components/admin/ProductDateCell#default",
        },
      },
    },
    {
      name: "stockStatus",
      type: "select",
      options: ["instock", "outofstock", "onbackorder"],
      admin: { position: "sidebar" },
    },
    {
      name: "stockQuantity",
      type: "number",
      min: 0,
      admin: { position: "sidebar" },
    },
    {
      name: "shortDescription",
      type: "textarea",
    },
    // Publishing controls live in the sidebar so they're reachable from any tab.
    {
      name: "isPublished",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar" },
    },
    {
      name: "isFeatured",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar" },
    },
    // When on, the product page shows the "Name and T-shirt Number" input
    // (jerseys). Auto-set from the WooCommerce snapshot on import; togglable
    // per product for anything added in the admin.
    {
      name: "allowCustomName",
      label: "Allow Name & Number",
      type: "checkbox",
      defaultValue: false,
      admin: {
        position: "sidebar",
        description:
          "Show the Name & Number input on the product page (mainly jerseys).",
      },
    },
    {
      name: "sortOrder",
      type: "number",
      defaultValue: 0,
      min: 0,
      admin: { position: "sidebar" },
    },
    // Unnamed tabs: purely a UI grouping — fields stay top-level in the data,
    // so `doc.bg`, `doc.sizes`, etc. are unchanged (no DB migration).
    {
      type: "tabs",
      tabs: [
        {
          label: "Images",
          description:
            "Where each image shows up on the storefront. The catalog card and the detail gallery are independent.",
          fields: [
            {
              name: "cardImage",
              label: "Catalog Card Image",
              type: "upload",
              relationTo: "media",
            },
            {
              name: "cardFit",
              label: "Card Fit",
              type: "group",
              admin: {
                description:
                  "Drag and zoom until the card image sits right in the listing tile.",
                components: {
                  Field: "/src/components/admin/CardFitField#default",
                },
              },
              fields: [
                { name: "scale", type: "number", defaultValue: 100, min: 20, max: 300 },
                { name: "x", type: "number", defaultValue: 0, min: -100, max: 100 },
                { name: "y", type: "number", defaultValue: 0, min: -100, max: 100 },
              ],
            },
            {
              name: "bg",
              type: "text",
              required: true,
              defaultValue: "#BF5550",
              admin: {
                components: {
                  Field: "/src/components/admin/ColorPickerField#default",
                },
              },
            },
            // Detail-page gallery: first image is the big frozen left image, the
            // rest stack in the scrolling middle column. Never used on cards.
            {
              name: "images",
              label: "Detail Gallery",
              type: "upload",
              relationTo: "media",
              hasMany: true,
              admin: {
                description:
                  "Product detail page only. First image is the big left image; the rest scroll in the middle.",
              },
            },
            // Per-image drag/zoom inside the gallery card, keyed by media id so
            // fits survive reordering. Edited with the strip+editor.
            {
              name: "imageFits",
              label: "Gallery Image Fit",
              type: "json",
              admin: {
                description:
                  "Click a gallery thumbnail, then drag and zoom that image until it sits right on the detail page.",
                components: {
                  Field: "/src/components/admin/ImageFitsField#default",
                },
              },
            },
          ],
        },
        {
          label: "Product Page",
          description: "Everything rendered on the product (slug) page.",
          fields: [
            // Catalog price range shown on category-page tiles ("₹899 – ₹1,099").
            {
              name: "priceMin",
              type: "number",
              required: true,
              min: 0,
            },
            {
              name: "priceMax",
              type: "number",
              min: 0,
              admin: {
                description: "Leave empty to show a single price instead of a range.",
              },
            },
            // Detail-page sale pricing (struck-through MRP + discount badge).
            {
              name: "price",
              type: "number",
              min: 0,
              admin: {
                description: "Current sale price on the product page.",
              },
            },
            {
              name: "originalPrice",
              type: "number",
              min: 0,
            },
            {
              name: "discountPercent",
              type: "number",
              min: 0,
              max: 100,
            },
            // Size pills on the detail page (XS–XXXL), with optional per-size stock.
            {
              name: "detailSizes",
              type: "array",
              admin: {
                components: {
                  Field: "/src/components/admin/DetailSizesField#default",
                },
              },
              fields: [
                {
                  name: "label",
                  type: "text",
                  required: true,
                },
                {
                  name: "stock",
                  type: "number",
                  defaultValue: 0,
                  min: 0,
                },
              ],
            },
            {
              name: "description",
              type: "textarea",
            },
            {
              name: "details",
              type: "array",
              admin: {
                components: {
                  Field: "/src/components/admin/DetailsField#default",
                },
              },
              fields: [
                {
                  name: "text",
                  type: "text",
                  required: true,
                },
              ],
            },
            {
              name: "rating",
              type: "number",
              min: 0,
              max: 5,
            },
            {
              name: "reviewCount",
              type: "number",
              min: 0,
            },
            // Social-proof / promo strip on the detail page.
            {
              name: "fitPercent",
              type: "number",
              min: 0,
              max: 100,
              admin: {
                description: '"All sizes 96% fit" badge value.',
              },
            },
            {
              name: "fitReviews",
              type: "number",
              min: 0,
              admin: {
                description: "Review count shown next to the fit badge.",
              },
            },
            {
              name: "freeShippingRemaining",
              type: "number",
              min: 0,
              admin: {
                description: "₹ left to unlock free shipping, shown on the cart button.",
              },
            },
            {
              name: "prepaidPromo",
              type: "textarea",
              admin: {
                description: "Green prepaid-incentive line under the fit copy.",
              },
            },
          ],
        },
        {
          label: "Catalog & Filters",
          description:
            "Tags that power the category-page filter panel — not shown on the product page. Option lists mirror FilterPanel's sections.",
          fields: [
            {
              name: "themes",
              type: "select",
              hasMany: true,
              options: ["Cricket", "IPL", "Football", "Movie"],
            },
            {
              name: "type",
              type: "select",
              options: ["T-Shirts", "Polos", "Jerseys", "Hoodies"],
              admin: {
                description: 'Garment type — the filter panel\'s "Category" section.',
              },
            },
            {
              name: "colors",
              type: "select",
              hasMany: true,
              options: ["Black", "Red", "Orange", "Blue", "White", "Yellow"],
            },
            {
              name: "sleeve",
              type: "select",
              options: ["Long", "Short", "Halter"],
            },
            {
              name: "sizes",
              type: "select",
              hasMany: true,
              options: [
                "Oversized",
                "Extra Large",
                "Large",
                "Medium",
                "Small",
                "Extra Small",
              ],
              admin: {
                description: 'Fit availability — the filter panel\'s "Fit" section.',
              },
            },
          ],
        },
        // SEO joins the existing tab bar here (Images / Product Page / Catalog &
        // Filters / SEO) instead of via the plugin's tabbedUI, so the main fields
        // and the sidebar stay exactly where they are.
        {
          label: "SEO",
          fields: [seoMetaGroup],
        },
      ],
    },
  ],
};

// Static content pages (policies, terms, etc.) rendered at /policies/<slug>.
// One collection backs all of them; the storefront route reads by slug and
// renders the rich-text body — so adding a new policy never needs a code change.
const Pages: CollectionConfig = {
  slug: "pages",
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "isPublished"],
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Page",
          fields: [
            {
              name: "title",
              type: "text",
              required: true,
            },
            {
              name: "slug",
              label: "Slug (URL)",
              type: "text",
              required: true,
              unique: true,
              admin: {
                description: "URL path under /policies, e.g. privacy-policy.",
              },
            },
            {
              name: "content",
              type: "richText",
              required: true,
            },
          ],
        },
        {
          label: "SEO",
          fields: [seoMetaGroup],
        },
      ],
    },
    {
      name: "isPublished",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar" },
    },
  ],
};

// Storefront customer accounts (separate from `Admins`, which is staff-only).
// `auth: true` gives Payload's built-in email + password login, sessions, and
// the standard /api/customers/login|logout|me endpoints. The phone-OTP UX in
// the checkout login UI is a frontend concern layered on later; this collection
// is the account model it will sit on. `addresses` mirrors the fields the
// checkout register step collects, so a saved address fills the form 1:1.
const Customers: CollectionConfig = {
  slug: "customers",
  auth: true,
  defaultSort: "-lastActiveAt",
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === "create" && data) {
          const registeredAt = data.registeredAt || new Date().toISOString();
          data.registeredAt = registeredAt;
          if (!data.lastActiveAt) data.lastActiveAt = registeredAt;
          if (!data.lastActiveSource) {
            data.lastActiveSource = data.woocommerceId
              ? "woocommerce"
              : "payload";
          }
        }
        return data;
      },
    ],
  },
  access: {
    // Signup goes through /api/auth/register so email verification cannot be
    // bypassed through the public Payload REST endpoint.
    create: isAdmin,
    read: adminOrSelf,
    update: adminOrSelf,
    delete: isAdmin,
  },
  admin: {
    useAsTitle: "email",
    defaultColumns: [
      "fullName",
      "lastActiveAt",
      "orderCount",
      "totalSpent",
      "email",
    ],
  },
  fields: [
    woocommerceIdField,
    {
      name: "requiresPasswordReset",
      type: "checkbox",
      defaultValue: false,
      access: {
        create: isAdminField,
        update: isAdminField,
      },
      admin: {
        position: "sidebar",
        description:
          "Imported accounts receive a random password and must reset it before signing in.",
      },
    },
    {
      name: "emailVerified",
      type: "checkbox",
      admin: {
        hidden: true,
      },
    },
    {
      name: "emailVerificationCodeHash",
      type: "text",
      admin: {
        hidden: true,
      },
    },
    {
      name: "emailVerificationExpiresAt",
      type: "date",
      admin: {
        hidden: true,
      },
    },
    {
      name: "emailVerificationAttempts",
      type: "number",
      defaultValue: 0,
      min: 0,
      admin: {
        hidden: true,
      },
    },
    {
      name: "passwordResetCodeHash",
      type: "text",
      admin: {
        hidden: true,
      },
    },
    {
      name: "passwordResetExpiresAt",
      type: "date",
      admin: {
        hidden: true,
      },
    },
    {
      name: "passwordResetAttempts",
      type: "number",
      defaultValue: 0,
      min: 0,
      admin: {
        hidden: true,
      },
    },
    {
      name: "woocommerceData",
      label: "WooCommerce legacy snapshot",
      type: "json",
      access: {
        create: isAdminField,
        update: isAdminField,
      },
      admin: {
        hidden: true,
      },
    },
    {
      name: "fullName",
      type: "text",
    },
    {
      name: "phone",
      type: "text",
      index: true,
      admin: {
        description: "Primary contact number (also used by phone-OTP login later).",
      },
    },
    {
      name: "registeredAt",
      label: "Date registered",
      type: "date",
      admin: {
        readOnly: true,
        position: "sidebar",
      },
    },
    {
      name: "lastActiveAt",
      label: "Last active",
      type: "date",
      index: true,
      admin: {
        readOnly: true,
        components: {
          Cell: "/src/components/admin/OrderDateCell#default",
        },
      },
    },
    {
      name: "lastActiveSource",
      type: "select",
      options: ["woocommerce", "payload"],
      admin: { hidden: true },
    },
    {
      name: "orderCount",
      label: "Orders",
      type: "number",
      defaultValue: 0,
      min: 0,
      admin: { readOnly: true },
    },
    {
      name: "totalSpent",
      label: "Total spent",
      type: "number",
      defaultValue: 0,
      min: 0,
      admin: {
        readOnly: true,
        components: {
          Cell: "/src/components/admin/CurrencyCell#default",
        },
      },
    },
    {
      name: "savedCart",
      label: "Saved cart",
      type: "json",
      admin: {
        description:
          "Current customer cart synced from the storefront for cross-device checkout.",
        components: {
          Field: "/src/components/admin/SavedCartField#default",
        },
      },
    },
    // Saved delivery addresses — same shape as the checkout register form, so
    // the frontend can prefill from a chosen address with no remapping.
    {
      name: "addresses",
      type: "array",
      labels: { singular: "Address", plural: "Addresses" },
      fields: [
        {
          name: "label",
          type: "text",
          admin: { description: 'e.g. "Home", "Work".' },
        },
        { name: "fullName", type: "text" },
        { name: "phone", type: "text" },
        { name: "address", type: "textarea", required: true },
        {
          type: "row",
          fields: [
            { name: "city", type: "text", admin: { width: "50%" } },
            { name: "state", type: "text", admin: { width: "50%" } },
          ],
        },
        { name: "pincode", type: "text" },
        {
          name: "isDefault",
          type: "checkbox",
          defaultValue: false,
          admin: { description: "Use this address by default at checkout." },
        },
      ],
    },
  ],
};

// Customer orders. Field names/shapes mirror the checkout flow so a submit is a
// 1:1 map: `items` ↔ the cart's CartItem[], `customer` ↔ CustomerData (the
// register step), `payment` ↔ the CartPayment selections, `totals` ↔ the cart
// totals. Line items SNAPSHOT title/price/etc. at purchase time (with an
// optional product relationship for reference) so later edits to a product or
// its price never rewrite order history.
//
// Orders hold buyer PII, so unlike the public catalog collections they are not
// world-readable. They're created server-side by the checkout route via the
// Local API (overrideAccess), so `create` here stays locked to admins too — the
// public REST endpoint must not be able to forge orders. A `customer`
// relationship will be added once the Customers collection exists; existing
// orders keep their snapshotted buyer details regardless.
const Orders: CollectionConfig = {
  slug: "orders",
  defaultSort: "-originalCreatedAt",
  access: {
    read: adminOrOrderOwner,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    useAsTitle: "orderNumber",
    defaultColumns: [
      "orderNumber",
      "originalCreatedAt",
      "status",
      "totalPrice",
    ],
  },
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        // Human-friendly id generated once on create; the DB id stays the PK.
        if (operation === "create" && data) {
          if (!data.orderNumber) {
            const stamp = Date.now().toString(36).toUpperCase();
            const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
            data.orderNumber = `TH-${stamp}-${rand}`;
          }
          if (!data.originalCreatedAt) {
            data.originalCreatedAt = new Date().toISOString();
          }
        }
        return data;
      },
    ],
    afterChange: [
      async ({ doc, req }) => {
        const customerId =
          typeof doc.customer === "object" && doc.customer
            ? doc.customer.id
            : doc.customer;
        if (!customerId || !doc.originalCreatedAt) return doc;

        const customer = await req.payload.findByID({
          collection: "customers",
          id: customerId,
          depth: 0,
          overrideAccess: true,
          // Keep hook-local operations on the order write's transaction.
          // Without this, concurrent webhook requests can each hold one DB
          // connection while waiting for another, exhausting a small pool.
          req,
          select: {
            lastActiveAt: true,
          },
        });
        const current = customer.lastActiveAt
          ? new Date(customer.lastActiveAt).getTime()
          : 0;
        const orderDate = new Date(doc.originalCreatedAt).getTime();

        if (!Number.isNaN(orderDate) && orderDate >= current) {
          await req.payload.update({
            collection: "customers",
            id: customerId,
            data: {
              lastActiveAt: doc.originalCreatedAt,
              lastActiveSource: doc.woocommerceId
                ? "woocommerce"
                : "payload",
            },
            depth: 0,
            overrideAccess: true,
            // Reuse the transaction already attached to this hook request.
            req,
          });
        }
        return doc;
      },
    ],
  },
  fields: [
    woocommerceIdField,
    {
      name: "orderNumber",
      label: "Order",
      type: "text",
      unique: true,
      admin: {
        readOnly: true,
        description: "Auto-generated on creation.",
        position: "sidebar",
        components: {
          Cell: "/src/components/admin/OrderNumberCell#default",
        },
      },
    },
    // Fulfilment + payment state live in the sidebar so they're editable from
    // any tab as the order moves through its lifecycle.
    {
      name: "status",
      type: "select",
      defaultValue: "pending",
      options: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      admin: { position: "sidebar" },
    },
    {
      name: "woocommerceStatus",
      type: "text",
      admin: { position: "sidebar" },
    },
    {
      name: "originalCreatedAt",
      label: "Date",
      type: "date",
      admin: {
        position: "sidebar",
        components: {
          Cell: "/src/components/admin/OrderDateCell#default",
        },
      },
    },
    {
      name: "currency",
      type: "text",
      defaultValue: "INR",
      admin: { position: "sidebar" },
    },
    // Optional link to the account that placed the order. Left empty for guest
    // checkouts; the snapshotted buyer details below are always the record of
    // truth either way.
    {
      name: "customer",
      type: "relationship",
      relationTo: "customers",
      admin: { position: "sidebar" },
    },
    {
      type: "tabs",
      tabs: [
        {
          label: "Items",
          fields: [
            {
              name: "items",
              type: "array",
              minRows: 1,
              labels: { singular: "Item", plural: "Items" },
              admin: {
                description:
                  "One row per cart line. Title/price/size are snapshotted at purchase time.",
              },
              fields: [
                {
                  name: "product",
                  type: "relationship",
                  relationTo: "products",
                  admin: {
                    description:
                      "Reference only — the snapshot fields below are the source of truth.",
                  },
                },
                { name: "name", type: "text", required: true },
                { name: "woocommerceProductId", type: "number" },
                { name: "woocommerceVariationId", type: "number" },
                { name: "image", type: "text" },
                { name: "size", type: "text" },
                {
                  name: "quantity",
                  type: "number",
                  required: true,
                  defaultValue: 1,
                  min: 1,
                },
                // Per-unit sale price and struck-through MRP at time of purchase.
                { name: "price", type: "number", required: true, min: 0 },
                { name: "mrp", type: "number", min: 0 },
                {
                  name: "customName",
                  type: "text",
                  admin: {
                    description: "Name/number printed on the jersey, if any.",
                  },
                },
              ],
            },
          ],
        },
        {
          label: "Customer",
          description: "Buyer + delivery details captured at checkout.",
          fields: [
            { name: "fullName", type: "text", required: true },
            { name: "phone", type: "text", required: true },
            { name: "email", type: "email" },
            { name: "address", type: "textarea", required: true },
            {
              type: "row",
              fields: [
                { name: "city", type: "text", admin: { width: "50%" } },
                { name: "state", type: "text", admin: { width: "50%" } },
              ],
            },
            { name: "pincode", type: "text" },
            {
              name: "billing",
              type: "json",
              admin: { description: "Original WooCommerce billing address." },
            },
            {
              name: "shipping",
              type: "json",
              admin: { description: "Original WooCommerce shipping address." },
            },
          ],
        },
        {
          label: "Payment & Totals",
          fields: [
            {
              name: "payment",
              type: "group",
              fields: [
                {
                  name: "method",
                  type: "select",
                  options: ["online", "cod", "wallet", "netbanking", "card"],
                },
                {
                  name: "status",
                  type: "select",
                  defaultValue: "pending",
                  options: ["pending", "paid", "failed", "refunded"],
                },
                { name: "transactionId", type: "text" },
                { name: "title", type: "text" },
              ],
            },
            {
              name: "giftWrap",
              label: "Gift wrap",
              type: "checkbox",
              defaultValue: false,
            },
            {
              name: "couponCode",
              type: "text",
              admin: { description: "Coupon entered at checkout (not yet validated)." },
            },
            // Mirrors the cart's running totals so the order is self-contained.
            {
              name: "totalCount",
              label: "Total items",
              type: "number",
              min: 0,
            },
            { name: "totalMrp", type: "number", min: 0 },
            { name: "totalPrice", type: "number", min: 0 },
            { name: "shippingTotal", type: "number", min: 0 },
            { name: "discountTotal", type: "number", min: 0 },
            { name: "taxTotal", type: "number", min: 0 },
            { name: "refundedTotal", type: "number", min: 0 },
          ],
        },
      ],
    },
    {
      name: "customerNote",
      type: "textarea",
    },
    {
      name: "woocommerceData",
      label: "WooCommerce legacy snapshot",
      type: "json",
      admin: {
        hidden: true,
      },
    },
  ],
};

const WebhookEvents: CollectionConfig = {
  slug: "webhook-events",
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    useAsTitle: "deliveryId",
    defaultColumns: ["deliveryId", "topic", "status", "processedAt"],
  },
  fields: [
    {
      name: "deliveryId",
      type: "text",
      required: true,
      unique: true,
      index: true,
    },
    { name: "topic", type: "text", required: true },
    { name: "resourceId", type: "number" },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "received",
      options: ["received", "processed", "failed", "ignored"],
    },
    { name: "attempts", type: "number", defaultValue: 1, min: 1 },
    { name: "processedAt", type: "date" },
    { name: "error", type: "textarea" },
    { name: "payload", type: "json", required: true },
  ],
};

// Editable homepage content — a single global (one record, not a list) that
// replaces the hardcoded arrays in src/lib/products.ts. The product sections
// (Latest Drops / Football Hoodies / Polo Shirts) pick from the real Products
// collection so there's a single source of truth; the hero + banner fields hold
// the purely editorial imagery/copy. Category pills come from the Categories
// collection, so they're intentionally not duplicated here. World-readable so
// the homepage can render it; only staff can edit.
const HomePage: GlobalConfig = {
  slug: "homepage",
  access: {
    read: () => true,
    update: isAdmin,
  },
  hooks: {
    afterRead: [showHomepageCategoryDefaults],
    beforeValidate: [saveHomepageCategoryDefaults],
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Hero",
          fields: [
            {
              name: "heroShowCta",
              label: "Show CTA",
              type: "checkbox",
              defaultValue: true,
            },
            {
              name: "heroCtaLabel",
              type: "text",
              defaultValue: "SHOP NOW",
              admin: {
                hidden: true,
              },
            },
            {
              name: "heroCtaHref",
              type: "text",
              defaultValue: "/all/",
              admin: {
                hidden: true,
              },
            },
            {
              type: "row",
              admin: { hidden: true },
              fields: [
                {
                  name: "heroLeftImage",
                  label: "Legacy Left Image",
                  type: "upload",
                  relationTo: "media",
                  admin: { width: "50%" },
                },
                {
                  name: "heroRightImage",
                  label: "Legacy Right Image",
                  type: "upload",
                  relationTo: "media",
                  admin: { width: "50%" },
                },
              ],
            },
            {
              name: "heroTeams",
              type: "array",
              labels: { singular: "Team", plural: "Teams" },
              fields: [
                { name: "name", type: "text", required: true },
                { name: "logo", type: "upload", relationTo: "media", required: true },
                {
                  name: "backgroundImage",
                  label: "Background Image",
                  type: "upload",
                  relationTo: "media",
                  required: true,
                },
              ],
            },
          ],
        },
        {
          label: "Product Sections",
          description:
            "Latest Drops always shows the newest products. Choose categories for the next two homepage rows.",
          fields: [
            {
              name: "latestDropsNote",
              label: "Latest Drops",
              type: "text",
              defaultValue:
                "Always shown automatically from the latest uploaded products.",
              admin: {
                readOnly: true,
                description:
                  "No setup needed here. The storefront sorts published products by Date and shows the newest ones.",
              },
            },
            {
              name: "categorySectionOne",
              label: "Category Section 1",
              type: "relationship",
              relationTo: "categories",
              admin: {
                description:
                  "Pick the category for the first category-based homepage product row.",
              },
            },
            {
              name: "categorySectionTwo",
              label: "Category Section 2",
              type: "relationship",
              relationTo: "categories",
              admin: {
                description:
                  "Pick the category for the second category-based homepage product row.",
              },
            },
            {
              name: "watchAndBuyItems",
              label: "Watch and Buy",
              type: "array",
              labels: {
                singular: "Video Card",
                plural: "Video Cards",
              },
              admin: {
                description:
                  "Choose the product and video for each Watch and Buy card. Drag rows to reorder.",
              },
              fields: [
                {
                  name: "product",
                  type: "relationship",
                  relationTo: "products",
                  required: true,
                },
                {
                  name: "video",
                  type: "upload",
                  relationTo: "media",
                  required: true,
                },
                {
                  name: "isActive",
                  label: "Active",
                  type: "checkbox",
                  defaultValue: true,
                },
              ],
            },
          ],
        },
        {
          label: "Banners",
          description: "Homepage promo banners between the product rows.",
          fields: [
            {
              name: "hoodiesBanner",
              label: "Banner 1",
              type: "group",
              fields: [
                { name: "image", type: "upload", relationTo: "media" },
                { name: "heading", type: "text", defaultValue: "HOODIES" },
                {
                  name: "subtext",
                  type: "text",
                  admin: { description: 'e.g. "13 Products".' },
                },
                {
                  name: "showCta",
                  label: "Show CTA",
                  type: "checkbox",
                  defaultValue: true,
                },
                {
                  name: "ctaLabel",
                  type: "text",
                  defaultValue: "SHOP NOW",
                  admin: {
                    hidden: true,
                  },
                },
                {
                  name: "ctaHref",
                  type: "text",
                  defaultValue: "/category/all",
                  admin: {
                    hidden: true,
                  },
                },
              ],
            },
            {
              name: "jacketBanner",
              label: "Banner 2",
              type: "group",
              fields: [
                { name: "image", type: "upload", relationTo: "media" },
                {
                  type: "row",
                  admin: { hidden: true },
                  fields: [
                    {
                      name: "leftImage",
                      label: "Legacy Left Image",
                      type: "upload",
                      relationTo: "media",
                      admin: { width: "50%" },
                    },
                    {
                      name: "rightImage",
                      label: "Legacy Right Image",
                      type: "upload",
                      relationTo: "media",
                      admin: { width: "50%" },
                    },
                  ],
                },
                {
                  name: "heading",
                  type: "text",
                  defaultValue: "NEW JACKET AT BEST PRICE",
                },
                { name: "subtext", type: "text" },
                {
                  name: "showCta",
                  label: "Show CTA",
                  type: "checkbox",
                  defaultValue: true,
                },
                {
                  name: "ctaLabel",
                  type: "text",
                  defaultValue: "SHOP NOW",
                  admin: {
                    hidden: true,
                  },
                },
                {
                  name: "ctaHref",
                  type: "text",
                  defaultValue: "/category/all",
                  admin: {
                    hidden: true,
                  },
                },
              ],
            },
            {
              name: "banner3",
              label: "Banner 3",
              type: "group",
              fields: [
                {
                  name: "image",
                  label: "Background Image",
                  type: "upload",
                  relationTo: "media",
                },
                { name: "heading", type: "text" },
                { name: "subtext", type: "text" },
                {
                  name: "showCta",
                  label: "Show CTA",
                  type: "checkbox",
                  defaultValue: false,
                },
                {
                  name: "ctaLabel",
                  type: "text",
                  defaultValue: "SHOP NOW",
                  admin: {
                    hidden: true,
                  },
                },
                {
                  name: "ctaHref",
                  type: "text",
                  defaultValue: "/category/all",
                  admin: {
                    hidden: true,
                  },
                },
              ],
            },
            {
              name: "playBoldImage",
              type: "upload",
              relationTo: "media",
              admin: {
                hidden: true,
                description:
                  "Legacy Banner 3 image field kept to avoid schema data loss.",
              },
            },
          ],
        },
        {
          label: "Children's Corner",
          description:
            "Character category cards shown at the bottom of the homepage. The section is hidden while there are no active cards.",
          fields: [
            {
              name: "childrensCornerTitle",
              label: "Section Title",
              type: "text",
              defaultValue: "Children's Corner",
            },
            {
              name: "childrensCornerHref",
              label: "Discover More Link",
              type: "text",
              defaultValue: "/all/",
              admin: {
                description: "Where the DISCOVER MORE button links.",
              },
            },
            {
              name: "childrensCornerItems",
              label: "Character Cards",
              type: "array",
              labels: { singular: "Character Card", plural: "Character Cards" },
              admin: {
                description:
                  "Drag rows to reorder cards. Untick Active to hide a card without deleting it.",
              },
              fields: [
                {
                  name: "name",
                  type: "text",
                  required: true,
                  admin: {
                    description:
                      "e.g. Batman. Shown in this list and used as image alt text — not displayed on the card.",
                  },
                },
                {
                  name: "category",
                  type: "relationship",
                  relationTo: "categories",
                  required: true,
                  admin: {
                    description: "Where the card links when clicked.",
                  },
                },
                {
                  name: "cardImage",
                  label: "Card Image",
                  type: "upload",
                  relationTo: "media",
                  admin: {
                    description:
                      "The full card artwork (character + background in one image). The card shows a blue placeholder until this is uploaded.",
                  },
                },
                {
                  name: "logoImage",
                  label: "Logo",
                  type: "upload",
                  relationTo: "media",
                  admin: {
                    description:
                      "Transparent PNG/SVG of the brand text logo shown in the white strip.",
                  },
                },
                {
                  name: "tabColor",
                  label: "Bottom Colour",
                  type: "text",
                  defaultValue: "#295DBE",
                  admin: {
                    description:
                      "Colour of the tab below the white strip (and the card outline).",
                    components: {
                      Field: "/src/components/admin/ColorPickerField#default",
                    },
                  },
                },
                {
                  name: "isActive",
                  label: "Active",
                  type: "checkbox",
                  defaultValue: true,
                },
              ],
            },
          ],
        },
        {
          label: "SEO",
          fields: [seoMetaGroup],
        },
      ],
    },
  ],
};

// Public site URL, used to build canonical/preview links in the SEO plugin.
const SEO_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://teehubshop.com";

// Maps an SEO-enabled document to its public storefront path. The homepage
// global has no slug and lives at "/"; everything else routes by collection.
function seoPathFor(
  collectionSlug: string | undefined,
  doc: { slug?: string | null } | undefined,
): string {
  const slug = doc?.slug ?? undefined;
  switch (collectionSlug) {
    case "products":
      return slug ? `/product/${slug}` : "";
    case "categories":
      return slug ? `/category/${slug}` : "";
    case "pages":
      return slug ? `/policies/${slug}` : "";
    default:
      return "";
  }
}

// Auto-fill defaults + live Google/social previews for the SEO tab. Editors can
// override any field; when left blank the storefront falls back to these too.
const seoGenerateTitle: GenerateTitle = ({ doc }) => {
  const base = (doc?.title || doc?.name) as string | undefined;
  return base ? `${base} - TeeHub` : "TeeHub";
};

const seoGenerateDescription: GenerateDescription = ({ doc }) =>
  (doc?.description as string | undefined) || "";

const seoGenerateURL: GenerateURL = ({ collectionSlug, globalSlug, doc }) => {
  const path = globalSlug === "homepage" ? "/" : seoPathFor(collectionSlug, doc);
  return `${SEO_SITE_URL}${path}`;
};

export default buildConfig({
  admin: {
    user: Admins.slug,
    suppressHydrationWarning: true,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  // FixedToolbarFeature adds an always-visible toolbar pinned to the top of the
  // editor (Google-Docs style), alongside the default floating "+" / selection
  // toolbars.
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      // Drop the floating selection toolbar ("toolbarInline") — the pinned
      // FixedToolbarFeature below already exposes every control, so the popup
      // that appears on highlight is redundant.
      ...defaultFeatures.filter((f) => f.key !== "toolbarInline"),
      FixedToolbarFeature(),
      TableFeature(),
    ],
  }),
  collections: [
    Admins,
    Customers,
    Categories,
    Products,
    Orders,
    WebhookEvents,
    Pages,
    Media,
  ],
  globals: [HomePage],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || "",
      max: Number(process.env.DATABASE_POOL_MAX || 2),
    },
    push: false,
  }),
  email: process.env.RESEND_API_KEY
    ? resendEmailAdapter({
        apiKey: process.env.RESEND_API_KEY,
        fromAddress: process.env.RESEND_FROM_EMAIL || "no-reply@teehubshop.com",
        fromName: process.env.RESEND_FROM_NAME || "TeeHub",
      })
    : undefined,
  plugins: [
    // Keeps the SEO plugin's auto-generate endpoints active. The actual SEO
    // fields are inserted manually as tabs above so they land in the right place.
    seoPlugin({
      collections: [],
      globals: [],
      generateTitle: seoGenerateTitle,
      generateDescription: seoGenerateDescription,
      generateURL: seoGenerateURL,
    }),
    // Uploads go to S3 only when a bucket is configured; without one Payload
    // stores files on local disk so the admin works in dev with no S3 keys.
    ...(process.env.S3_BUCKET
      ? [
          s3Storage({
            collections: {
              media: true,
            },
            bucket: process.env.S3_BUCKET,
            config: {
              endpoint: process.env.S3_ENDPOINT || "",
              region: process.env.S3_REGION || "",
              forcePathStyle: true,
              credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
              },
            },
          }),
        ]
      : []),
  ],
  secret: process.env.PAYLOAD_SECRET || "",
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
});
