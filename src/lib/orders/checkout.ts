import type { Payload } from "payload";
import type { Customer, Product } from "../../../payload-types";

export type CheckoutItemInput = {
  id: string;
  size: string;
  quantity: number;
  customName?: string;
};

export type CheckoutCustomerInput = {
  fullName: string;
  address: string;
  pincode: string;
  city: string;
  state: string;
  phone: string;
  email: string;
};

export type CheckoutInput = {
  items: CheckoutItemInput[];
  customer: CheckoutCustomerInput;
  paymentMethod?: string;
  couponCode?: string;
  giftWrap?: boolean;
};

export class CheckoutError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
    this.name = "CheckoutError";
  }
}

function requiredText(value: unknown, label: string, max = 200) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new CheckoutError(`${label} is required.`);
  return text.slice(0, max);
}

function productImage(product: Product) {
  return typeof product.cardImage === "object" && product.cardImage?.url
    ? product.cardImage.url
    : "";
}

function paymentMethod(
  value: string | undefined,
): "online" | "wallet" | "netbanking" | "card" {
  return value === "wallet" || value === "netbanking" || value === "card"
    ? value
    : "online";
}

export async function prepareCheckout(
  payload: Payload,
  user: Customer,
  input: CheckoutInput,
) {
  if (!Array.isArray(input.items) || input.items.length === 0) {
    throw new CheckoutError("Your cart is empty.");
  }
  if (input.items.length > 50) {
    throw new CheckoutError("The cart contains too many line items.");
  }

  const slugs = [...new Set(input.items.map((item) => String(item.id).trim()))];
  const result = await payload.find({
    collection: "products",
    where: {
      and: [
        { slug: { in: slugs } },
        { isPublished: { equals: true } },
      ],
    },
    depth: 1,
    limit: slugs.length,
    overrideAccess: true,
  });
  const products = new Map(result.docs.map((product) => [product.slug, product]));

  const items = input.items.map((item) => {
    const product = products.get(String(item.id).trim());
    if (!product || product.stockStatus === "outofstock") {
      throw new CheckoutError("A product in your cart is no longer available.", 409);
    }

    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      throw new CheckoutError(`Choose a valid quantity for ${product.title}.`);
    }

    const size = requiredText(item.size, "Size", 30);
    const sizeRecord = product.detailSizes?.find((entry) => entry.label === size);
    if (!sizeRecord || sizeRecord.stock === 0) {
      throw new CheckoutError(`${product.title} is unavailable in size ${size}.`, 409);
    }
    if (typeof sizeRecord.stock === "number" && quantity > sizeRecord.stock) {
      throw new CheckoutError(
        `Only ${sizeRecord.stock} of ${product.title} is available in size ${size}.`,
        409,
      );
    }

    const price = product.price ?? product.priceMin;
    const mrp = product.originalPrice ?? price;
    const customName = item.customName?.trim().slice(0, 80);

    return {
      product: product.id,
      name: product.title,
      image: productImage(product),
      size,
      color: product.colors?.[0],
      material: product.material,
      quantity,
      price,
      mrp,
      customName: product.allowCustomName ? customName : undefined,
    };
  });

  const fullName = requiredText(input.customer?.fullName, "Full name", 120);
  const address = requiredText(input.customer?.address, "Address", 500);
  const city = requiredText(input.customer?.city, "City", 100);
  const state = requiredText(input.customer?.state, "State", 100);
  const pincode = String(input.customer?.pincode ?? "").replace(/\D/g, "");
  const phone = String(input.customer?.phone ?? user.phone ?? "")
    .replace(/\D/g, "")
    .slice(-10);
  if (pincode.length !== 6) throw new CheckoutError("Enter a valid 6-digit pincode.");
  if (phone.length !== 10) throw new CheckoutError("Enter a valid 10-digit phone number.");

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const productTotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const totalMrp = items.reduce((sum, item) => sum + item.mrp * item.quantity, 0);
  const giftWrapFee = input.giftWrap ? 20 : 0;
  const totalPrice = productTotal + giftWrapFee;

  return {
    customer: {
      fullName,
      address,
      city,
      state,
      pincode,
      phone,
      // Payment communication must go to the authenticated account, not an
      // arbitrary client-supplied address.
      email: user.email,
    },
    items,
    totals: {
      totalCount,
      totalMrp,
      totalPrice,
      shippingTotal: 0,
      discountTotal: Math.max(0, totalMrp - productTotal),
      taxTotal: 0,
    },
    giftWrap: Boolean(input.giftWrap),
    couponCode: input.couponCode?.trim().slice(0, 80) || undefined,
    paymentMethod: paymentMethod(input.paymentMethod),
  };
}

export type PreparedCheckout = Awaited<ReturnType<typeof prepareCheckout>>;

export async function createCheckoutOrder(
  payload: Payload,
  user: Customer,
  checkout: PreparedCheckout,
  payment: {
    method: "online" | "cod" | "wallet" | "netbanking" | "card";
    title: string;
    gatewayOrderId?: string;
  },
) {
  return payload.create({
    collection: "orders",
    overrideAccess: true,
    depth: 0,
    data: {
      status: payment.method === "cod" ? "confirmed" : "pending",
      currency: "INR",
      customer: user.id,
      items: checkout.items,
      ...checkout.customer,
      payment: {
        method: payment.method,
        status: "pending",
        title: payment.title,
        gatewayOrderId: payment.gatewayOrderId,
        gatewayStatus: payment.gatewayOrderId ? "CREATED" : undefined,
      },
      giftWrap: checkout.giftWrap,
      couponCode: checkout.couponCode,
      ...checkout.totals,
      refundedTotal: 0,
    },
  });
}
