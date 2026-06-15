export interface CartItem {
  id: string;
  name: string;
  image: string;
  size: string;
  quantity: number;
  customName?: string;
  price: number;
  mrp: number;
}