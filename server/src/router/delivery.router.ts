import { Router } from "express";
import { DeliveryController } from "../controllers/delivery.contoller";
import { authMiddleware } from "../middleware/auth.middleware";

const deliveryRouter = Router();

deliveryRouter.use(authMiddleware);

deliveryRouter.get('/my', DeliveryController.getUserDeliveries);
deliveryRouter.post('/checkout', DeliveryController.checkout);

export default deliveryRouter;