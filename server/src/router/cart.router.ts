import { Router } from "express";
import { CartController } from "../controllers/cart.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/add", authMiddleware, CartController.addToCart);
router.patch("/quantity", authMiddleware, CartController.updateQuantity);
router.delete("/:productId", authMiddleware, CartController.removeFromCart);

export default router;