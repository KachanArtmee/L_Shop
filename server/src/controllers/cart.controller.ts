import { Request, Response } from "express";
import { CartService } from "../services/cart.service";

export class CartController {
    static addToCart(req: Request, res: Response) {
        try {
            const userId = res.locals.userId as string;
            const { productId, quantity } = req.body;

            if (!productId || typeof quantity !== 'number' || quantity <= 0) {
                return res.status(400).json({ success: false, message: "Invalid data" });
            }

            const updatedCart = CartService.updateCart(userId, String(productId), quantity);
            res.status(200).json({ success: true, data: updatedCart });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message || "Server Error" });
        }
    }

    static updateQuantity(req: Request, res: Response) {
        try {
            const userId = res.locals.userId as string;
            const { productId, quantity } = req.body;

            if (!productId || typeof quantity !== 'number') {
                return res.status(400).json({ success: false, message: "Invalid data" });
            }

            const updatedCart = CartService.changeQuantity(userId, String(productId), quantity);
            res.status(200).json({ success: true, data: updatedCart });
        } catch {
            res.status(500).json({ success: false, message: "Server Error" });
        }
    }

    static removeFromCart(req: Request, res: Response) {
        try {
            const userId = res.locals.userId as string;
            const { productId } = req.params;

            if (!productId) {
                return res.status(400).json({ success: false, message: "Product ID is required" });
            }

            const updatedCart = CartService.removeItem(userId, String(productId));
            res.status(200).json({ success: true, data: updatedCart });
        } catch {
            res.status(500).json({ success: false, message: "Server Error" });
        }
    }
}