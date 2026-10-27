// payload.config.ts
import { postgresAdapter } from "@payloadcms/db-postgres";
import {
  lexicalEditor,
  FixedToolbarFeature,
  EXPERIMENTAL_TableFeature as TableFeature
} from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { seoPlugin } from "@payloadcms/plugin-seo";
import path from "path";
import {
  buildConfig
} from "payload";
import { fileURLToPath } from "url";
import sharp from "sharp";

// src/lib/email/resendAdapter.ts
function addressToString(value) {
  if (Array.isArray(value)) {
    return value.flatMap((entry) => {
      const normalized = addressToString(entry);
      return Array.isArray(normalized) ? normalized : [normalized];
    }).filter(Boolean);
  }
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.address;
}
function normalizeRecipients(value) {
  const normalized = addressToString(value);
  return Array.isArray(normalized) ? normalized : [normalized].filter(Boolean);
}
function resendEmailAdapter({
  apiKey,
  fromAddress,
  fromName = "TeeHub"
}) {
  return () => ({
    name: "resend",
    defaultFromAddress: fromAddress,
    defaultFromName: fromName,
    sendEmail: async (message) => {
      const to = normalizeRecipients(message.to);
      if (!to.length) throw new Error("Resend email requires at least one recipient.");
      const from = message.from ? String(addressToString(message.from)) : `${fromName} <${fromAddress}>`;
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from,
          to,
          subject: message.subject,
          html: message.html,
          text: message.text,
          reply_to: message.replyTo ? addressToString(message.replyTo) : void 0
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || `Resend email failed with ${response.status}.`);
      }
      return data;
    }
  });
}

