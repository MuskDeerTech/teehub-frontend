// WooCommerce API Response Types
export interface WooCommerceImage {
  id: number;
  src: string;
  name: string;
  alt: string;
}

export interface WooCommerceCategory {
  id: number;
  name: string;
  slug: string;
}

export interface WooCommerceAttribute {
  id: number;
  name: string;
  position: number;
  visible: boolean;
  variation: boolean;
  options: string[];
}

export interface WooCommerceProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  type: string;
  status: string;
  description: string;
  short_description: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  images: WooCommerceImage[];
  categories: WooCommerceCategory[];
  attributes: WooCommerceAttribute[];
  variations?: number[];
  stock_status: string;
  stock_quantity: number | null;
}

// App Product Types
export interface ProductImage {
  image: {
    url: string;
    alt?: string;
  };
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ProductAttributeValue {
  id: string;
  value: string;
}

export interface ProductAttribute {
  attribute: {
    name: string;
  };
  values: ProductAttributeValue[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  regularPrice: number;
  salePrice?: number;
  description?: string;
  images?: ProductImage[];
  categories?: ProductCategory[];
  attributes?: ProductAttribute[];
}