import { UserModel } from '../models/user.model';
import fs from 'fs';
import { DB_PATH } from "../constants/general";
import { UserCart, UserDelivery } from "../models/product.model";

export class UserService {
    static register(user: UserModel) {
        try {
            const fileData = fs.readFileSync(DB_PATH.users, 'utf-8');
            const users: UserModel[] = JSON.parse(fileData || '[]');

            const userEx = users.find(u => u.email === user.email);
            if (userEx) {
                return {
                    success: false,
                    message: 'Такой пользователь есть'
                };
            }

            const newUser: UserModel = {
                ...user,
                id: Date.now()
            };
            users.push(newUser);

            fs.writeFileSync(DB_PATH.users, JSON.stringify(users, null, 2), 'utf-8');

            const { password, ...userWithoutPassword } = newUser;

            return {
                success: true,
                message: 'Cool',
                token: String(newUser.id),
                user: userWithoutPassword
            };
        } catch (error) {
            return { success: false };
        }
    }

    static login(email: string, password: string) {
        try {
            const fileData = fs.readFileSync(DB_PATH.users, 'utf-8');
            const users: UserModel[] = JSON.parse(fileData || '[]');

            const user = users.find(u => u.email === email);
            if (!user || user.password !== password) {
                return { success: false, message: 'Ошибка входа' };
            }

            const { password: userPw, ...userWithoutPassword } = user;

            return {
                success: true,
                message: 'Вход был',
                token: String(user.id),
                user: userWithoutPassword
            };
        } catch {
            return { success: false };
        }
    }

    static logout() {
        return { success: true };
    }

    static getUser(id: string) {
        try {
            const users: UserModel[] = JSON.parse(fs.readFileSync(DB_PATH.users, 'utf-8') || '[]');
            const carts: UserCart[] = JSON.parse(fs.readFileSync(DB_PATH.carts, 'utf-8') || '[]');
            const deliveries: UserDelivery[] = JSON.parse(fs.readFileSync(DB_PATH.deliveries, 'utf-8') || '[]');

            const user = users.find(u => String(u.id) === String(id));

            if (!user) {
                return { success: false };
            }

            const userCart = carts.find(c => String(c.userId) === String(id)) || null;
            const userDeliveries = deliveries.filter(d => String(d.userId) === String(id));

            const { password, ...userWithoutPassword } = user;

            return {
                success: true,
                user: userWithoutPassword,
                cart: userCart,
                deliveries: userDeliveries
            };
        } catch (error) {
            return { success: false };
        }
    }
}