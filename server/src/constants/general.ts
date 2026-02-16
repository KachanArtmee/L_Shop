export const COOKIE_CONF = {
    name: "myShopToken",
    maxAge: 1000 * 60 * 10,
    httpOnly: true,
    secure: false,
    sameSite: 'lax' as const,
};

export const DB_PATH = {
    users: './database/users.json',
    products: './database/products.json',
    deliveries: './database/deliveries.json',
    carts: './database/carts.json',
}