// utils/types.ts

export interface Product {
  id: string;
  product_name: string;
  product_category: string;
  size: string;
  price: string;
  quantity: number;
  description: string;
  image: string;
  sold?: number;
  rating?: number;
  reviews?: number;
  createdAt?: string;
}

export interface WishlistItem {
  id: number;
  product_id: number;
  product_name: string;
  product_category: string;
  price: number | string;
  product_image: string;
  created_at?: string;
}

export interface Address {
  id: number;
  address_label: string;
  address_text: string;
  city: string;
  state: string;
  pincode: string;
  is_primary: number;
}

export interface OrderItem {
  product_id: number;
  product_name: string;
  product_category: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: number;
  order_number: string;
  cust_id: string;
  customer_name: string;
  customer_phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  total_amount: number;
  delivery_fee: number;
  tax_amount: number;
  grand_total: number;
  item_count: number;
  payment_method: string;
  order_date: string;
  status: string;
  cart_items: OrderItem[];
}
