import fs from 'fs';
import { DB_PATH } from "../constants/general";
import { CartService } from "./cart.service";
import { UserDelivery, Basket } from "../models/product.model";

export class DeliveryService {
    static getDeliveries(): any[] {
        try {
            if (!fs.existsSync(DB_PATH.deliveries)) return [];
            let data = fs.readFileSync(DB_PATH.deliveries, "utf8");
            data = data.replace(/^\uFEFF/, '');
            return JSON.parse(data || '[]');
        } catch {
            return [];
        }
    }

    static getByUserId(userId: string | number): any[] {
        const allDeliveries = this.getDeliveries();
        return allDeliveries.filter(d => String(d.userId) === String(userId));
    }

    static createOrder(userId: string | number, orderData: { address: any, phone: string, email: string }) {
        const carts = CartService.getCarts();
        const userCart = carts.find(c => String(c.userId) === String(userId));

        if (!userCart || userCart.basket.length === 0) {
            throw new Error("Cart is empty");
        }

        const deliveries = this.getDeliveries();

        const newOrder = {
            id: Date.now(),
            userId,
            ...orderData,
            items: userCart.basket.map(item => ({
                productId: item.products.id,
                title: item.products.title,
                count: item.count,
                price: item.products.price
            })),
            status: "In Progress",
            createdAt: new Date().toISOString()
        };

        deliveries.push(newOrder);
        fs.writeFileSync(DB_PATH.deliveries, JSON.stringify(deliveries, null, 2));

        this.clearCart(userId);

        return newOrder;
    }

    private static clearCart(userId: string | number): void {
        const carts = CartService.getCarts();
        const updatedCarts = carts.map(c => {
            if (String(c.userId) === String(userId)) {
                return { ...c, basket: [] };
            }
            return c;
        });
        fs.writeFileSync(DB_PATH.carts, JSON.stringify(updatedCarts, null, 2));
    }
}