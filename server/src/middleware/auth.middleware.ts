import { Request, Response, NextFunction } from "express";
import { COOKIE_CONF } from "../constants/general";
import { UserRole } from "../models/user.model";
import { UserService } from "../services/user.service";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const userId = req.cookies[COOKIE_CONF.name];

    if (!userId || Array.isArray(userId)) {
        return res.status(401).json({
            success: false,
            message: "Требуется вход в аккаунт"
        });
    }

    res.locals.userId = userId;
    next();
};

export const optionalAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const userId = req.cookies[COOKIE_CONF.name];

    if (userId && !Array.isArray(userId)) {
        res.locals.userId = userId;
    }

    next();
};

export const requireRole = (roles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const userId = res.locals.userId;
        const user = UserService.getUserRecord(userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Пользователь не найден"
            });
        }

        const role = user.role || "user";

        if (!roles.includes(role)) {
            return res.status(403).json({
                success: false,
                message: "Недостаточно прав"
            });
        }

        res.locals.user = user;
        next();
    };
};
