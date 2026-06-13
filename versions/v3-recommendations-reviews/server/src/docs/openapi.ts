export const openApiDocument = {
    openapi: "3.0.3",
    info: {
        title: "TechFlow L_Shop API",
        version: "1.0.0",
        description: "API интернет-магазина для ЛР14 и ЛР15-16: авторизация, товары, корзина, доставка, локализация, рекомендации и отзывы.",
    },
    servers: [
        {
            url: "http://localhost:3000",
            description: "Local development server",
        },
    ],
    tags: [
        { name: "Auth", description: "Регистрация, вход, выход и текущий пользователь" },
        { name: "Locale", description: "Сессионная локаль пользователя" },
        { name: "Products", description: "Каталог, админское управление, рекомендации и отзывы" },
        { name: "Cart", description: "Корзина пользователя" },
        { name: "Delivery", description: "Оформление и история заказов" },
    ],
    components: {
        securitySchemes: {
            sessionCookie: {
                type: "apiKey",
                in: "cookie",
                name: "myShopToken",
            },
        },
        schemas: {
            User: {
                type: "object",
                properties: {
                    id: { oneOf: [{ type: "string" }, { type: "number" }] },
                    name: { type: "string" },
                    email: { type: "string" },
                    role: { type: "string", enum: ["user", "admin", "manager"] },
                },
            },
            Product: {
                type: "object",
                required: ["title", "price", "isAvailable", "description", "categories", "images"],
                properties: {
                    id: { oneOf: [{ type: "string" }, { type: "number" }] },
                    title: { type: "string" },
                    description: { type: "string" },
                    price: { type: "number" },
                    isAvailable: { type: "boolean" },
                    categories: { type: "array", items: { type: "string" } },
                    tags: { type: "array", items: { type: "string" } },
                    averageRating: { type: "number" },
                    isRecommended: { type: "boolean" },
                    images: {
                        type: "object",
                        properties: {
                            preview: { type: "string" },
                            gallery: { type: "array", items: { type: "string" } },
                        },
                    },
                    reviews: {
                        type: "array",
                        items: { $ref: "#/components/schemas/ProductReview" },
                    },
                },
            },
            ProductReview: {
                type: "object",
                properties: {
                    id: { oneOf: [{ type: "string" }, { type: "number" }] },
                    userId: { oneOf: [{ type: "string" }, { type: "number" }] },
                    userName: { type: "string" },
                    rating: { type: "integer", minimum: 1, maximum: 5 },
                    comment: { type: "string" },
                    createdAt: { type: "string", format: "date-time" },
                },
            },
            ApiSuccess: {
                type: "object",
                properties: {
                    success: { type: "boolean" },
                },
            },
        },
    },
    paths: {
        "/auth/register": {
            post: {
                tags: ["Auth"],
                summary: "Register user",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["name", "email", "password"],
                                properties: {
                                    name: { type: "string" },
                                    email: { type: "string" },
                                    password: { type: "string" },
                                    role: { type: "string", enum: ["user", "admin"] },
                                    adminKey: { type: "string" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: "Registered and session cookie set" },
                    400: { description: "Validation error" },
                },
            },
        },
        "/auth/login": {
            post: {
                tags: ["Auth"],
                summary: "Login user",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["email", "password"],
                                properties: {
                                    email: { type: "string" },
                                    login: { type: "string" },
                                    phone: { type: "string" },
                                    password: { type: "string" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: "Logged in and session cookie set" },
                    401: { description: "Invalid credentials" },
                },
            },
        },
        "/auth/logout": {
            post: {
                tags: ["Auth"],
                summary: "Logout user",
                responses: { 200: { description: "Session cleared" } },
            },
        },
        "/auth/getUser": {
            get: {
                tags: ["Auth"],
                summary: "Get current user",
                security: [{ sessionCookie: [] }],
                responses: {
                    200: { description: "Current user profile" },
                    401: { description: "Not authenticated" },
                },
            },
        },
        "/locale": {
            get: {
                tags: ["Locale"],
                summary: "Get session locale",
                responses: { 200: { description: "Current or suggested locale" } },
            },
            post: {
                tags: ["Locale"],
                summary: "Set session locale",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["locale"],
                                properties: { locale: { type: "string", enum: ["ru", "en"] } },
                            },
                        },
                    },
                },
                responses: { 200: { description: "Session cookie set without max-age" } },
            },
            delete: {
                tags: ["Locale"],
                summary: "Clear locale cookie",
                responses: { 200: { description: "Locale cleared" } },
            },
        },
        "/product": {
            get: {
                tags: ["Products"],
                summary: "Get product feed",
                parameters: [
                    { name: "search", in: "query", schema: { type: "string" } },
                    { name: "category", in: "query", schema: { type: "string" } },
                    { name: "isAvailable", in: "query", schema: { type: "boolean" } },
                    { name: "maxPrice", in: "query", schema: { type: "number" } },
                    { name: "sort", in: "query", schema: { type: "string", enum: ["asc", "desc"] } },
                ],
                responses: { 200: { description: "Filtered product feed" } },
            },
            post: {
                tags: ["Products"],
                summary: "Create product",
                security: [{ sessionCookie: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": { schema: { $ref: "#/components/schemas/Product" } },
                    },
                },
                responses: {
                    201: { description: "Created product" },
                    403: { description: "Admin or manager role required" },
                },
            },
        },
        "/product/{productId}": {
            get: {
                tags: ["Products"],
                summary: "Get one product",
                parameters: [{ name: "productId", in: "path", required: true, schema: { type: "string" } }],
                responses: { 200: { description: "Product" }, 404: { description: "Not found" } },
            },
            put: {
                tags: ["Products"],
                summary: "Update product",
                security: [{ sessionCookie: [] }],
                parameters: [{ name: "productId", in: "path", required: true, schema: { type: "string" } }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": { schema: { $ref: "#/components/schemas/Product" } },
                    },
                },
                responses: { 200: { description: "Updated product" }, 403: { description: "Role required" } },
            },
        },
        "/product/{productId}/like": {
            post: {
                tags: ["Products"],
                summary: "Like product and update recommendations",
                security: [{ sessionCookie: [] }],
                parameters: [{ name: "productId", in: "path", required: true, schema: { type: "string" } }],
                responses: { 200: { description: "Recommendation profile updated" } },
            },
        },
        "/product/{productId}/reviews": {
            post: {
                tags: ["Products"],
                summary: "Add or update review",
                security: [{ sessionCookie: [] }],
                parameters: [{ name: "productId", in: "path", required: true, schema: { type: "string" } }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["rating", "comment"],
                                properties: {
                                    rating: { type: "integer", minimum: 1, maximum: 5 },
                                    comment: { type: "string" },
                                },
                            },
                        },
                    },
                },
                responses: { 200: { description: "Review saved" }, 401: { description: "Auth required" } },
            },
        },
        "/cart/add": {
            post: {
                tags: ["Cart"],
                summary: "Add product to cart",
                security: [{ sessionCookie: [] }],
                responses: { 200: { description: "Cart updated" } },
            },
        },
        "/cart/quantity": {
            patch: {
                tags: ["Cart"],
                summary: "Update product quantity",
                security: [{ sessionCookie: [] }],
                responses: { 200: { description: "Quantity updated" } },
            },
        },
        "/cart/{productId}": {
            delete: {
                tags: ["Cart"],
                summary: "Remove product from cart",
                security: [{ sessionCookie: [] }],
                parameters: [{ name: "productId", in: "path", required: true, schema: { type: "string" } }],
                responses: { 200: { description: "Item removed" } },
            },
        },
        "/delivery/my": {
            get: {
                tags: ["Delivery"],
                summary: "Get current user deliveries",
                security: [{ sessionCookie: [] }],
                responses: { 200: { description: "Deliveries" } },
            },
        },
        "/delivery/checkout": {
            post: {
                tags: ["Delivery"],
                summary: "Create order from cart",
                security: [{ sessionCookie: [] }],
                responses: { 200: { description: "Order created" }, 400: { description: "Invalid order" } },
            },
        },
    },
};
