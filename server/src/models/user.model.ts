import {UserCart} from "./product.model";

export interface UserModel {
    id: number | string;
    name: string;
    password: string;
    email?: string;
    phone?: string;
    login?: string;
}

export interface AuthRequest {
    login?: string;
    email?: string;
    phone?: string;
    name?: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    user?: Omit<UserModel, 'password'>;
    cart?: UserCart;
}
