import fs from 'fs';
import { DB_PATH } from "../constants/general";
import { Basket, Product } from "../models/product.model";

export class CartService {
    static getCarts(): Basket[] {
        try {
            if (!fs.existsSync(DB_PATH.carts)) return [];
            let data = fs.readFileSync(DB_PATH.carts, "utf8");
            data = data.replace(/^\uFEFF/, '');
            return JSON.parse(data || '[]');
        } catch { return []; }
    }

    static getProducts(): Product[] {
        try {
            if (!fs.existsSync(DB_PATH.products)) return [];
            let data = fs.readFileSync(DB_PATH.products, "utf8");
            data = data.replace(/^\uFEFF/, '');
            return JSON.parse(data || '[]');
        } catch { return []; }
    }

    private static saveCarts(carts: Basket[]): void {
        fs.writeFileSync(DB_PATH.carts, JSON.stringify(carts, null, 2));
    }

    static updateCart(userId: string | number, productId: string | number, quantity: number): Basket {
        const carts = this.getCarts();
        const products = this.getProducts();

        let userCart = carts.find(c => String(c.userId) === String(userId));

        if (!userCart) {
            userCart = { id: Date.now(), userId, basket: [] };
            carts.push(userCart);
        }

        const productData = products.find(p => String(p.id) === String(productId));
        if (!productData) throw new Error("Product not found");

        const existingItem = userCart.basket.find(item => String(item.products.id) === String(productId));

        if (existingItem) {
            existingItem.count += quantity;
        } else {
            userCart.basket.push({ count: quantity, products: productData });
        }

        this.saveCarts(carts);
        return userCart;
    }

    static changeQuantity(userId: string | number, productId: string | number, newCount: number): Basket | undefined {
        const carts = this.getCarts();
        const userCart = carts.find(c => String(c.userId) === String(userId));

        if (userCart) {
            const itemIndex = userCart.basket.findIndex(i => String(i.products.id) === String(productId));
            if (itemIndex !== -1) {
                if (newCount <= 0) {
                    userCart.basket.splice(itemIndex, 1);
                } else {
                    userCart.basket[itemIndex].count = newCount;
                }
                this.saveCarts(carts);
            }
        }
        return userCart;
    }

    static removeItem(userId: string | number, productId: string | number): Basket | undefined {
        const carts = this.getCarts();
        const userCart = carts.find(c => String(c.userId) === String(userId));
        if (userCart) {
            userCart.basket = userCart.basket.filter(i => String(i.products.id) !== String(productId));
            this.saveCarts(carts);
        }
        return userCart;
    }
}