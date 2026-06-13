import path from "node:path";

const databaseDir = process.env.DB_DIR || path.join(process.cwd(), 'database');

export const COOKIE_CONF = {
    name: "myShopToken",
    maxAge: 1000 * 60 * 30,
    httpOnly: true,
    secure: false,
    sameSite: 'lax' as const,
};

export const LOCALE_COOKIE_CONF = {
    name: "shopLocale",
    httpOnly: false,
    secure: false,
    sameSite: 'lax' as const,
};

export const DB_PATH = {
    users: path.join(databaseDir, 'users.json'),
    products: path.join(databaseDir, 'products.json'),
    deliveries: path.join(databaseDir, 'deliveries.json'),
    carts: path.join(databaseDir, 'carts.json'),
};
