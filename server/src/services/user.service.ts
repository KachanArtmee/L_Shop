import { DB_PATH } from "../constants/general";
import { UserCart, UserDelivery } from "../models/product.model";
import { AuthRequest, RecommendationTag, SafeUser, UserModel, UserRole } from "../models/user.model";
import { readJsonFile, writeJsonFile } from "../utils/file-db";
import { getActiveRecommendationTags, mergeRecommendationTags } from "../utils/recommendations";

export class UserService {
    /**
     * Loads all registered users from the JSON storage.
     *
     * @returns User records, including private fields for server-only checks.
     */
    static getUsers(): UserModel[] {
        return readJsonFile<UserModel[]>(DB_PATH.users, []);
    }

    /**
     * Persists all registered users in JSON storage.
     *
     * @param users Full user collection.
     */
    static saveUsers(users: UserModel[]): void {
        writeJsonFile(DB_PATH.users, users);
    }

    /**
     * Removes the password from a user before returning it to the client.
     *
     * @param user Internal user record.
     * @returns Public user payload.
     */
    static toSafeUser(user: UserModel): SafeUser {
        const { password, ...userWithoutPassword } = user;
        return {
            ...userWithoutPassword,
            role: user.role || "user",
            recommendations: user.recommendations || [],
        };
    }

    /**
     * Registers a regular user. Admin registration requires an explicit admin key.
     *
     * @param request Registration payload.
     * @returns Auth result with a token-compatible user id.
     */
    static register(request: AuthRequest) {
        try {
            const users = this.getUsers();
            const userEx = users.find(u => u.email === request.email);

            if (userEx) {
                return {
                    success: false,
                    message: "Такой пользователь уже существует"
                };
            }

            const requestedRole = request.role || "user";
            const role: UserRole =
                requestedRole === "admin" && request.adminKey === (process.env.ADMIN_REGISTER_KEY || "owner-demo-key")
                    ? "admin"
                    : "user";

            const newUser: UserModel = {
                id: Date.now(),
                name: request.name || request.login || request.email || "Пользователь",
                email: request.email || "",
                login: request.login,
                phone: request.phone,
                password: request.password,
                role,
                recommendations: [],
            };

            users.push(newUser);
            this.saveUsers(users);

            return {
                success: true,
                message: "Регистрация успешна",
                token: String(newUser.id),
                user: this.toSafeUser(newUser)
            };
        } catch (error) {
            return { success: false, message: "Ошибка регистрации" };
        }
    }

    /**
     * Authenticates a user by email, login, or phone.
     *
     * @param identifier Email, login, or phone.
     * @param password Plain password from the educational JSON storage.
     * @returns Auth result with a token-compatible user id.
     */
    static login(identifier: string, password: string) {
        try {
            const users = this.getUsers();
            const user = users.find(u =>
                u.email === identifier ||
                u.login === identifier ||
                u.phone === identifier
            );

            if (!user || user.password !== password) {
                return { success: false, message: "Неверный логин или пароль" };
            }

            return {
                success: true,
                message: "Вход выполнен",
                token: String(user.id),
                user: this.toSafeUser(user)
            };
        } catch {
            return { success: false, message: "Ошибка входа" };
        }
    }

    static logout() {
        return { success: true };
    }

    /**
     * Finds a user by id without removing private fields.
     *
     * @param id User id from cookie/session.
     * @returns User record or undefined.
     */
    static getUserRecord(id: string | number): UserModel | undefined {
        return this.getUsers().find(u => String(u.id) === String(id));
    }

    /**
     * Returns public profile plus cart and delivery information.
     *
     * @param id User id from cookie/session.
     * @returns User profile response.
     */
    static getUser(id: string) {
        try {
            const user = this.getUserRecord(id);

            if (!user) {
                return { success: false, message: "Пользователь не найден" };
            }

            const carts = readJsonFile<UserCart[]>(DB_PATH.carts, []);
            const deliveries = readJsonFile<UserDelivery[]>(DB_PATH.deliveries, []);
            const userCart = carts.find(c => String(c.userId) === String(id)) || null;
            const userDeliveries = deliveries.filter(d => String(d.userId) === String(id));

            return {
                success: true,
                user: this.toSafeUser(user),
                cart: userCart,
                deliveries: userDeliveries
            };
        } catch (error) {
            return { success: false, message: "Ошибка получения пользователя" };
        }
    }

    /**
     * Updates recommendation tags after a user likes a product.
     *
     * @param userId User id from cookie/session.
     * @param tags Hidden product tags.
     * @returns Updated user recommendation profile.
     */
    static addRecommendationTags(userId: string | number, tags: string[]): RecommendationTag[] {
        const users = this.getUsers();
        const userIndex = users.findIndex(user => String(user.id) === String(userId));

        if (userIndex === -1) {
            throw new Error("User not found");
        }

        const updatedRecommendations = mergeRecommendationTags(users[userIndex].recommendations || [], tags);
        users[userIndex].recommendations = updatedRecommendations;
        this.saveUsers(users);

        return updatedRecommendations;
    }

    /**
     * Returns active recommendation tags with time decay applied.
     *
     * @param userId User id from cookie/session.
     * @returns Active recommendations sorted by relevance.
     */
    static getActiveRecommendations(userId?: string | number): RecommendationTag[] {
        if (!userId) {
            return [];
        }

        const user = this.getUserRecord(userId);
        return getActiveRecommendationTags(user?.recommendations || []);
    }
}
