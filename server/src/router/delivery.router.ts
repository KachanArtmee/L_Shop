import { Router } from "express";
import { DeliveryController } from "../controllers/delivery.contoller";

const deliveryRouter = Router();

deliveryRouter.get('/my', DeliveryController.getUserDeliveries);
deliveryRouter.post('/checkout', DeliveryController.checkout);

export default deliveryRouter;
