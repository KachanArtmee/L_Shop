import { Request, Response, NextFunction } from "express";
import { COOKIE_CONF } from "../constants/general";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const userId = req.cookies[COOKIE_CONF.name];

    if (!userId || Array.isArray(userId)) {
        return res.status(401).json({
            success: false,
            message: "Ошибка доступа: Регайся и вали "
        });
    }

    res.locals.userId = userId;

    next();
};