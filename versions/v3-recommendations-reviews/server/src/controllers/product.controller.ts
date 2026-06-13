import { Request, Response } from "express";
import { ProductReview } from "../models/product.model";
import { ProductService } from "../services/product.service";
import { UserService } from "../services/user.service";

export class ProductController {
    static getProducts(req: Request, res: Response) {
        try {
            const { search, sort, category, isAvailable, maxPrice } = req.query;
            const userId = res.locals.userId as string | undefined;
            let products = ProductService.getAllProducts();

            if (search) {
                products = ProductService.filterBySearch(products, search as string);
            }

            if (category) {
                products = ProductService.filterByCategory(products, category as string);
            }

            if (isAvailable !== undefined) {
                products = ProductService.filterByAvailability(products, isAvailable as string);
            }

            if (maxPrice) {
                products = ProductService.filterByPrice(products, maxPrice as string);
            }

            if (sort) {
                products = ProductService.sortByPrice(products, sort as string);
            }

            products = ProductService.applyRecommendations(products, UserService.getActiveRecommendations(userId));

            res.status(200).json({
                success: true,
                data: products
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Ошибка сервера"
            });
        }
    }

    static getProduct(req: Request, res: Response) {
        const productId = String(req.params.productId);
        const product = ProductService.getProductById(productId);

        if (!product) {
            res.status(404).json({ success: false, message: "Товар не найден" });
            return;
        }

        res.status(200).json({ success: true, data: product });
    }

    static createProduct(req: Request, res: Response) {
        try {
            const product = ProductService.createProduct(req.body);
            res.status(201).json({ success: true, data: product });
        } catch (error) {
            res.status(400).json({ success: false, message: "Не удалось создать товар" });
        }
    }

    static updateProduct(req: Request, res: Response) {
        try {
            const productId = String(req.params.productId);
            const product = ProductService.updateProduct(productId, req.body);

            if (!product) {
                res.status(404).json({ success: false, message: "Товар не найден" });
                return;
            }

            res.status(200).json({ success: true, data: product });
        } catch (error) {
            res.status(400).json({ success: false, message: "Не удалось обновить товар" });
        }
    }

    static likeProduct(req: Request, res: Response) {
        try {
            const userId = res.locals.userId as string;
            const productId = String(req.params.productId);
            const product = ProductService.getProductById(productId);

            if (!product) {
                res.status(404).json({ success: false, message: "Товар не найден" });
                return;
            }

            const recommendations = UserService.addRecommendationTags(userId, product.tags || product.categories || []);
            res.status(200).json({ success: true, data: recommendations });
        } catch (error) {
            res.status(400).json({ success: false, message: "Не удалось сохранить рекомендацию" });
        }
    }

    static addReview(req: Request, res: Response) {
        try {
            const userId = res.locals.userId as string;
            const productId = String(req.params.productId);
            const user = UserService.getUserRecord(userId);
            const rating = Number(req.body.rating);
            const comment = String(req.body.comment || "").trim();

            if (!user) {
                res.status(401).json({ success: false, message: "Пользователь не найден" });
                return;
            }

            if (!Number.isInteger(rating) || rating < 1 || rating > 5 || comment.length < 2) {
                res.status(400).json({ success: false, message: "Оценка должна быть от 1 до 5, комментарий обязателен" });
                return;
            }

            const review: ProductReview = {
                id: `${userId}-${productId}`,
                userId,
                userName: user.name,
                rating,
                comment,
                createdAt: new Date().toISOString(),
            };
            const product = ProductService.addReview(productId, review);

            if (!product) {
                res.status(404).json({ success: false, message: "Товар не найден" });
                return;
            }

            res.status(200).json({ success: true, data: product });
        } catch (error) {
            res.status(400).json({ success: false, message: "Не удалось сохранить отзыв" });
        }
    }
}
