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
      type: "text",
      required: true,
      unique: true,
    },
    {
      name: "description",
      type: "textarea",
    },
    {
      name: "bannerImage",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "thumbnailImage",
      type: "upload",
      relationTo: "media",
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
      name: "images",
      type: "upload",
      relationTo: "media",
      hasMany: true,
      admin: {
        description:
          "First image is the catalog card; the rest become the detail-page gallery.",
      },
    },
    {
      name: "bg",
      type: "text",
      required: true,
      defaultValue: "#BF5550",
      admin: {
        description:
          "Hex colour (e.g. #BF5550) behind the product image on cards and the detail gallery.",
      },
    },
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
    // Filter facets — option lists mirror FilterPanel's sections.
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
    // Size pills on the detail page (XS–XXXL), with optional per-size stock.
    {
      name: "detailSizes",
      type: "array",
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
    {
      name: "isPublished",
      type: "checkbox",
      defaultValue: false,
    },
    {
      name: "isFeatured",
      type: "checkbox",
      defaultValue: false,
    },
    {
      name: "sortOrder",
      type: "number",
      defaultValue: 0,
      min: 0,
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
