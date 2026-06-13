import { Router } from "express";
import { CartController } from "../controllers/cart.controller";

const router = Router();

router.post("/add", CartController.addToCart);
router.patch("/quantity", CartController.updateQuantity);
router.delete("/:productId", CartController.removeFromCart);

export default router;
