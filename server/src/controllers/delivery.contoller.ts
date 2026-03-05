import { Request, Response } from "express";
import { DeliveryService } from "../services/delivery.service";
import { OrderRequest } from "../models/delivery.model";

export class DeliveryController {
    static getUserDeliveries(req: Request, res: Response) {
        try {
            const userId = res.locals.userId;
            const deliveries = DeliveryService.getByUserId(userId);

            res.status(200).json({
                success: true,
                data: deliveries
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Ошибка при получении доставок"
            });
        }
    }

    static checkout(req: Request, res: Response) {
        try {
            const userId = res.locals.userId;
            const { address, phone, email, captcha } = req.body as OrderRequest;

            if (!address || !phone || !email || !email.includes('@')) {
                return res.status(400).json({ success: false, message: "Fill all fields correctly" });
            }

            if (captcha !== undefined && Number(captcha) !== 4) {
                return res.status(400).json({ success: false, message: "Invalid captcha" });
            }

            const order = DeliveryService.createOrder(userId, { address, phone, email });
            res.status(200).json({ success: true, data: order });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}