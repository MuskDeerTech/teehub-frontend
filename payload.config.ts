import { postgresAdapter } from "@payloadcms/db-postgres";
import { s3Storage } from "@payloadcms/storage-s3";
import path from "path";
import { buildConfig, type CollectionConfig } from "payload";
import { fileURLToPath } from "url";
import sharp from "sharp";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const isLoggedIn = ({ req }: { req: { user?: unknown } }) => Boolean(req.user);

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
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  admin: {
    useAsTitle: "alt",
  },
  upload: true,
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
    },
  ],
};

const Categories: CollectionConfig = {
  slug: "categories",
  access: {
    read: () => true,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  admin: {
    useAsTitle: "name",
  },
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
};

// Field names deliberately mirror the `Product` type in src/lib/products.ts so
// the storefront swap is a 1:1 mapping. The facet select options below must
// stay in sync with the section option lists in
// src/components/category/FilterPanel.tsx.
const Products: CollectionConfig = {
  slug: "products",
  access: {
    read: () => true,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "priceMin", "isPublished"],
  },
  fields: [
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
      ],
    },
  ],
};

export default buildConfig({
  admin: {
    user: Admins.slug,
    suppressHydrationWarning: true,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Admins, Categories, Products, Media],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || "",
      max: Number(process.env.DATABASE_POOL_MAX || 2),
    },
  }),
  // Uploads go to S3 only when a bucket is configured; without one Payload
  // stores files on local disk so the admin works in dev with no S3 keys.
  plugins: process.env.S3_BUCKET
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
    : [],
  secret: process.env.PAYLOAD_SECRET || "",
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
});
