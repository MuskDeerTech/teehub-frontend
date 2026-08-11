export type WooImage = {
  id: number;
  src: string;
  name?: string;
  alt?: string;
};

export type WooCategory = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: WooImage | null;
  menu_order?: number;
};

export type WooAttribute = {
  id?: number;
  name: string;
  option?: string;
  options?: string[];
};

export type WooVariation = {
  id: number;
  sku?: string;
  price?: string;
  regular_price?: string;
  sale_price?: string;
  stock_quantity?: number | null;
  stock_status?: "instock" | "outofstock" | "onbackorder";
  attributes?: WooAttribute[];
  image?: WooImage | null;
};

export type WooProduct = {
  id: number;
  name: string;
  slug: string;
  date_created?: string;
  date_modified?: string;
  status: "draft" | "pending" | "private" | "publish" | "trash";
  type: "simple" | "grouped" | "external" | "variable";
  sku?: string;
  description?: string;
  short_description?: string;
  price?: string;
  regular_price?: string;
  sale_price?: string;
  stock_quantity?: number | null;
  stock_status?: "instock" | "outofstock" | "onbackorder";
  categories?: Array<{ id: number; name: string; slug: string }>;
  images?: WooImage[];
  attributes?: WooAttribute[];
  variations?: number[];
  menu_order?: number;
  meta_data?: Array<{ id?: number; key: string; value: unknown }>;
};

export type WooAddress = {
  first_name?: string;
  last_name?: string;
  company?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  email?: string;
  phone?: string;
};

export type WooCustomer = {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  date_created?: string;
  date_modified?: string;
  orders_count?: number;
  total_spent?: string;
  billing?: WooAddress;
  shipping?: WooAddress;
  meta_data?: Array<{ id?: number; key: string; value: unknown }>;
};

export type WooLineItem = {
  id: number;
  name: string;
  product_id: number;
  variation_id?: number;
  quantity: number;
  subtotal?: string;
  total?: string;
  image?: WooImage | null;
  sku?: string;
  meta_data?: Array<{
    id?: number;
    key: string;
    display_key?: string;
    value: unknown;
    display_value?: string;
  }>;
};

export type WooOrder = {
  id: number;
  number?: string;
  status: string;
  currency?: string;
  date_created?: string;
  customer_id?: number;
  customer_note?: string;
  billing?: WooAddress;
  shipping?: WooAddress;
  payment_method?: string;
  payment_method_title?: string;
  transaction_id?: string;
  date_paid?: string | null;
  date_completed?: string | null;
  total?: string;
  discount_total?: string;
  shipping_total?: string;
  total_tax?: string;
  line_items?: WooLineItem[];
  coupon_lines?: Array<{ code?: string }>;
  refunds?: Array<{ id: number; total?: string; reason?: string }>;
  meta_data?: Array<{ id?: number; key: string; value: unknown }>;
};

export type SyncAction = "created" | "updated" | "skipped";

export type SyncReport = {
  created: number;
  updated: number;
  skipped: number;
  failed: number;
  errors: Array<{ type: string; woocommerceId?: number; message: string }>;
};
