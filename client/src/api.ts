import axios from 'axios';
import { CheckoutRequest, LocaleCode, ProductFormData } from './types';

const isDevelopment = process.env.NODE_ENV === 'development';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

if (isDevelopment) {
  api.interceptors.request.use((request) => {
    console.log('API Request:', request.method?.toUpperCase(), request.url);
    return request;
  });

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('API Error:', error.config?.url, error.response?.status);
      return Promise.reject(error);
    }
  );
}

export const authAPI = {
  register: (data: { name: string; email: string; password: string }) => api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getUser: () => api.get('/auth/getUser'),
};

export const productsAPI = {
  getAll: (params?: Record<string, string | number | boolean>) =>
    api.get('/product', { params }),
  create: (data: ProductFormData) => api.post('/product', data),
  update: (productId: string | number, data: ProductFormData) => api.put(`/product/${productId}`, data),
  like: (productId: string | number) => api.post(`/product/${productId}/like`),
  review: (productId: string | number, data: { rating: number; comment: string }) =>
    api.post(`/product/${productId}/reviews`, data),
};

export const cartAPI = {
  add: (productId: string | number, quantity: number) =>
    api.post('/cart/add', { productId, quantity }),
  updateQuantity: (productId: string | number, quantity: number) =>
    api.patch('/cart/quantity', { productId, quantity }),
  remove: (productId: string | number) => api.delete(`/cart/${productId}`),
};

export const deliveryAPI = {
  checkout: (data: CheckoutRequest) => api.post('/delivery/checkout', data),
};

export const sessionAPI = {
  getLocale: () => api.get<{ success: boolean; locale: LocaleCode | null; suggestedLocale: LocaleCode }>('/locale'),
  setLocale: (locale: LocaleCode) => api.post('/locale', { locale }),
  clearLocale: () => api.delete('/locale'),
};

export default api;
