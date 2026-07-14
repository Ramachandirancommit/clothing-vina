// utils/types.ts

export interface Product {
  id: string;
  product_name: string;
  product_category: string;
  price: string; // CHANGED: Only string, not string | number
  size: string;
  image: string;
  product_image: string;
  description?: string;
  rating?: number | string;
  reviews: string;
  quantity: number;
  sold: number;
  is_featured?: number | boolean;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  discount?: number;
  originalPrice?: number;
  brand?: string;
  [key: string]: any;
}

// Helper type for API response
export interface ProductsResponse {
  success: boolean;
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  error?: string;
}

// Rest of your interfaces remain the same
export interface Address {
  id: number;
  address_label: string;
  address_text: string;
  city: string;
  state: string;
  pincode: string;
  is_primary: number;
}

export interface Order {
  id: string;
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
  cart_items: any[];
}

export interface WishlistItem {
  id: number;
  product_id: number;
  product_name: string;
  product_category: string;
  size: string;
  price: number;
  product_image: string;
  added_date: string;
}

// Helper function to normalize product data
export const normalizeProduct = (product: any): Product => {
  return {
    id: product.id?.toString() || product.product_id?.toString() || "",
    product_name: product.product_name || "",
    product_category: product.product_category || "",
    price:
      typeof product.price === "string"
        ? parseFloat(product.price)
        : product.price || 0,
    size: product.size || "",
    product_image: product.product_image || product.image || "",
    description: product.description || "",
    quantity: product.quantity || 0,
    created_at: product.created_at || product.createdAt || "",
    updated_at: product.updated_at || product.updatedAt || "",
    rating: product.rating || 0,
    reviews: product.reviews || "0",
    sold: product.sold || 0,
    is_featured: product.is_featured || 0,
    // Keep original data for any other fields
    ...product,
  };
};

// Helper to check if product exists and is valid
export const isValidProduct = (product: any): boolean => {
  return (
    product && product.id && product.product_name && product.price !== undefined
  );
};
