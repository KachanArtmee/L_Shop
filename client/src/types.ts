export interface Product {
  id: string | number;
  title: string;
  price: number;
  isAvailable: boolean;
  description: string;
  categories: string[];
  images: { preview: string };
}

export interface User {
  id: string | number;
  name: string;
  email: string;
}

export interface CartItem {
  productId: string | number;
  quantity: number;
  product?: Product;
}