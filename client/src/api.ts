import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',  // прямой URL
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Для отладки - добавляем перехватчик
api.interceptors.request.use(request => {
  console.log('Starting Request:', request.url);
  return request;
});

api.interceptors.response.use(
  response => response,
  error => {
    console.error('Response Error:', error.config?.url, error.response?.status);
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getUser: () => api.get('/auth/getUser'),
};

export const productsAPI = {
  // ВАЖНО: используем '/product' (без s), как в бэкенде
  getAll: (params?: any) => api.get('/product', { params }),
};

export const cartAPI = {
  add: (productId: string | number, quantity: number) => 
    api.post('/cart/add', { productId, quantity }),
  updateQuantity: (productId: string | number, quantity: number) => 
    api.patch('/cart/quantity', { productId, quantity }),
  remove: (productId: string | number) => 
    api.delete(`/cart/${productId}`),
};

export const deliveryAPI = {
  checkout: (data: any) => api.post('/delivery/checkout', data),
};