// payload.config.ts
var filename = fileURLToPath(import.meta.url);
var dirname = path.dirname(filename);
var isAdmin = ({ req: { user } }) => Boolean(user && user.collection === "admins");
var isAdminField = ({ req: { user } }) => Boolean(user && user.collection === "admins");
var adminOrSelf = ({ req: { user } }) => {
  if (!user) return false;
  if (user.collection === "admins") return true;
  return { id: { equals: user.id } };
};
var adminOrOrderOwner = ({ req: { user } }) => {
  if (!user) return false;
  if (user.collection === "admins") return true;
  if (user.collection === "customers") {
    return { customer: { equals: user.id } };
  }
  return false;
};
var homepageDefaultCategorySlugs = {
  categorySectionOne: "hoodies",
  categorySectionTwo: "polo"
};
async function findCategoryBySlug(req, slug) {
  const result = await req.payload.find({
    collection: "categories",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    overrideAccess: true
  });
  return result.docs[0];
}
function valueId(value) {
  if (typeof value === "object" && value !== null && "id" in value) {
    return value.id;
  }
  return value;
}
var showHomepageCategoryDefaults = async ({
  doc,
  req
}) => {
  const next = { ...doc };
  for (const field of Object.keys(
    homepageDefaultCategorySlugs
  )) {
    if (next[field]) continue;
    const category = await findCategoryBySlug(
      req,
      homepageDefaultCategorySlugs[field]
    );
    if (category) next[field] = category;
  }
  return next;
};
var saveHomepageCategoryDefaults = async ({
  data,
  req
}) => {
  const next = { ...data ?? {} };
  for (const field of Object.keys(
    homepageDefaultCategorySlugs
  )) {
    const id = valueId(next[field]);
    if (id) {
      next[field] = id;
      continue;
    }
    const category = await findCategoryBySlug(
      req,
      homepageDefaultCategorySlugs[field]
    );
    if (category) next[field] = category.id;
  }
  return next;
};
var woocommerceIdField = {
  name: "woocommerceId",
  label: "WooCommerce ID",
  type: "number",
  unique: true,
  index: true,
  access: {
    create: isAdminField,
    update: isAdminField
  },
  admin: {
    position: "sidebar",
    readOnly: true
  }
};
var Admins = {
  slug: "admins",
  auth: true,
  admin: {
    useAsTitle: "email"
  },
  fields: [
    {
      name: "name",
      type: "text"
    },
    {
      name: "role",
      type: "select",
      defaultValue: "admin",
      options: [
        {
          label: "Admin",
          value: "admin"
        }
      ],
      required: true
    }
  ]
};
var Media = {
  slug: "media",
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin
  },
  admin: {
    useAsTitle: "alt"
  },
  upload: true,
  fields: [
    woocommerceIdField,
    {
      name: "alt",
      type: "text",
      required: true
    }
  ]
};
var seoCanonicalField = {
  name: "canonicalURL",
  type: "text",
  label: "Canonical URL"
};
var seoMetaGroup = {
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
            clientProps: {}
          }
        }
      }
    },
    {
      name: "title",
      type: "text",
      admin: {
        components: {
          Field: {
            path: "@payloadcms/plugin-seo/client#MetaTitleComponent",
            clientProps: { hasGenerateTitleFn: true }
          }
        }
      }
    },
    {
      name: "description",
      type: "textarea",
      admin: {
        components: {
          Field: {
            path: "@payloadcms/plugin-seo/client#MetaDescriptionComponent",
            clientProps: { hasGenerateDescriptionFn: true }
          }
        }
      }
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
            clientProps: { hasGenerateURLFn: true }
          }
        }
      }
    }
  ]
};
var Categories = {
  slug: "categories",
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin
  },
  admin: {
    useAsTitle: "name"
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
              required: true
            },
            {
              name: "slug",
              label: "Slug (URL)",
              type: "text",
              required: true,
              unique: true
            },
            {
              name: "description",
              type: "textarea"
            },
            {
              name: "thumbnailImage",
              label: "Menu Thumbnail",
              type: "upload",
              relationTo: "media",
              admin: {
                description: "Small image shown for this category in the navbar dropdown."
              }
            },
            {
              name: "bg",
              type: "text",
              defaultValue: "#f1f1f1",
              admin: {
                description: "Hex colour (e.g. #c0352f) behind the menu thumbnail in the navbar dropdown.",
                components: {
                  Field: "/src/components/admin/ColorPickerField#default"
                }
              }
            },
            // How the thumbnail sits inside the menu tile (drag + zoom editor).
            // Values are replayed by MegaMenu as a CSS transform, so the admin
            // preview and the storefront tile always match.
            {
              name: "thumbFit",
              label: "Thumbnail Fit",
              type: "group",
              admin: {
                description: "Drag the image and zoom until it fits the tile the way you want.",
                components: {
                  Field: "/src/components/admin/ThumbFitField#default"
                }
              },
              fields: [
                {
                  name: "scale",
                  type: "number",
                  defaultValue: 100,
                  min: 20,
                  max: 300
                },
                {
                  name: "x",
                  type: "number",
                  defaultValue: 0,
                  min: -100,
                  max: 100
                },
                {
                  name: "y",
                  type: "number",
                  defaultValue: 0,
                  min: -100,
                  max: 100
                }
              ]
            },
            {
              name: "sortOrder",
              type: "number",
              defaultValue: 0,
              min: 0
            },
            {
              name: "isActive",
              type: "checkbox",
              defaultValue: true
            }
          ]
        },
        {
          label: "SEO",
          fields: [seoMetaGroup]
        }
      ]
    }
  ]
};
var Products = {
  slug: "products",
  defaultSort: "-originalCreatedAt",
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === "create" && data && !data.originalCreatedAt) {
          data.originalCreatedAt = (/* @__PURE__ */ new Date()).toISOString();
        }
        return data;
      }
    ]
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: [
      "title",
      "category",
      "priceMin",
      "isPublished",
      "originalCreatedAt"
    ]
  },
  fields: [
    woocommerceIdField,
    // Identity — shared by every screen.
    {
      name: "title",
      type: "text",
      required: true
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true
    },
    {
      name: "category",
      type: "relationship",
      relationTo: "categories",
      required: true
    },
    {
      name: "sku",
      label: "SKU",
      type: "text",
      index: true
    },
    // Fabric. Lives here rather than on the Catalog tab because it isn't a
    // filter — it's a spec, snapshotted onto every order line at purchase time
    // so order history can show what was actually bought. Colour has the same
    // job but already exists as the `colors` filter tag below.
    {
      name: "material",
      type: "text",
      admin: {
        description: 'e.g. "Polyester". Copied onto order lines at checkout.'
      }
    },
    {
      name: "woocommerceStatus",
      type: "select",
      options: ["draft", "pending", "private", "publish", "trash"],
      admin: { position: "sidebar" }
    },
    {
      name: "woocommerceType",
      type: "select",
      options: ["simple", "grouped", "external", "variable"],
      admin: { position: "sidebar" }
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
          Cell: "/src/components/admin/ProductDateCell#default"
        }
      }
    },
    {
      name: "stockStatus",
      type: "select",
      options: ["instock", "outofstock", "onbackorder"],
      admin: { position: "sidebar" }
    },
    {
      name: "stockQuantity",
      type: "number",
      min: 0,
      admin: { position: "sidebar" }
    },
    {
      name: "shortDescription",
      type: "textarea"
    },
    // Publishing controls live in the sidebar so they're reachable from any tab.
    {
      name: "isPublished",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar" }
    },
    {
      name: "isFeatured",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar" }
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
        description: "Show the Name & Number input on the product page (mainly jerseys)."
      }
    },
    {
      name: "sortOrder",
      type: "number",
      defaultValue: 0,
      min: 0,
      admin: { position: "sidebar" }
    },
    // Unnamed tabs: purely a UI grouping — fields stay top-level in the data,
    // so `doc.bg`, `doc.sizes`, etc. are unchanged (no DB migration).
    {
      type: "tabs",
      tabs: [
        {
          label: "Images",
          description: "Where each image shows up on the storefront. The catalog card and the detail gallery are independent.",
          fields: [
            {
              name: "cardImage",
              label: "Catalog Card Image",
              type: "upload",
              relationTo: "media"
            },
            {
              name: "cardFit",
              label: "Card Fit",
              type: "group",
              admin: {
                description: "Drag and zoom until the card image sits right in the listing tile.",
                components: {
                  Field: "/src/components/admin/CardFitField#default"
                }
              },
              fields: [
                { name: "scale", type: "number", defaultValue: 100, min: 20, max: 300 },
                { name: "x", type: "number", defaultValue: 0, min: -100, max: 100 },
                { name: "y", type: "number", defaultValue: 0, min: -100, max: 100 }
              ]
            },
            {
              name: "bg",
              type: "text",
              required: true,
              defaultValue: "#BF5550",
              admin: {
                components: {
                  Field: "/src/components/admin/ColorPickerField#default"
                }
              }
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
                description: "Product detail page only. First image is the big left image; the rest scroll in the middle."
              }
            },
            // Per-image drag/zoom inside the gallery card, keyed by media id so
            // fits survive reordering. Edited with the strip+editor.
            {
              name: "imageFits",
              label: "Gallery Image Fit",
              type: "json",
              admin: {
                description: "Click a gallery thumbnail, then drag and zoom that image until it sits right on the detail page.",
                components: {
                  Field: "/src/components/admin/ImageFitsField#default"
                }
              }
            }
          ]
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
              min: 0
            },
            {
              name: "priceMax",
              type: "number",
              min: 0,
              admin: {
                description: "Leave empty to show a single price instead of a range."
              }
            },
            // Detail-page sale pricing (struck-through MRP + discount badge).
            {
              name: "price",
              type: "number",
              min: 0,
              admin: {
                description: "Current sale price on the product page."
              }
            },
            {
              name: "originalPrice",
              type: "number",
              min: 0
            },
            {
              name: "discountPercent",
              type: "number",
              min: 0,
              max: 100
            },
            // Size pills on the detail page (XS–XXXL), with optional per-size stock.
            {
              name: "detailSizes",
              type: "array",
              admin: {
                components: {
                  Field: "/src/components/admin/DetailSizesField#default"
                }
              },
              fields: [
                {
                  name: "label",
                  type: "text",
                  required: true
                },
                {
                  name: "stock",
                  type: "number",
                  defaultValue: 0,
                  min: 0
                }
              ]
            },
            {
              name: "description",
              type: "textarea"
            },
            {
              name: "details",
              type: "array",
              admin: {
                components: {
                  Field: "/src/components/admin/DetailsField#default"
                }
              },
              fields: [
                {
                  name: "text",
                  type: "text",
                  required: true
                }
              ]
            },
            {
              name: "rating",
              type: "number",
              min: 0,
              max: 5
            },
            {
              name: "reviewCount",
              type: "number",
              min: 0
            },
            // Social-proof / promo strip on the detail page.
            {
              name: "fitPercent",
              type: "number",
              min: 0,
              max: 100,
              admin: {
                description: '"All sizes 96% fit" badge value.'
              }
            },
            {
              name: "fitReviews",
              type: "number",
              min: 0,
              admin: {
                description: "Review count shown next to the fit badge."
              }
            },
            {
              name: "freeShippingRemaining",
              type: "number",
              min: 0,
              admin: {
                description: "\u20B9 left to unlock free shipping, shown on the cart button."
              }
            },
            {
              name: "prepaidPromo",
              type: "textarea",
              admin: {
                description: "Green prepaid-incentive line under the fit copy."
              }
            },
            // Scarcity/social-proof copy. Deliberately typed rather than
            // computed: figures like Instagram features have no source in this
            // system, and the sold/viewing counts are merchandising claims that
            // staff need to be able to word themselves.
            {
              name: "conversionsBadge",
              label: "Gallery badge",
              type: "text",
              admin: {
                description: 'Overlay on the main image, e.g. "6 Conversions this week". Leave blank to hide it.'
              }
            },
            {
              name: "socialProof",
              label: "Social proof chips",
              type: "array",
              maxRows: 3,
              admin: {
                description: "The small pill row under the price. Three fit across the panel; more will wrap."
              },
              fields: [
                {
                  name: "icon",
                  type: "select",
                  required: true,
                  defaultValue: "fire",
                  options: [
                    { label: "Flame (sold today)", value: "fire" },
                    { label: "Instagram", value: "instagram" },
                    { label: "Parcel (delivering to)", value: "parcel" },
                    { label: "Star", value: "star" }
                  ]
                },
                {
                  name: "text",
                  type: "text",
                  required: true,
                  admin: {
                    description: 'e.g. "*54* Jerseys Sold Today". Wrap the figure in *asterisks* to show it bold and orange, as the design does; text without asterisks renders plain.'
                  }
                },
                {
                  name: "href",
                  label: "Link (optional)",
                  type: "text",
                  admin: {
                    description: "When set, the chip becomes a link and shows a \u203A arrow."
                  }
                }
              ]
            },
            // The green prepaid box. `prepaidPrice` is the headline "Get it @
            // ₹522" figure — typed, because the real prepaid maths depends on
            // coupons the storefront doesn't model yet.
            {
              name: "prepaidPrice",
              label: "Prepaid price",
              type: "number",
              min: 0,
              admin: {
                description: 'Shown as "Get it @ \u20B9522". Leave blank to hide the whole green prepaid box.'
              }
            },
            {
              name: "prepaidNote",
              type: "text",
              defaultValue: "Use best price on prepaid Orders",
              admin: { description: "Small line under the prepaid price." }
            },
            {
              name: "prepaidBadge",
              type: "text",
              admin: {
                description: 'Pill on the right of the prepaid box, e.g. "Upto \u20B9350 OFF + 5 OFF on prepaid".'
              }
            },
            // Accordion bodies. Blank falls back to the store-wide defaults on
            // the Product Page global.
            {
              name: "washCare",
              type: "textarea",
              admin: {
                description: "Wash care accordion. Blank uses the store default."
              }
            },
            {
              name: "shippingInfo",
              label: "Shipping",
              type: "textarea",
              admin: {
                description: "Shipping accordion. Blank uses the store default."
              }
            }
          ]
        },
        {
          label: "Catalog & Filters",
          description: "Tags that power the category-page filter panel \u2014 not shown on the product page. Option lists mirror FilterPanel's sections.",
          fields: [
            {
              name: "themes",
              type: "select",
              hasMany: true,
              options: ["Cricket", "IPL", "Football", "Movie"]
            },
            {
              name: "type",
              type: "select",
              options: ["T-Shirts", "Polos", "Jerseys", "Hoodies"],
              admin: {
                description: `Garment type \u2014 the filter panel's "Category" section.`
              }
            },
            {
              name: "colors",
              type: "select",
              hasMany: true,
              options: ["Black", "Red", "Orange", "Blue", "White", "Yellow"]
            },
            {
              name: "sleeve",
              type: "select",
              options: ["Long", "Short", "Halter"]
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
                "Extra Small"
              ],
              admin: {
                description: `Fit availability \u2014 the filter panel's "Fit" section.`
              }
            }
          ]
        },
        // SEO joins the existing tab bar here (Images / Product Page / Catalog &
        // Filters / SEO) instead of via the plugin's tabbedUI, so the main fields
        // and the sidebar stay exactly where they are.
        {
          label: "SEO",
          fields: [seoMetaGroup]
        }
      ]
    }
  ]
};
var Pages = {
  slug: "pages",
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "isPublished"]
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
              required: true
            },
            {
              name: "slug",
              label: "Slug (URL)",
              type: "text",
              required: true,
              unique: true,
              admin: {
                description: "URL path under /policies, e.g. privacy-policy."
              }
            },
            {
              name: "content",
              type: "richText",
              required: true
            }
          ]
        },
        {
          label: "SEO",
          fields: [seoMetaGroup]
        }
      ]
    },
    {
      name: "isPublished",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar" }
    }
  ]
};
var Customers = {
  slug: "customers",
  // `maxLoginAttempts: 0` turns off account locking. Payload's default (5
  // strikes, 10-minute lock) punishes the forgetful customer far more often
  // than it stops an attacker, and because the login route reports every
  // failure as "Invalid login or password", a locked shopper just sees their
  // correct password rejected with no explanation. The sign-in form counts
  // consecutive failures instead and offers a password reset — help, not a
  // door. Note this also makes Payload skip the lock check entirely, so any
  // `lockUntil` already sitting on a customer row stops having any effect.
  auth: {
    maxLoginAttempts: 0
  },
  defaultSort: "-lastActiveAt",
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === "create" && data) {
          const registeredAt = data.registeredAt || (/* @__PURE__ */ new Date()).toISOString();
          data.registeredAt = registeredAt;
          if (!data.lastActiveAt) data.lastActiveAt = registeredAt;
          if (!data.lastActiveSource) {
            data.lastActiveSource = data.woocommerceId ? "woocommerce" : "payload";
          }
        }
        return data;
      }
    ]
  },
  access: {
    // Signup goes through /api/auth/register so email verification cannot be
    // bypassed through the public Payload REST endpoint.
    create: isAdmin,
    read: adminOrSelf,
    update: adminOrSelf,
    delete: isAdmin
  },
  admin: {
    useAsTitle: "email",
    defaultColumns: [
      "fullName",
      "lastActiveAt",
      "orderCount",
      "totalSpent",
      "email"
    ]
  },
  fields: [
    woocommerceIdField,
    {
      name: "requiresPasswordReset",
      type: "checkbox",
      defaultValue: false,
      access: {
        create: isAdminField,
        update: isAdminField
      },
      admin: {
        position: "sidebar",
        description: "Imported accounts receive a random password and must reset it before signing in."
      }
    },
    {
      name: "emailVerified",
      type: "checkbox",
      admin: {
        hidden: true
      }
    },
    {
      name: "emailVerificationCodeHash",
      type: "text",
      admin: {
        hidden: true
      }
    },
    {
      name: "emailVerificationExpiresAt",
      type: "date",
      admin: {
        hidden: true
      }
    },
    {
      name: "emailVerificationAttempts",
      type: "number",
      defaultValue: 0,
      min: 0,
      admin: {
        hidden: true
      }
    },
    {
      name: "passwordResetCodeHash",
      type: "text",
      admin: {
        hidden: true
      }
    },
    {
      name: "passwordResetExpiresAt",
      type: "date",
      admin: {
        hidden: true
      }
    },
    {
      name: "passwordResetAttempts",
      type: "number",
      defaultValue: 0,
      min: 0,
      admin: {
        hidden: true
      }
    },
    {
      name: "woocommerceData",
      label: "WooCommerce legacy snapshot",
      type: "json",
      access: {
        create: isAdminField,
        update: isAdminField
      },
      admin: {
        hidden: true
      }
    },
    {
      name: "fullName",
      type: "text"
    },
    {
      name: "phone",
      type: "text",
      index: true,
      admin: {
        description: "Primary contact number (also used by phone-OTP login later)."
      }
    },
    {
      name: "registeredAt",
      label: "Date registered",
      type: "date",
      admin: {
        readOnly: true,
        position: "sidebar"
      }
    },
    {
      name: "lastActiveAt",
      label: "Last active",
      type: "date",
      index: true,
      admin: {
        readOnly: true,
        components: {
          Cell: "/src/components/admin/OrderDateCell#default"
        }
      }
    },
    {
      name: "lastActiveSource",
      type: "select",
      options: ["woocommerce", "payload"],
      admin: { hidden: true }
    },
    {
      name: "orderCount",
      label: "Orders",
      type: "number",
      defaultValue: 0,
      min: 0,
      admin: { readOnly: true }
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
          Cell: "/src/components/admin/CurrencyCell#default"
        }
      }
    },
    {
      name: "savedCart",
      label: "Saved cart",
      type: "json",
      admin: {
        description: "Current customer cart synced from the storefront for cross-device checkout.",
        components: {
          Field: "/src/components/admin/SavedCartField#default"
        }
      }
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
          admin: { description: 'e.g. "Home", "Work".' }
        },
        { name: "fullName", type: "text" },
        { name: "phone", type: "text" },
        { name: "address", type: "textarea", required: true },
        {
          type: "row",
          fields: [
            { name: "city", type: "text", admin: { width: "50%" } },
            { name: "state", type: "text", admin: { width: "50%" } }
          ]
        },
        { name: "pincode", type: "text" },
        {
          name: "isDefault",
          type: "checkbox",
          defaultValue: false,
          admin: { description: "Use this address by default at checkout." }
        }
      ]
    }
  ]
};
var Orders = {
  slug: "orders",
  defaultSort: "-originalCreatedAt",
  access: {
    read: adminOrOrderOwner,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin
  },
  admin: {
    useAsTitle: "orderNumber",
    defaultColumns: [
      "orderNumber",
      "originalCreatedAt",
      "status",
      "totalPrice"
    ]
  },
  hooks: {
    beforeChange: [
      ({ data, operation, originalDoc }) => {
        if (operation === "create" && data) {
          if (!data.orderNumber) {
            const stamp = Date.now().toString(36).toUpperCase();
            const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
            data.orderNumber = `TH-${stamp}-${rand}`;
          }
          if (!data.originalCreatedAt) {
            data.originalCreatedAt = (/* @__PURE__ */ new Date()).toISOString();
          }
        }
        if (data && data.status === "delivered" && !data.deliveredAt && !originalDoc?.deliveredAt) {
          data.deliveredAt = (/* @__PURE__ */ new Date()).toISOString();
        }
        if (data?.exchange?.state && !data.exchange.reference && !originalDoc?.exchange?.reference) {
          const stamp = Date.now().toString(36).toUpperCase();
          const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
          data.exchange.reference = `EX-${stamp}-${rand}`;
        }
        return data;
      }
    ],
    afterChange: [
      async ({ doc, req }) => {
        const customerId = typeof doc.customer === "object" && doc.customer ? doc.customer.id : doc.customer;
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
            lastActiveAt: true
          }
        });
        const current = customer.lastActiveAt ? new Date(customer.lastActiveAt).getTime() : 0;
        const orderDate = new Date(doc.originalCreatedAt).getTime();
        if (!Number.isNaN(orderDate) && orderDate >= current) {
          await req.payload.update({
            collection: "customers",
            id: customerId,
            data: {
              lastActiveAt: doc.originalCreatedAt,
              lastActiveSource: doc.woocommerceId ? "woocommerce" : "payload"
            },
            depth: 0,
            overrideAccess: true,
            // Reuse the transaction already attached to this hook request.
            req
          });
        }
        return doc;
      }
    ]
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
          Cell: "/src/components/admin/OrderNumberCell#default"
        }
      }
    },
    // Fulfilment + payment state live in the sidebar so they're editable from
    // any tab as the order moves through its lifecycle.
    {
      name: "status",
      type: "select",
      defaultValue: "pending",
      options: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      admin: { position: "sidebar" }
    },
    // Stamped automatically the first time `status` becomes "delivered" (see the
    // beforeChange hook), so "Delivered on …" appears in order history without
    // anyone having to fill it in. Editable for the cases where the status was
    // flipped late and the real date matters.
    {
      name: "deliveredAt",
      label: "Delivered on",
      type: "date",
      admin: {
        position: "sidebar",
        description: "Set automatically when the status becomes Delivered.",
        components: {
          Cell: "/src/components/admin/OrderDateCell#default"
        }
      }
    },
    {
      name: "woocommerceStatus",
      type: "text",
      admin: { position: "sidebar" }
    },
    {
      name: "originalCreatedAt",
      label: "Date",
      type: "date",
      admin: {
        position: "sidebar",
        components: {
          Cell: "/src/components/admin/OrderDateCell#default"
        }
      }
    },
    {
      name: "currency",
      type: "text",
      defaultValue: "INR",
      admin: { position: "sidebar" }
    },
    // Optional link to the account that placed the order. Left empty for guest
    // checkouts; the snapshotted buyer details below are always the record of
    // truth either way.
    {
      name: "customer",
      type: "relationship",
      relationTo: "customers",
      admin: { position: "sidebar" }
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
                description: "One row per cart line. Title/price/size are snapshotted at purchase time."
              },
              fields: [
                {
                  name: "product",
                  type: "relationship",
                  relationTo: "products",
                  admin: {
                    description: "Reference only \u2014 the snapshot fields below are the source of truth."
                  }
                },
                { name: "name", type: "text", required: true },
                { name: "woocommerceProductId", type: "number" },
                { name: "woocommerceVariationId", type: "number" },
                { name: "image", type: "text" },
                { name: "size", type: "text" },
                // Snapshotted alongside size so order history can show the exact
                // variant bought, even after the product's own colours or fabric
                // are edited. Free text rather than a select: WooCommerce line
                // items carry whatever the variation attribute was named.
                { name: "color", type: "text" },
                {
                  name: "material",
                  type: "text",
                  admin: {
                    description: "Fabric at purchase time, e.g. Polyester."
                  }
                },
                {
                  name: "quantity",
                  type: "number",
                  required: true,
                  defaultValue: 1,
                  min: 1
                },
                // Per-unit sale price and struck-through MRP at time of purchase.
                { name: "price", type: "number", required: true, min: 0 },
                { name: "mrp", type: "number", min: 0 },
                {
                  name: "customName",
                  type: "text",
                  admin: {
                    description: "Name/number printed on the jersey, if any."
                  }
                },
                // Which line the exchange is actually about. Orders can be part
                // exchanged, so this is per item rather than order-wide: it puts
                // the "Exchange" flag on this thumbnail in order history, while
                // the reason and reference live once on the Exchange tab.
                {
                  name: "exchanged",
                  label: "Part of an exchange",
                  type: "checkbox",
                  defaultValue: false
                }
              ]
            }
          ]
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
                { name: "state", type: "text", admin: { width: "50%" } }
              ]
            },
            { name: "pincode", type: "text" },
            {
              name: "billing",
              type: "json",
              admin: { description: "Original WooCommerce billing address." }
            },
            {
              name: "shipping",
              type: "json",
              admin: { description: "Original WooCommerce shipping address." }
            }
          ]
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
                  options: ["online", "cod", "wallet", "netbanking", "card"]
                },
                {
                  name: "status",
                  type: "select",
                  defaultValue: "pending",
                  options: ["pending", "paid", "failed", "refunded"]
                },
                { name: "transactionId", type: "text" },
                { name: "title", type: "text" },
                {
                  name: "gatewayOrderId",
                  label: "Gateway order ID",
                  type: "text",
                  unique: true,
                  index: true,
                  admin: { readOnly: true }
                },
                {
                  name: "gatewayStatus",
                  label: "Gateway status",
                  type: "text",
                  admin: { readOnly: true }
                },
                {
                  name: "verifiedAt",
                  label: "Payment verified at",
                  type: "date",
                  admin: { readOnly: true }
                },
                {
                  name: "gatewayResponse",
                  label: "Verified gateway response",
                  type: "json",
                  access: {
                    read: isAdminField,
                    create: isAdminField,
                    update: isAdminField
                  },
                  admin: {
                    readOnly: true,
                    description: "Sanitized server-to-server verification result. Secrets and full payment credentials are never stored."
                  }
                }
              ]
            },
            {
              name: "giftWrap",
              label: "Gift wrap",
              type: "checkbox",
              defaultValue: false
            },
            {
              name: "couponCode",
              type: "text",
              admin: { description: "Coupon entered at checkout (not yet validated)." }
            },
            // Mirrors the cart's running totals so the order is self-contained.
            {
              name: "totalCount",
              label: "Total items",
              type: "number",
              min: 0
            },
            { name: "totalMrp", type: "number", min: 0 },
            { name: "totalPrice", type: "number", min: 0 },
            { name: "shippingTotal", type: "number", min: 0 },
            { name: "discountTotal", type: "number", min: 0 },
            { name: "taxTotal", type: "number", min: 0 },
            { name: "refundedTotal", type: "number", min: 0 }
          ]
        },
        {
          label: "Exchange",
          description: "An exchange or return raised against this order. Picking a state is what makes the strip appear on the customer's order history; leave it blank and the order shows as a normal one.",
          fields: [
            {
              name: "exchange",
              label: false,
              type: "group",
              fields: [
                {
                  name: "state",
                  type: "select",
                  options: [
                    { label: "Requested (pending)", value: "pending" },
                    { label: "Accepted", value: "accepted" }
                  ],
                  admin: {
                    description: "Blank = no exchange on this order. This also drives the Return tab in order history."
                  }
                },
                {
                  name: "reason",
                  type: "text",
                  admin: {
                    description: 'Shown to the customer verbatim, e.g. "Size too small".'
                  }
                },
                {
                  name: "reference",
                  label: "Exchange ID",
                  type: "text",
                  admin: {
                    description: "Courier or internal reference the customer can quote."
                  }
                }
              ]
            }
          ]
        }
      ]
    },
    {
      name: "customerNote",
      type: "textarea"
    },
    {
      name: "woocommerceData",
      label: "WooCommerce legacy snapshot",
      type: "json",
      admin: {
        hidden: true
      }
    }
  ]
};
var WebhookEvents = {
  slug: "webhook-events",
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin
  },
  admin: {
    useAsTitle: "deliveryId",
    defaultColumns: ["deliveryId", "topic", "status", "processedAt"]
  },
  fields: [
    {
      name: "deliveryId",
      type: "text",
      required: true,
      unique: true,
      index: true
    },
    { name: "topic", type: "text", required: true },
    { name: "resourceId", type: "number" },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "received",
      options: ["received", "processed", "failed", "ignored"]
    },
    { name: "attempts", type: "number", defaultValue: 1, min: 1 },
    { name: "processedAt", type: "date" },
    { name: "error", type: "textarea" },
    { name: "payload", type: "json", required: true }
  ]
};
var REVIEW_FEATURE_TAGS = ["Color", "Comfort", "Quality", "Fit"];
var Reviews = {
  slug: "reviews",
  access: {
    // Moderation is enforced in the query layer (src/lib/reviews.ts), which only
    // ever asks for published rows. Kept world-readable so the product page can
    // render without an authenticated session.
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin
  },
  admin: {
    useAsTitle: "authorName",
    defaultColumns: [
      "authorName",
      "product",
      "rating",
      "isPublished",
      "purchasedAt"
    ],
    description: "Reviews shown in the Ratings and Reviews section of the product page."
  },
  fields: [
    {
      name: "product",
      type: "relationship",
      relationTo: "products",
      required: true,
      index: true
    },
    // Set when the review comes from a signed-in shopper via the review page.
    // Blank for reviews staff enter by hand.
    {
      name: "customer",
      type: "relationship",
      relationTo: "customers",
      admin: {
        position: "sidebar",
        description: "Set automatically when a signed-in customer submits."
      }
    },
    {
      name: "isPublished",
      type: "checkbox",
      defaultValue: false,
      index: true,
      admin: {
        position: "sidebar",
        description: "Unpublished reviews never appear on the storefront."
      }
    },
    {
      name: "authorName",
      label: "Reviewer name",
      type: "text",
      required: true
    },
    {
      name: "isVerifiedBuyer",
      label: "Verified buyer",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description: "Shows the green tick beside the name and counts toward the \u201Cverified buyers\u201D total under the heading."
      }
    },
    {
      name: "rating",
      type: "number",
      required: true,
      min: 1,
      max: 5,
      admin: {
        description: "Whole or half stars, 1\u20135. Drives the score histogram."
      }
    },
    {
      name: "body",
      label: "Review",
      type: "textarea",
      required: true
    },
    {
      name: "media",
      label: "Photos & video",
      type: "upload",
      relationTo: "media",
      hasMany: true,
      admin: {
        description: "Thumbnails under the review. Videos get a play overlay automatically."
      }
    },
    {
      name: "featureTags",
      label: "Features liked",
      type: "select",
      hasMany: true,
      options: [...REVIEW_FEATURE_TAGS],
      admin: {
        description: "Counted across all published reviews to rank the chips above the list."
      }
    },
    {
      name: "sizeBought",
      type: "text",
      admin: { description: 'Shown in the footer line, e.g. "Size Bought L".' }
    },
    {
      name: "purchasedAt",
      label: "Purchased on",
      type: "date"
    },
    // Vote tallies. Stored as plain counters so the eventual vote endpoint can
    // increment them without a per-visitor join table.
    {
      name: "helpfulCount",
      type: "number",
      defaultValue: 0,
      min: 0,
      admin: { position: "sidebar" }
    },
    {
      name: "notHelpfulCount",
      type: "number",
      defaultValue: 0,
      min: 0,
      admin: { position: "sidebar" }
    }
  ]
};
var Search = {
  slug: "search",
  label: "Search",
  access: {
    read: () => true,
    update: isAdmin
  },
  admin: {
    description: "Controls the suggestions shown in the search panel before the shopper types."
  },
  fields: [
    {
      name: "popularSearches",
      label: "Popular Searches",
      type: "array",
      maxRows: 8,
      admin: {
        description: "Chips shown under \u201CPopular Searches\u201D. Each one runs as a search term."
      },
      fields: [
        {
          name: "term",
          label: "Search term",
          type: "text",
          required: true
        }
      ]
    }
  ]
};
var ProductPage = {
  slug: "product-page",
  label: "Product Page",
  access: {
    read: () => true,
    update: isAdmin
  },
  admin: {
    description: "Offers, trust badges and delivery estimate shown on every product page."
  },
  fields: [
    {
      name: "offersTitle",
      type: "text",
      defaultValue: "Available Offers"
    },
    {
      name: "offers",
      label: "Offer tiles",
      type: "array",
      maxRows: 4,
      admin: {
        description: 'Renders as "Get \u20B9350 OFF / on purchase of \u20B92499". Uncheck Active to hide one without deleting it.'
      },
      fields: [
        {
          name: "amountOff",
          label: "\u20B9 off",
          type: "number",
          required: true,
          min: 0
        },
        {
          name: "minSpend",
          label: "On purchase of \u20B9",
          type: "number",
          required: true,
          min: 0
        },
        { name: "isActive", type: "checkbox", defaultValue: true }
      ]
    },
    {
      name: "trustBadges",
      label: "Trust badges",
      type: "array",
      maxRows: 4,
      admin: {
        description: "The green strip under the offers \u2014 returns, delivery, COD."
      },
      fields: [
        {
          name: "icon",
          type: "select",
          required: true,
          defaultValue: "return",
          options: [
            { label: "Return arrow", value: "return" },
            { label: "Delivery truck", value: "delivery" },
            { label: "Cash on delivery", value: "cod" },
            { label: "Shield", value: "shield" }
          ]
        },
        { name: "title", type: "text", required: true },
        { name: "subtitle", type: "text" },
        { name: "isActive", type: "checkbox", defaultValue: true }
      ]
    },
    {
      name: "deliveryLabel",
      type: "text",
      defaultValue: "FAST DELIVERY",
      admin: { description: "Heading above the estimated delivery date." }
    },
    {
      name: "deliveryLeadDays",
      label: "Delivery lead time (days)",
      type: "number",
      defaultValue: 7,
      min: 0,
      max: 60,
      admin: {
        description: 'The page renders today + this many days as "Get it by <date>", so the estimate never goes stale.'
      }
    },
    {
      name: "taxNote",
      type: "text",
      defaultValue: "Inclusive of all taxes",
      admin: { description: "Small print under the price." }
    },
    {
      name: "whatsappNumber",
      type: "text",
      admin: {
        description: "Digits only, with country code (e.g. 919876543210). Powers the green WhatsApp button. Leave blank to hide the button."
      }
    },
    {
      name: "washCare",
      label: "Wash care (default)",
      type: "textarea",
      admin: {
        description: "Used when a product doesn't set its own wash care copy."
      }
    },
    {
      name: "shipping",
      label: "Shipping (default)",
      type: "textarea",
      admin: {
        description: "Used when a product doesn't set its own shipping copy."
      }
    }
  ]
};
var HomePage = {
  slug: "homepage",
  access: {
    read: () => true,
    update: isAdmin
  },
  hooks: {
    afterRead: [showHomepageCategoryDefaults],
    beforeValidate: [saveHomepageCategoryDefaults]
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
              defaultValue: true
            },
            {
              name: "heroCtaLabel",
              type: "text",
              defaultValue: "SHOP NOW",
              admin: {
                hidden: true
              }
            },
            {
              name: "heroCtaHref",
              type: "text",
              defaultValue: "/all/",
              admin: {
                hidden: true
              }
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
                  admin: { width: "50%" }
                },
                {
                  name: "heroRightImage",
                  label: "Legacy Right Image",
                  type: "upload",
                  relationTo: "media",
                  admin: { width: "50%" }
                }
              ]
            },
            {
              name: "heroTeams",
              type: "array",
              labels: { singular: "Team", plural: "Teams" },
              admin: {
                description: "One slide per team. The headline is the only copy that changes between slides \u2014 the GEAR UP label, the four trust badges and the SHOP NOW button are the same on every one."
              },
              fields: [
                { name: "name", type: "text", required: true },
                { name: "logo", type: "upload", relationTo: "media", required: true },
                {
                  name: "backgroundImage",
                  label: "Background Image",
                  type: "upload",
                  relationTo: "media",
                  required: true
                },
                {
                  type: "row",
                  fields: [
                    {
                      name: "headlineTop",
                      label: "Headline line 1",
                      type: "text",
                      admin: {
                        width: "50%",
                        description: 'White (or black) line, e.g. "REPRESENT".'
                      }
                    },
                    {
                      name: "headlineBottom",
                      label: "Headline line 2",
                      type: "text",
                      admin: {
                        width: "50%",
                        description: 'Always orange, e.g. "WITH PRIDE.".'
                      }
                    }
                  ]
                },
                {
                  name: "theme",
                  label: "Headline colour",
                  type: "select",
                  defaultValue: "dark",
                  options: [
                    { label: "Dark artwork \u2014 white text", value: "dark" },
                    { label: "Light artwork \u2014 black text", value: "light" }
                  ],
                  admin: {
                    description: "Switches line 1 and the badge labels between white and black. Pick Light for bright artwork (e.g. a sky background) so the copy stays readable."
                  }
                }
              ]
            }
          ]
        },
        {
          label: "Product Sections",
          description: "Latest Drops always shows the newest products. Choose categories for the next two homepage rows.",
          fields: [
            {
              name: "latestDropsNote",
              label: "Latest Drops",
              type: "text",
              defaultValue: "Always shown automatically from the latest uploaded products.",
              admin: {
                readOnly: true,
                description: "No setup needed here. The storefront sorts published products by Date and shows the newest ones."
              }
            },
            {
              name: "categorySectionOne",
              label: "Category Section 1",
              type: "relationship",
              relationTo: "categories",
              admin: {
                description: "Pick the category for the first category-based homepage product row."
              }
            },
            {
              name: "categorySectionTwo",
              label: "Category Section 2",
              type: "relationship",
              relationTo: "categories",
              admin: {
                description: "Pick the category for the second category-based homepage product row."
              }
            },
            {
              name: "watchAndBuyItems",
              label: "Watch and Buy",
              type: "array",
              labels: {
                singular: "Video Card",
                plural: "Video Cards"
              },
              admin: {
                description: "Choose the product and video for each Watch and Buy card. Drag rows to reorder."
              },
              fields: [
                {
                  name: "product",
                  type: "relationship",
                  relationTo: "products",
                  required: true
                },
                {
                  name: "video",
                  type: "upload",
                  relationTo: "media",
                  required: true
                },
                {
                  name: "isActive",
                  label: "Active",
                  type: "checkbox",
                  defaultValue: true
                }
              ]
            }
          ]
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
                  admin: { description: 'e.g. "13 Products".' }
                },
                {
                  name: "showCta",
                  label: "Show CTA",
                  type: "checkbox",
                  defaultValue: true
                },
                {
                  name: "ctaLabel",
                  type: "text",
                  defaultValue: "SHOP NOW",
                  admin: {
                    hidden: true
                  }
                },
                {
                  name: "ctaHref",
                  type: "text",
                  defaultValue: "/category/all",
                  admin: {
                    hidden: true
                  }
                }
              ]
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
                      admin: { width: "50%" }
                    },
                    {
                      name: "rightImage",
                      label: "Legacy Right Image",
                      type: "upload",
                      relationTo: "media",
                      admin: { width: "50%" }
                    }
                  ]
                },
                {
                  name: "heading",
                  type: "text",
                  defaultValue: "NEW JACKET AT BEST PRICE"
                },
                { name: "subtext", type: "text" },
                {
                  name: "showCta",
                  label: "Show CTA",
                  type: "checkbox",
                  defaultValue: true
                },
                {
                  name: "ctaLabel",
                  type: "text",
                  defaultValue: "SHOP NOW",
                  admin: {
                    hidden: true
                  }
                },
                {
                  name: "ctaHref",
                  type: "text",
                  defaultValue: "/category/all",
                  admin: {
                    hidden: true
                  }
                }
              ]
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
                  relationTo: "media"
                },
                { name: "heading", type: "text" },
                { name: "subtext", type: "text" },
                {
                  name: "showCta",
                  label: "Show CTA",
                  type: "checkbox",
                  defaultValue: false
                },
                {
                  name: "ctaLabel",
                  type: "text",
                  defaultValue: "SHOP NOW",
                  admin: {
                    hidden: true
                  }
                },
                {
                  name: "ctaHref",
                  type: "text",
                  defaultValue: "/category/all",
                  admin: {
                    hidden: true
                  }
                }
              ]
            },
            {
              name: "playBoldImage",
              type: "upload",
              relationTo: "media",
              admin: {
                hidden: true,
                description: "Legacy Banner 3 image field kept to avoid schema data loss."
              }
            }
          ]
        },
        {
          label: "Top Collections",
          description: "Category cards shown between Banner 2 and Banner 1. The section is hidden while there are no active cards.",
          fields: [
            {
              name: "topCollectionsTitle",
              label: "Section Title",
              type: "text",
              defaultValue: "Top Collections"
            },
            {
              name: "topCollectionsHref",
              label: "Discover More Link",
              type: "text",
              defaultValue: "/all/",
              admin: {
                description: "Where the DISCOVER MORE button links."
              }
            },
            {
              name: "topCollectionsItems",
              label: "Collection Cards",
              type: "array",
              labels: { singular: "Collection Card", plural: "Collection Cards" },
              admin: {
                description: "Drag rows to reorder cards. Untick Active to hide a card without deleting it."
              },
              fields: [
                {
                  name: "category",
                  type: "relationship",
                  relationTo: "categories",
                  required: true,
                  admin: {
                    description: "Where the card links, and the caption shown under it."
                  }
                },
                {
                  name: "image",
                  label: "Card Image",
                  type: "upload",
                  relationTo: "media",
                  admin: {
                    description: "Portrait lifestyle shot for the card. The card is skipped until this is uploaded."
                  }
                },
                {
                  name: "labelOverride",
                  label: "Label Override",
                  type: "text",
                  admin: {
                    description: "Optional. Leave empty to caption the card with the category name."
                  }
                },
                {
                  name: "isActive",
                  label: "Active",
                  type: "checkbox",
                  defaultValue: true
                }
              ]
            }
          ]
        },
        {
          label: "Children's Corner",
          description: "Character category cards shown at the bottom of the homepage. The section is hidden while there are no active cards.",
          fields: [
            {
              name: "childrensCornerTitle",
              label: "Section Title",
              type: "text",
              defaultValue: "Children's Corner"
            },
            {
              name: "childrensCornerHref",
              label: "Discover More Link",
              type: "text",
              defaultValue: "/all/",
              admin: {
                description: "Where the DISCOVER MORE button links."
              }
            },
            {
              name: "childrensCornerItems",
              label: "Character Cards",
              type: "array",
              labels: { singular: "Character Card", plural: "Character Cards" },
              admin: {
                description: "Drag rows to reorder cards. Untick Active to hide a card without deleting it."
              },
              fields: [
                {
                  name: "name",
                  type: "text",
                  required: true,
                  admin: {
                    description: "e.g. Batman. Shown in this list and used as image alt text \u2014 not displayed on the card."
                  }
                },
                {
                  name: "category",
                  type: "relationship",
                  relationTo: "categories",
                  required: true,
                  admin: {
                    description: "Where the card links when clicked."
                  }
                },
                {
                  name: "cardImage",
                  label: "Card Image",
                  type: "upload",
                  relationTo: "media",
                  admin: {
                    description: "The full card artwork (character + background in one image). The card shows a blue placeholder until this is uploaded."
                  }
                },
                {
                  name: "logoImage",
                  label: "Logo",
                  type: "upload",
                  relationTo: "media",
                  admin: {
                    description: "Transparent PNG/SVG of the brand text logo shown in the white strip."
                  }
                },
                {
                  name: "tabColor",
                  label: "Bottom Colour",
                  type: "text",
                  defaultValue: "#295DBE",
                  admin: {
                    description: "Colour of the tab below the white strip (and the card outline).",
                    components: {
                      Field: "/src/components/admin/ColorPickerField#default"
                    }
                  }
                },
                {
                  name: "isActive",
                  label: "Active",
                  type: "checkbox",
                  defaultValue: true
                }
              ]
            }
          ]
        },
        {
          label: "SEO",
          fields: [seoMetaGroup]
        }
      ]
    }
  ]
};
var SEO_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://teehubshop.com";
function seoPathFor(collectionSlug, doc) {
  const slug = doc?.slug ?? void 0;
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
var seoGenerateTitle = ({ doc }) => {
  const base = doc?.title || doc?.name;
  return base ? `${base} - TeeHub` : "TeeHub";
};
var seoGenerateDescription = ({ doc }) => doc?.description || "";
var seoGenerateURL = ({ collectionSlug, globalSlug, doc }) => {
  const path2 = globalSlug === "homepage" ? "/" : seoPathFor(collectionSlug, doc);
  return `${SEO_SITE_URL}${path2}`;
};
var payload_config_default = buildConfig({
  admin: {
    user: Admins.slug,
    suppressHydrationWarning: true,
    importMap: {
      baseDir: path.resolve(dirname)
    }
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
      TableFeature()
    ]
  }),
  collections: [
    Admins,
    Customers,
    Categories,
    Products,
    Reviews,
    Orders,
    WebhookEvents,
    Pages,
    Media
  ],
  globals: [HomePage, Search, ProductPage],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || "",
      max: Number(process.env.DATABASE_POOL_MAX || 2)
    },
    push: false
  }),
  email: process.env.RESEND_API_KEY ? resendEmailAdapter({
    apiKey: process.env.RESEND_API_KEY,
    fromAddress: process.env.RESEND_FROM_EMAIL || "no-reply@teehubshop.com",
    fromName: process.env.RESEND_FROM_NAME || "TeeHub"
  }) : void 0,
  plugins: [
    // Keeps the SEO plugin's auto-generate endpoints active. The actual SEO
    // fields are inserted manually as tabs above so they land in the right place.
    seoPlugin({
      collections: [],
      globals: [],
      generateTitle: seoGenerateTitle,
      generateDescription: seoGenerateDescription,
      generateURL: seoGenerateURL
    }),
    // Uploads go to S3 only when a bucket is configured; without one Payload
    // stores files on local disk so the admin works in dev with no S3 keys.
    ...process.env.S3_BUCKET ? [
      s3Storage({
        collections: {
          media: true
        },
        bucket: process.env.S3_BUCKET,
        config: {
          endpoint: process.env.S3_ENDPOINT || "",
          region: process.env.S3_REGION || "",
          forcePathStyle: true,
          credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || ""
          }
        }
      })
    ] : []
  ],
  secret: process.env.PAYLOAD_SECRET || "",
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts")
  }
});

