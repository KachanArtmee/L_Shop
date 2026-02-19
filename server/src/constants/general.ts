import path from "node:path";

export const COOKIE_CONF = {
    name: "myShopToken",
    maxAge: 1000 * 60 * 10,
    httpOnly: true,
    secure: false,
    sameSite: 'lax' as const,
};

export const DB_PATH = {
    users: path.join(process.cwd(), 'database', 'users.json'),
    products: path.join(process.cwd(), 'database', 'products.json'),
    deliveries: path.join(process.cwd(), 'database', 'deliveries.json'),
    carts: path.join(process.cwd(), 'database', 'carts.json'),
};