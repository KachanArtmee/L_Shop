import {Request, Response} from 'express';
import {AuthResponse, UserModel} from '../models/user.model';
import {COOKIE_CONF} from "../constants/general";
import {UserService} from "../services/user.service";

export class AuthController {
    static register(req: Request, res: Response) {
        try {
            const body: UserModel = req.body;
            const result = UserService.register(body);

            if (!result.success) {
                res.status(400).json(result);
                return;
            }

            res.cookie(COOKIE_CONF.name, result.token, {
                httpOnly: COOKIE_CONF.httpOnly,
                maxAge: COOKIE_CONF.maxAge,
                secure: COOKIE_CONF.secure,
                sameSite: COOKIE_CONF.sameSite as any,
            });

            res.status(200).json({
                success: true,
                message: 'Регистрация успешна',
                user: result.user
            });
        } catch (error) {
            res.status(500).json({ success: false });
        }
    }

    static login(req: Request, res: Response) {
        try {
            const { email, login, phone, password } = req.body;
            const identifier = email || login || phone;

            const result = UserService.login(identifier, password);
            if (!result.success) {
                res.status(401).json(result);
                return;
            }

            res.cookie(COOKIE_CONF.name, result.token, {
                httpOnly: COOKIE_CONF.httpOnly,
                maxAge: COOKIE_CONF.maxAge,
                secure: COOKIE_CONF.secure,
                sameSite: COOKIE_CONF.sameSite as any,
            });

            res.status(200).json({
                success: true,
                user: result.user
            });
        } catch (error) {
            res.status(500).json({ success: false });
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
                res.status(401).json({ success: false });
                return;
            }

            const result = UserService.getUser(userId);

            if (!result.success) {
                res.status(404).json(result);
                return;
            }

            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ success: false });
        }
    }
}