// scripts/hdfc-order-status-log.ts
import { getPayload } from "payload";

// src/lib/payments/hdfc.ts
import { createHash, randomBytes } from "node:crypto";
var UAT_BASE_URL = "https://smartgateway.hdfcuat.bank.in";
var PRODUCTION_BASE_URL = "https://smartgateway.hdfc.bank.in";
var HdfcGatewayError = class extends Error {
  constructor(message, status = 502) {
    super(message);
    this.status = status;
    this.name = "HdfcGatewayError";
  }
};
function hdfcConfig() {
  if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === "0") {
    throw new HdfcGatewayError(
      "Payment requests are disabled because TLS certificate verification is turned off on the server.",
      503
    );
  }
  const merchantId = process.env.HDFC_SMARTGATEWAY_MERCHANT_ID?.trim();
  const apiKey = process.env.HDFC_SMARTGATEWAY_API_KEY?.trim();
  const isProduction = process.env.HDFC_SMARTGATEWAY_ENV?.trim().toLowerCase() === "production";
  const returnUrl = (process.env.HDFC_SMARTGATEWAY_RETURN_URL || `${(process.env.NEXT_PUBLIC_SITE_URL || "https://teehubshop.com").replace(/\/$/, "")}/checkout/payment/return`).trim();
  if (!merchantId || !apiKey) {
    throw new HdfcGatewayError(
      "HDFC SmartGateway is not configured on the server.",
      503
    );
  }
  let parsedReturnUrl;
  try {
    parsedReturnUrl = new URL(returnUrl);
  } catch {
    throw new HdfcGatewayError(
      "HDFC_SMARTGATEWAY_RETURN_URL must be a valid public HTTPS URL.",
      503
    );
  }
  if (parsedReturnUrl.protocol !== "https:" || parsedReturnUrl.search) {
    throw new HdfcGatewayError(
      "HDFC_SMARTGATEWAY_RETURN_URL must use HTTPS and contain no query string.",
      503
    );
  }
  return {
    merchantId,
    apiKey,
    baseUrl: isProduction ? PRODUCTION_BASE_URL : UAT_BASE_URL,
    clientId: process.env.HDFC_SMARTGATEWAY_CLIENT_ID?.trim() || (isProduction ? merchantId : "hdfcmaster"),
    resellerId: process.env.HDFC_SMARTGATEWAY_RESELLER_ID?.trim() || "hdfc_reseller",
    returnUrl
  };
}
function authorizationHeader(apiKey) {
  return `Basic ${Buffer.from(apiKey, "utf8").toString("base64")}`;
}
function headers(config, customerId) {
  return {
    Authorization: authorizationHeader(config.apiKey),
    "Content-Type": "application/json",
    "x-merchantid": config.merchantId,
    "x-customerid": customerId,
    "x-resellerid": config.resellerId
  };
}
async function parseGatewayResponse(response) {
  const data = await response.json().catch(() => null);
  if (!response.ok || !data) {
    const message = data?.error_info?.user_message || data?.error_info?.developer_message || data?.error_info?.code || data?.error_message || data?.error || data?.error_code || `HDFC SmartGateway returned HTTP ${response.status}.`;
    throw new HdfcGatewayError(message, response.status || 502);
  }
  return data;
}
async function gatewayFetch(url, init) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15e3);
  try {
    return await fetch(url, { ...init, cache: "no-store", signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new HdfcGatewayError("HDFC SmartGateway timed out. Please retry.");
    }
    throw new HdfcGatewayError("Could not reach HDFC SmartGateway. Please retry.");
  } finally {
    clearTimeout(timeout);
  }
}
function hdfcCustomerId(customerId) {
  return `THC${createHash("sha256").update(String(customerId)).digest("hex").slice(0, 16)}`;
}
async function getHdfcOrderStatus(orderId, customerId) {
  const config = hdfcConfig();
  const response = await gatewayFetch(
    `${config.baseUrl}/orders/${encodeURIComponent(orderId)}`,
    {
      method: "GET",
      headers: {
        ...headers(config, customerId),
        version: "2023-06-30"
      }
    }
  );
  return parseGatewayResponse(response);
}
function verifyHdfcStatus(input) {
  const config = hdfcConfig();
  const actualAmount = Number(input.status.amount);
  if (input.status.order_id !== input.expectedOrderId || !Number.isFinite(actualAmount) || Math.abs(actualAmount - input.expectedAmount) > 9e-3 || input.status.currency && input.status.currency !== "INR" || input.status.merchant_id && input.status.merchant_id !== config.merchantId) {
    throw new HdfcGatewayError(
      "Payment verification failed because the gateway order details did not match.",
      409
    );
  }
}

