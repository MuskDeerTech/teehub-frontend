export interface Product {
  id: string;
  name: string;
  slug: string;
  regularPrice?: number;
  salePrice?: number;
  stockQuantity?: number;

  images?: {
    image: {
      url: string;
      alt?: string;
    };
  }[];

  attributes?: {
    attribute: { id: string; name: string };
    values: { id: string; value: string }[];
  }[];

  variations?: {
    attributes: string[];
    sku: string;
    price: number;
    stock: number;
    image?: { url: string; alt?: string };
  }[];

  categories?: {
    id: string;
    name: string;
  }[];

  // Lexical-style rich text
  description?:
    | string
    | {
        root: {
          children?: {
            children?: { text?: string }[];
          }[];
        };
      };

  [key: string]: unknown;
}
