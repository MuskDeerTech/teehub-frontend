export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

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

  reviews?: Review[];

  meta?: {
    description?: string;
    title?: string;
  };

  sizes?: string[];
  description?:
    | string
    | {
        root: {
          children?: {
            children?: { text?: string }[];
          }[];
        };
      };
}

