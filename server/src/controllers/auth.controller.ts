import { Request, Response } from 'express';
import { COOKIE_CONF } from "../constants/general";
import { AuthRequest } from '../models/user.model';
import { UserService } from "../services/user.service";

export class AuthController {
    static register(req: Request, res: Response) {
        try {
            const body = req.body as AuthRequest;

            if (!body.email || !body.password || !body.name) {
                res.status(400).json({ success: false, message: "Заполните имя, email и пароль" });
                return;
            }

            const result = UserService.register(body);

            if (!result.success) {
                res.status(400).json(result);
                return;
            }

            res.cookie(COOKIE_CONF.name, result.token, COOKIE_CONF);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ success: false, message: "Ошибка сервера" });
        }
    }

    static login(req: Request, res: Response) {
        try {
            const { email, login, phone, password } = req.body;
            const identifier = email || login || phone;

            if (!identifier || !password) {
                res.status(400).json({ success: false, message: "Введите логин и пароль" });
                return;
            }

            const result = UserService.login(identifier, password);
            if (!result.success) {
                res.status(401).json(result);
                return;
            }

            res.cookie(COOKIE_CONF.name, result.token, COOKIE_CONF);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ success: false, message: "Ошибка сервера" });
        }
    }

    static logout(req: Request, res: Response) {
        res.clearCookie(COOKIE_CONF.name);
        res.status(200).json({ success: true });
    }

    static getUser(req: Request, res: Response) {
        try {
            const userId = req.cookies[COOKIE_CONF.name];

            if (!userId) {
                res.status(401).json({ success: false, message: "Пользователь не авторизован" });
                return;
            }

            const result = UserService.getUser(userId);

            if (!result.success) {
                res.status(404).json(result);
                return;
            }

            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ success: false, message: "Ошибка сервера" });
        }
    }
}
