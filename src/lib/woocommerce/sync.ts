import { randomBytes } from "crypto";
import type { Payload } from "payload";
import type {
  SyncAction,
  WooAddress,
  WooCustomer,
  WooImage,
  WooLineItem,
  WooOrder,
  WooProduct,
} from "./types";

type Doc = Record<string, unknown> & { id: string | number };
type MigrationPayload = {
  find(args: Record<string, unknown>): Promise<{ docs: Doc[] }>;
  create(args: Record<string, unknown>): Promise<Doc>;
  update(args: Record<string, unknown>): Promise<Doc>;
};

export type WooSyncCache = {
  mediaByWooId: Map<number, Doc>;
  productByWooId: Map<number, Doc>;
  productBySku: Map<string, Doc>;
  productBySlug: Map<string, Doc>;
  customerByWooId: Map<number, Doc>;
  customerByEmail: Map<string, Doc>;
  orderByWooId: Map<number, Doc>;
  orderByNumber: Map<string, Doc>;
};

const db = (payload: Payload) => payload as unknown as MigrationPayload;
const numberOrZero = (value: string | number | null | undefined) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const cleanHtml = (value = "") =>
  value
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#8211;|&ndash;/gi, "–")
    .replace(/&#8212;|&mdash;/gi, "—")
    .replace(/\s+/g, " ")
    .trim();

const fullName = (address?: WooAddress) =>
  [address?.first_name, address?.last_name].filter(Boolean).join(" ").trim();

const addressLine = (address?: WooAddress) =>
  [address?.address_1, address?.address_2, address?.company]
    .filter(Boolean)
    .join(", ")
    .trim();

async function findOne(
  payload: Payload,
  collection: string,
  field: string,
  value: string | number,
) {
  const result = await db(payload).find({
    collection,
    where: { [field]: { equals: value } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });
  return result.docs[0];
}

async function upsertByWooId(
  payload: Payload,
  collection: string,
  woocommerceId: number,
  data: Record<string, unknown>,
  existing?: Doc,
): Promise<{ action: SyncAction; doc: Doc }> {
  const current =
    existing ??
    (await findOne(payload, collection, "woocommerceId", woocommerceId));
  if (current) {
    return {
      action: "updated",
      doc: await db(payload).update({
        collection,
        id: current.id,
        data,
        overrideAccess: true,
      }),
    };
  }
  return {
    action: "created",
    doc: await db(payload).create({
      collection,
      data,
      overrideAccess: true,
    }),
  };
}

function fileNameFor(image: WooImage, contentType: string) {
  const fromUrl = new URL(image.src).pathname.split("/").pop();
  const extension = contentType.split("/")[1]?.split(";")[0] || "jpg";
  const raw = fromUrl || image.name || `woocommerce-${image.id}.${extension}`;
  return raw.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export async function syncMedia(
  payload: Payload,
  image: WooImage,
  cache?: WooSyncCache,
) {
  if (!image.id || !image.src) {
    return { action: "skipped" as const, doc: undefined };
  }
  const existing =
    cache?.mediaByWooId.get(image.id) ??
    (cache
      ? undefined
      : await findOne(payload, "media", "woocommerceId", image.id));
  if (existing) return { action: "skipped" as const, doc: existing };

  const response = await fetch(image.src, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Image download failed (${response.status}): ${image.src}`);
  }
  const contentType =
    response.headers.get("content-type") || "application/octet-stream";
  const data = Buffer.from(await response.arrayBuffer());
  const doc = await db(payload).create({
    collection: "media",
    data: {
      woocommerceId: image.id,
      alt: image.alt || image.name || `WooCommerce image ${image.id}`,
    },
    file: {
      data,
      mimetype: contentType,
      name: fileNameFor(image, contentType),
      size: data.length,
    },
    overrideAccess: true,
  });
  cache?.mediaByWooId.set(image.id, doc);
  return { action: "created" as const, doc };
}

/**
 * Whether a WooCommerce product offered a "name & number" customization. The
 * old store used the RedNao Advanced Product Fields plugin, which stores its
 * field config in the `_rednao_advanced_product_options` meta entry. A product
 * is customizable when that config holds at least one field — the labels are
 * jersey-name variants ("Jersey Name & Number", "Free Jersey Name & Number"…).
 */
function detectCustomName(product: WooProduct): boolean {
  const entry = product.meta_data?.find(
    (meta) => meta.key === "_rednao_advanced_product_options",
  );
  if (!entry) return false;
  let value: unknown = entry.value;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return false;
    }
  }
  const rows = (value as { Rows?: Array<{ Columns?: Array<{ Field?: unknown }> }> })
    ?.Rows;
  if (!Array.isArray(rows)) return false;
  return rows.some((row) =>
    (row.Columns ?? []).some((col) => Boolean(col?.Field)),
  );
}

export async function syncProduct(
  payload: Payload,
  product: WooProduct,
  {
    categoryId,
    imageIds,
    cache,
    slugOverride,
    matchExistingBySkuOrSlug = true,
  }: {
    categoryId: string | number;
    imageIds: Array<string | number>;
    cache?: WooSyncCache;
    slugOverride?: string;
    matchExistingBySkuOrSlug?: boolean;
  },
) {
  const price = numberOrZero(
    product.price || product.sale_price || product.regular_price,
  );
  const regularPrice = numberOrZero(product.regular_price || product.price);
  const slug =
    slugOverride || product.slug || `woocommerce-product-${product.id}`;
  const existing = cache
    ? cache.productByWooId.get(product.id) ??
      (matchExistingBySkuOrSlug
        ? (product.sku
            ? cache.productBySku.get(product.sku.toLowerCase())
            : undefined) ?? cache.productBySlug.get(slug.toLowerCase())
        : undefined)
    : (await findOne(payload, "products", "woocommerceId", product.id)) ??
      (matchExistingBySkuOrSlug
        ? (product.sku
            ? await findOne(payload, "products", "sku", product.sku)
            : undefined) ?? (await findOne(payload, "products", "slug", slug))
        : undefined);
  const result = await upsertByWooId(
    payload,
    "products",
    product.id,
    {
      woocommerceId: product.id,
      title: product.name,
      slug,
      category: categoryId,
      sku: product.sku || undefined,
      woocommerceStatus: product.status,
      woocommerceType: product.type,
      originalCreatedAt: product.date_created,
      stockStatus: product.stock_status,
      stockQuantity: product.stock_quantity ?? undefined,
      shortDescription: cleanHtml(product.short_description),
      description: cleanHtml(product.description),
      cardImage: imageIds[0],
      images: imageIds,
      bg: "#f1f1f1",
      priceMin: price,
      priceMax: regularPrice > price ? regularPrice : price,
      price,
      originalPrice: regularPrice || undefined,
      discountPercent:
        regularPrice > price && regularPrice > 0
          ? Math.round(((regularPrice - price) / regularPrice) * 100)
          : undefined,
      isPublished: product.status === "publish",
      allowCustomName: detectCustomName(product),
      sortOrder: product.menu_order ?? 0,
    },
    existing,
  );
  cache?.productByWooId.set(product.id, result.doc);
  cache?.productBySlug.set(slug.toLowerCase(), result.doc);
  if (product.sku) cache?.productBySku.set(product.sku.toLowerCase(), result.doc);
  return result;
}

function customerAddresses(customer: WooCustomer) {
  const addresses = [
    { label: "Billing", value: customer.billing, isDefault: true },
    { label: "Shipping", value: customer.shipping, isDefault: false },
  ];
  return addresses
    .filter(({ value }) => Boolean(addressLine(value)))
    .map(({ label, value, isDefault }) => ({
      label,
      fullName: fullName(value),
      phone: value?.phone,
      address: addressLine(value),
      city: value?.city,
      state: value?.state,
      pincode: value?.postcode,
      isDefault,
    }));
}

export async function syncCustomer(
  payload: Payload,
  customer: WooCustomer,
  cache?: WooSyncCache,
) {
  const email = customer.email?.trim().toLowerCase();
  if (!email) return { action: "skipped" as const, doc: undefined };

  const byWooId =
    cache?.customerByWooId.get(customer.id) ??
    (cache
      ? undefined
      : await findOne(payload, "customers", "woocommerceId", customer.id));
  const byEmail =
    byWooId ??
    cache?.customerByEmail.get(email) ??
    (cache ? undefined : await findOne(payload, "customers", "email", email));
  const customerData = {
    woocommerceId: customer.id,
    email,
    fullName:
      [customer.first_name, customer.last_name].filter(Boolean).join(" ") ||
      fullName(customer.billing) ||
      customer.username ||
      email,
    phone: customer.billing?.phone || customer.shipping?.phone,
    addresses: customerAddresses(customer),
    registeredAt: customer.date_created,
    ...(typeof customer.orders_count === "number"
      ? { orderCount: customer.orders_count }
      : {}),
    ...(customer.total_spent !== undefined
      ? { totalSpent: numberOrZero(customer.total_spent) }
      : {}),
    requiresPasswordReset: true,
    woocommerceData: customer,
  };

  if (byEmail) {
    const result = await upsertByWooId(
      payload,
      "customers",
      customer.id,
      customerData,
      byEmail,
    );
    cache?.customerByWooId.set(customer.id, result.doc);
    cache?.customerByEmail.set(email, result.doc);
    return result;
  }
  const result = await upsertByWooId(payload, "customers", customer.id, {
    ...customerData,
    password: randomBytes(32).toString("base64url"),
  });
  cache?.customerByWooId.set(customer.id, result.doc);
  cache?.customerByEmail.set(email, result.doc);
  return result;
}

function orderStatus(status: string) {
  if (status === "completed") return "delivered";
  if (status === "processing") return "confirmed";
  if (["cancelled", "failed", "refunded", "trash"].includes(status)) {
    return "cancelled";
  }
  return "pending";
}

function paymentStatus(order: WooOrder) {
  if (order.status === "refunded") return "refunded";
  if (["failed", "cancelled"].includes(order.status)) return "failed";
  if (order.date_paid || ["processing", "completed"].includes(order.status)) {
    return "paid";
  }
  return "pending";
}

function paymentMethod(method = "") {
  const normalized = method.toLowerCase();
  if (normalized.includes("cod")) return "cod";
  if (normalized.includes("wallet")) return "wallet";
  if (normalized.includes("bank") || normalized.includes("bacs")) {
    return "netbanking";
  }
  if (
    normalized.includes("card") ||
    normalized.includes("stripe") ||
    normalized.includes("razor")
  ) {
    return "card";
  }
  return "online";
}

function lineSize(item: WooLineItem) {
  const size = item.meta_data?.find((meta) =>
    (meta.display_key || meta.key).toLowerCase().includes("size"),
  );
  return size ? String(size.display_value ?? size.value) : undefined;
}

async function mapLineItem(
  payload: Payload,
  item: WooLineItem,
  cache?: WooSyncCache,
) {
  const product = item.product_id
    ? cache?.productByWooId.get(item.product_id) ??
      (cache
        ? undefined
        : await findOne(payload, "products", "woocommerceId", item.product_id))
    : undefined;
  const quantity = Math.max(1, item.quantity || 1);
  const subtotal = numberOrZero(item.subtotal);
  const total = numberOrZero(item.total);
  return {
    product: product?.id,
    woocommerceProductId: item.product_id || undefined,
    woocommerceVariationId: item.variation_id || undefined,
    name: item.name,
    image: item.image?.src,
    size: lineSize(item),
    quantity,
    price: total / quantity,
    mrp: subtotal / quantity,
  };
}

async function customerForOrder(
  payload: Payload,
  order: WooOrder,
  cache?: WooSyncCache,
) {
  if (order.customer_id) {
    const existing =
      cache?.customerByWooId.get(order.customer_id) ??
      (cache
        ? undefined
        : await findOne(
            payload,
            "customers",
            "woocommerceId",
            order.customer_id,
          ));
    if (existing) return existing;
  }
  const email = order.billing?.email?.trim().toLowerCase();
  if (!email) return undefined;
  const byEmail =
    cache?.customerByEmail.get(email) ??
    (cache ? undefined : await findOne(payload, "customers", "email", email));
  if (byEmail) return byEmail;
  if (!order.customer_id) return undefined;
  return (
    await syncCustomer(payload, {
      id: order.customer_id,
      email,
      first_name: order.billing?.first_name,
      last_name: order.billing?.last_name,
      billing: order.billing,
      shipping: order.shipping,
    }, cache)
  ).doc;
}

export async function syncOrder(
  payload: Payload,
  order: WooOrder,
  cache?: WooSyncCache,
) {
  const lineItems = await Promise.all(
    (order.line_items ?? []).map((item) => mapLineItem(payload, item, cache)),
  );
  if (!lineItems.length) {
    throw new Error(`WooCommerce order ${order.id} has no line items.`);
  }
  const customer = await customerForOrder(payload, order, cache);
  const delivery = addressLine(order.shipping)
    ? order.shipping
    : order.billing;
  const totalMrp = lineItems.reduce(
    (sum, item) => sum + numberOrZero(item.mrp) * item.quantity,
    0,
  );
  const refundedTotal = (order.refunds ?? []).reduce(
    (sum, refund) => sum + Math.abs(numberOrZero(refund.total)),
    0,
  );

  const orderNumber = `WC-${order.number || order.id}`;
  const existing = cache
    ? cache.orderByWooId.get(order.id) ??
      cache.orderByNumber.get(orderNumber.toLowerCase())
    : (await findOne(payload, "orders", "woocommerceId", order.id)) ??
      (await findOne(payload, "orders", "orderNumber", orderNumber));
  const result = await upsertByWooId(payload, "orders", order.id, {
    woocommerceId: order.id,
    orderNumber,
    status: orderStatus(order.status),
    woocommerceStatus: order.status,
    originalCreatedAt: order.date_created,
    currency: order.currency || "INR",
    customer: customer?.id,
    items: lineItems,
    fullName: fullName(delivery) || fullName(order.billing) || "Guest customer",
    phone: order.billing?.phone || "Not provided",
    email: order.billing?.email || undefined,
    address: addressLine(delivery) || "Not provided",
    city: delivery?.city,
    state: delivery?.state,
    pincode: delivery?.postcode,
    billing: order.billing,
    shipping: order.shipping,
    payment: {
      method: paymentMethod(order.payment_method),
      status: paymentStatus(order),
      transactionId: order.transaction_id,
      title: order.payment_method_title,
    },
    couponCode: order.coupon_lines?.map((coupon) => coupon.code).filter(Boolean).join(", "),
    totalCount: lineItems.reduce((sum, item) => sum + item.quantity, 0),
    totalMrp,
    totalPrice: numberOrZero(order.total),
    shippingTotal: numberOrZero(order.shipping_total),
    discountTotal: numberOrZero(order.discount_total),
    taxTotal: numberOrZero(order.total_tax),
    refundedTotal,
    customerNote: order.customer_note,
    woocommerceData: order,
  }, existing);
  cache?.orderByWooId.set(order.id, result.doc);
  cache?.orderByNumber.set(orderNumber.toLowerCase(), result.doc);
  return result;
}

export async function cancelWooOrder(payload: Payload, woocommerceId: number) {
  const existing = await findOne(
    payload,
    "orders",
    "woocommerceId",
    woocommerceId,
  );
  if (!existing) return { action: "skipped" as const, doc: undefined };
  return {
    action: "updated" as const,
    doc: await db(payload).update({
      collection: "orders",
      id: existing.id,
      data: {
        status: "cancelled",
        woocommerceStatus: "deleted",
      },
      overrideAccess: true,
    }),
  };
}

export async function ensureFallbackCategory(payload: Payload) {
  const existing = await findOne(payload, "categories", "slug", "uncategorized");
  if (existing) return existing;
  return db(payload).create({
    collection: "categories",
    data: {
      name: "Uncategorized",
      slug: "uncategorized",
      isActive: true,
      sortOrder: 9999,
    },
    overrideAccess: true,
  });
}

export async function getWooIdMap(payload: Payload, collection: string) {
  const result = await db(payload).find({
    collection,
    where: { woocommerceId: { exists: true } },
    limit: 10000,
    pagination: false,
    depth: 0,
    overrideAccess: true,
  });
  return new Map(
    result.docs
      .filter((doc) => typeof doc.woocommerceId === "number")
      .map((doc) => [doc.woocommerceId as number, doc.id]),
  );
}

export async function getCategorySlugMap(payload: Payload) {
  const result = await db(payload).find({
    collection: "categories",
    limit: 10000,
    pagination: false,
    depth: 0,
    overrideAccess: true,
  });
  return new Map(
    result.docs
      .filter((doc) => typeof doc.slug === "string")
      .map((doc) => [String(doc.slug).toLowerCase(), doc.id]),
  );
}

async function allDocs(
  payload: Payload,
  collection: string,
  select: Record<string, boolean>,
) {
  return (
    await db(payload).find({
      collection,
      limit: 100000,
      pagination: false,
      depth: 0,
      select,
      overrideAccess: true,
    })
  ).docs;
}

export async function buildWooSyncCache(
  payload: Payload,
): Promise<WooSyncCache> {
  const [media, products, customers, orders] = await Promise.all([
    allDocs(payload, "media", { woocommerceId: true }),
    allDocs(payload, "products", {
      woocommerceId: true,
      sku: true,
      slug: true,
    }),
    allDocs(payload, "customers", {
      woocommerceId: true,
      email: true,
    }),
    allDocs(payload, "orders", {
      woocommerceId: true,
      orderNumber: true,
    }),
  ]);
  const byNumber = (docs: Doc[], field: string) =>
    new Map(
      docs
        .filter((doc) => typeof doc[field] === "number")
        .map((doc) => [doc[field] as number, doc]),
    );
  const byString = (docs: Doc[], field: string) =>
    new Map(
      docs
        .filter((doc) => typeof doc[field] === "string" && doc[field])
        .map((doc) => [String(doc[field]).toLowerCase(), doc]),
    );
  return {
    mediaByWooId: byNumber(media, "woocommerceId"),
    productByWooId: byNumber(products, "woocommerceId"),
    productBySku: byString(products, "sku"),
    productBySlug: byString(products, "slug"),
    customerByWooId: byNumber(customers, "woocommerceId"),
    customerByEmail: byString(customers, "email"),
    orderByWooId: byNumber(orders, "woocommerceId"),
    orderByNumber: byString(orders, "orderNumber"),
  };
}
