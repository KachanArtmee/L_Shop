import { UserModel} from '../models/user.model';
import fs from 'fs';
import {DB_PATH} from "../constants/general";
import {UserCart, UserDelivery} from "../models/product.model";

export class UserService {
    static register(user: UserModel) {
        try {
            const fileData = fs.readFileSync(DB_PATH.users, 'utf-8');
            const users : UserModel[] = JSON.parse(fileData);

            const userEx = users.find( u => u.email === user.email );
            if(userEx) {
                return {
                    success : false,
                    message : 'Такой пользователь есть, рег не нужна'
                };
            }

            const newUser : UserModel =  {
                ...user,
                id : Date.now()
            };
            users.push(newUser);

            fs.writeFileSync(DB_PATH.users, JSON.stringify(users, null, 2), 'utf-8');

            const {password, ... userWithoutPassword} = newUser;

            return {
                success : true,
                message : 'Cool',
                token : 'jwt_token',
                user : userWithoutPassword
            }
        }catch(error) {
            return {success: 'ne success'}
        }
    }

    static login(email : string, password : string) {
        try {
            const fileData = fs.readFileSync(DB_PATH.users, 'utf-8');
            const users : UserModel[] = JSON.parse(fileData);

            const user = users.find( u => u.email === email );
            if(!user) {
                return {success: 'ne success',
                message: 'нет таких'
                };
            }

            if(user.password !== password) {
                return {success: 'ne success',
                message: 'Пароль не тот'
                };
            }

            const {password: userPw, ... userWithoutPassword} = user;

            const token = 'jwt_token_no_ne_tot';

            return {
                success : true,
                message: 'Вход был',
                token : token,
                user : userWithoutPassword
            }
        }catch {
            return {success: 'ne success',
            message : 'Не'
            }
        }
    }

    static logout() {
        return {
            success : true,
            message: 'Мы вышли(честн)'
        };
    }

    static getUser(id: string) {
        try {
            const users: UserModel[] = JSON.parse(fs.readFileSync(DB_PATH.users, 'utf-8'));

            const carts = JSON.parse(fs.readFileSync(DB_PATH.carts, 'utf-8')) as UserCart[];
            const deliveries = JSON.parse(fs.readFileSync(DB_PATH.deliveries, 'utf-8')) as UserDelivery[];

            const user = users.find(u => String(u.id) === String(id));

            if (!user) {
                return { success: false, message: 'Ehhh' };
            }

            const userCart = carts.find(c => String(c.userId) === String(id)) || null;
            const userDeliveries = deliveries.find(d => String(d.userId) === String(id)) || null;

            const { password, ...userWithoutPassword } = user;

            return {
                success: true,
                user: userWithoutPassword,
                cart: userCart,
                deliveries: userDeliveries
            };
        } catch (error) {

            return { success: false, message: 'анлак' };
        }
    }

}