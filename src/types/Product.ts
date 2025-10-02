export interface Product {
  id: string;
  name: string;
  slug: string; // required
  regularPrice: number;
  salePrice?: number;
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

  categories?: {
    id: string;
    name: string;
  }[];
  description?: string;
  [key: string]: unknown; // Allow additional properties
}
