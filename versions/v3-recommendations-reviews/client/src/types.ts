export type LocaleCode = 'ru' | 'en';
export type UserRole = 'user' | 'admin' | 'manager';

export interface ProductTranslation {
  title?: string;
  description?: string;
  categories?: string[];
}

export interface ProductReview {
  id: string | number;
  userId: string | number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Product {
  id: string | number;
  title: string;
  price: number;
  isAvailable: boolean;
  description: string;
  categories: string[];
  tags?: string[];
  translations?: Partial<Record<LocaleCode, ProductTranslation>>;
  reviews?: ProductReview[];
  averageRating?: number;
  isRecommended?: boolean;
  images: { preview: string; gallery?: string[] };
}

export interface User {
  id: string | number;
  name: string;
  email: string;
  role?: UserRole;
}

export interface CartItem {
  productId: string | number;
  quantity: number;
  product?: Product;
}

export interface ProductFormData {
  id?: string | number;
  title: string;
  description: string;
  price: number;
  isAvailable: boolean;
  categories: string[];
  tags: string[];
  images: { preview: string };
  translations?: Partial<Record<LocaleCode, ProductTranslation>>;
}

export interface CheckoutRequest {
  address: string;
  phone: string;
  email: string;
  captcha?: number;
}
