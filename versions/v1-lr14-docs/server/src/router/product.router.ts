import {Router} from "express";
import {ProductController} from "../controllers/product.controller";

const productRouter = Router();

productRouter.get('/', ProductController.getProducts);
export default productRouter;