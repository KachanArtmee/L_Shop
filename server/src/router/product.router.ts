import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
import { authMiddleware, optionalAuthMiddleware, requireRole } from "../middleware/auth.middleware";

const productRouter = Router();

productRouter.get('/', optionalAuthMiddleware, ProductController.getProducts);
productRouter.get('/:productId', ProductController.getProduct);
productRouter.post('/', authMiddleware, requireRole(["admin", "manager"]), ProductController.createProduct);
productRouter.put('/:productId', authMiddleware, requireRole(["admin", "manager"]), ProductController.updateProduct);

export default productRouter;
