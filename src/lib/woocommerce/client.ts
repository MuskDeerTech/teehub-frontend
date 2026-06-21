import type {
  WooCategory,
  WooCustomer,
  WooOrder,
  WooProduct,
  WooVariation,
} from "./types";

type QueryValue = string | number | boolean | undefined;
export type WooPage<T> = {
  data: T[];
  page: number;
  totalPages: number;
};

export class WooCommerceClient {
  private readonly baseUrl: string;
  private readonly authorization: string;

  constructor({
    url,
    consumerKey,
    consumerSecret,
  }: {
    url: string;
    consumerKey: string;
    consumerSecret: string;
  }) {
    this.baseUrl = `${url.replace(/\/+$/, "")}/wp-json/wc/v3`;
    this.authorization = `Basic ${Buffer.from(
      `${consumerKey}:${consumerSecret}`,
    ).toString("base64")}`;
  }

  static fromEnv() {
    const url = process.env.WOOCOMMERCE_URL;
    const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
    const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;
    if (!url || !consumerKey || !consumerSecret) {
      throw new Error(
        "Missing WOOCOMMERCE_URL, WOOCOMMERCE_CONSUMER_KEY, or WOOCOMMERCE_CONSUMER_SECRET.",
      );
    }
    return new WooCommerceClient({ url, consumerKey, consumerSecret });
  }

  private async request<T>(
    path: string,
    query: Record<string, QueryValue> = {},
  ): Promise<{ data: T; totalPages: number }> {
    const url = new URL(`${this.baseUrl}/${path.replace(/^\/+/, "")}`);
    for (const [key, value] of Object.entries(query)) {
      // Skip blank values too, not just undefined: an env var like
      // WOOCOMMERCE_SYNC_AFTER= reads as "" and would send e.g.
      // `modified_after=`, which WooCommerce rejects as an invalid date.
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }

    let lastError = "";
    for (let attempt = 1; attempt <= 5; attempt += 1) {
      const response = await fetch(url, {
        headers: {
          Authorization: this.authorization,
          Accept: "application/json",
        },
        cache: "no-store",
      });
      if (response.ok) {
        return {
          data: (await response.json()) as T,
          totalPages: Number(response.headers.get("x-wp-totalpages") || 1),
        };
      }

      const body = await response.text();
      lastError = `WooCommerce ${response.status} for ${url.pathname}${url.search}: ${body.slice(0, 500)}`;
      if (![429, 500, 502, 503, 504].includes(response.status) || attempt === 5) {
        throw new Error(lastError);
      }
      await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }
    throw new Error(lastError);
  }

  async all<T>(
    path: string,
    query: Record<string, QueryValue> = {},
  ): Promise<T[]> {
    const perPage = 100;
    const first = await this.request<T[]>(path, {
      ...query,
      per_page: perPage,
      page: 1,
    });
    const records = [...first.data];
    for (let page = 2; page <= first.totalPages; page += 1) {
      const next = await this.request<T[]>(path, {
        ...query,
        per_page: perPage,
        page,
      });
      records.push(...next.data);
    }
    return records;
  }

  async page<T>(
    path: string,
    page: number,
    query: Record<string, QueryValue> = {},
  ): Promise<WooPage<T>> {
    const result = await this.request<T[]>(path, {
      ...query,
      per_page: 100,
      page,
    });
    return { ...result, page };
  }

  productPage(page: number) {
    return this.page<WooProduct>("products", page, { status: "any" });
  }

  customerPage(page: number) {
    return this.page<WooCustomer>("customers", page, { role: "all" });
  }

  orderPage(page: number, modifiedAfter?: string) {
    return this.page<WooOrder>("orders", page, {
      status: "any",
      modified_after: modifiedAfter,
    });
  }

  async count(path: string, query: Record<string, QueryValue> = {}) {
    const result = await this.request<unknown[]>(path, {
      ...query,
      per_page: 1,
      page: 1,
    });
    return result.totalPages;
  }

  getCategories() {
    return this.all<WooCategory>("products/categories", {
      hide_empty: false,
    });
  }

  getProducts() {
    return this.all<WooProduct>("products", { status: "any" });
  }

  getVariations(productId: number) {
    return this.all<WooVariation>(`products/${productId}/variations`, {
      status: "any",
    });
  }

  getCustomers() {
    return this.all<WooCustomer>("customers", { role: "all" });
  }

  countCustomers() {
    return this.count("customers", { role: "all" });
  }

  getOrders(modifiedAfter?: string) {
    return this.all<WooOrder>("orders", {
      status: "any",
      modified_after: modifiedAfter,
    });
  }

  countOrders(modifiedAfter?: string) {
    return this.count("orders", {
      status: "any",
      modified_after: modifiedAfter,
    });
  }

  async getOrder(orderId: number) {
    return (await this.request<WooOrder>(`orders/${orderId}`)).data;
  }

  async getCustomer(customerId: number) {
    return (await this.request<WooCustomer>(`customers/${customerId}`)).data;
  }
}
