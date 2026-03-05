import { BasketProduct } from "./product.model";

export interface OrderItem {
    productId: string | number;
    title: string;
    count: number;
    price: number;
}

export interface Order {
    id: number;
    userId: string | number;
    address: string;
    phone: string;
    email: string;
    items: OrderItem[];
    status: string;
    createdAt: string;
}

export interface OrderRequest {
    address: string;
    phone: string;
    email: string;
    captcha?: number;
}