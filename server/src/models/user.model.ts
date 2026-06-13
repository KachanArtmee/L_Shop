import {UserCart} from "./product.model";

export type UserRole = "user" | "admin" | "manager";

export interface RecommendationTag {
    tag: string;
    weight: number;
    lastUsedAt: string;
}

export interface UserModel {
    id: number | string;
    name: string;
    password: string;
    email: string;
    phone?: string;
    login?: string;
    role?: UserRole;
    recommendations?: RecommendationTag[];
}

export type SafeUser = Omit<UserModel, 'password'>;

export interface AuthRequest {
    login?: string;
    email?: string;
    phone?: string;
    name?: string;
    password: string;
    role?: UserRole;
    adminKey?: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    user?: SafeUser;
    cart?: UserCart;
}
