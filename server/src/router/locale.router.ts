import { Router } from "express";
import { LocaleController } from "../controllers/locale.controller";

const localeRouter = Router();

localeRouter.get("/", LocaleController.getLocale);
localeRouter.post("/", LocaleController.setLocale);
localeRouter.delete("/", LocaleController.clearLocale);

export default localeRouter;
