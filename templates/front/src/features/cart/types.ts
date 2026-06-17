export interface CartItem {
  productId: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
}

export interface Cart {
  id?: string;
  sessionKey: string;
  customerId?: string | null;
  items: CartItem[];
  totalCents: number;
}

export interface AddCartItemInput {
  productId: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
}
