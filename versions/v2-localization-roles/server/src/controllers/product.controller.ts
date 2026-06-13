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
                message: "РћС€РёР±РєР° СЃРµСЂРІРµСЂР°"
            });
        }
    }

    static getProduct(req: Request, res: Response) {
        const productId = String(req.params.productId);
        const product = ProductService.getProductById(productId);

        if (!product) {
            res.status(404).json({ success: false, message: "РўРѕРІР°СЂ РЅРµ РЅР°Р№РґРµРЅ" });
            return;
        }

        res.status(200).json({ success: true, data: product });
    }

    static createProduct(req: Request, res: Response) {
        try {
            const product = ProductService.createProduct(req.body);
            res.status(201).json({ success: true, data: product });
        } catch (error) {
            res.status(400).json({ success: false, message: "РќРµ СѓРґР°Р»РѕСЃСЊ СЃРѕР·РґР°С‚СЊ С‚РѕРІР°СЂ" });
        }
    }

    static updateProduct(req: Request, res: Response) {
        try {
            const productId = String(req.params.productId);
            const product = ProductService.updateProduct(productId, req.body);

            if (!product) {
                res.status(404).json({ success: false, message: "РўРѕРІР°СЂ РЅРµ РЅР°Р№РґРµРЅ" });
                return;
            }

            res.status(200).json({ success: true, data: product });
        } catch (error) {
            res.status(400).json({ success: false, message: "РќРµ СѓРґР°Р»РѕСЃСЊ РѕР±РЅРѕРІРёС‚СЊ С‚РѕРІР°СЂ" });
        }
    }
}