// scripts/hdfc-order-status-log.ts
var exchanges = [];
var realFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const headers2 = Object.fromEntries(
    Object.entries(init?.headers ?? {}).map(
      ([name, value]) => name.toLowerCase() === "authorization" ? [name, "Basic ****(masked)****"] : [name, value]
    )
  );
  const exchange = {
    requestedAt: (/* @__PURE__ */ new Date()).toISOString(),
    method: init?.method ?? "GET",
    url: String(input),
    headers: headers2
  };
  exchanges.push(exchange);
  const response = await realFetch(input, init);
  exchange.status = response.status;
  exchange.respondedAt = (/* @__PURE__ */ new Date()).toISOString();
  exchange.body = await response.clone().text();
  return response;
};
function prettyBody(body) {
  if (!body) return "(empty)";
  try {
    return JSON.stringify(JSON.parse(body), null, 2);
  } catch {
    return body;
  }
}
function printExchanges() {
  for (const exchange of exchanges) {
    console.log("=== REQUEST ===");
    console.log(`Time:   ${exchange.requestedAt}`);
    console.log(`${exchange.method} ${exchange.url}`);
    for (const [name, value] of Object.entries(exchange.headers)) {
      console.log(`${name}: ${value}`);
    }
    console.log("");
    console.log("=== RESPONSE ===");
    console.log(`Time:   ${exchange.respondedAt ?? "(no response)"}`);
    console.log(`HTTP ${exchange.status ?? "-"}`);
    console.log(prettyBody(exchange.body));
    console.log("");
  }
}
async function run() {
  const gatewayOrderId = process.argv.slice(2).find((arg) => !arg.startsWith("--"));
  if (!gatewayOrderId || !/^[A-Za-z0-9]{1,20}$/.test(gatewayOrderId)) {
    console.error("Usage: npm run log:hdfc-status -- <HDFC order ID, e.g. TH...>");
    process.exitCode = 1;
    return;
  }
  const payload = await getPayload({ config: payload_config_default });
  activePayload = payload;
  const found = await payload.find({
    collection: "orders",
    where: { "payment.gatewayOrderId": { equals: gatewayOrderId } },
    limit: 1,
    depth: 0,
    overrideAccess: true
  });
  const order = found.docs[0];
  const customerId = typeof order?.customer === "object" && order.customer ? order.customer.id : order?.customer;
  if (!order || !customerId) {
    console.error(`No order with a customer was found for ${gatewayOrderId}.`);
    process.exitCode = 1;
    return;
  }
  try {
    const status = await getHdfcOrderStatus(
      gatewayOrderId,
      hdfcCustomerId(customerId)
    );
    printExchanges();
    verifyHdfcStatus({
      expectedOrderId: gatewayOrderId,
      expectedAmount: Number(order.totalPrice ?? 0),
      status
    });
    console.log(
      `=== RESULT ===
Order ${gatewayOrderId}: gateway status ${status.status}, amount ${status.amount} ${status.currency ?? "INR"} \u2014 matches our order (${order.orderNumber}).`
    );
  } catch (error) {
    printExchanges();
    console.error(
      `=== RESULT ===
${error instanceof Error ? error.message : String(error)}`
    );
    process.exitCode = 1;
  }
}
var activePayload;
var keepAlive = setInterval(() => void 0, 1e3);
run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  await activePayload?.destroy();
  clearInterval(keepAlive);
});
