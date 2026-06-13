import { Request, Response } from "express";
import { ProductService } from "../services/product.service";

export class ProductController {
    static getProducts(req: Request, res: Response) {
        try {
            const { search, sort, category, isAvailable, maxPrice } = req.query;
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
}