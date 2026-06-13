import fs from "fs";
import os from "node:os";
import path from "node:path";
import request from "supertest";
import { Express } from "express";

let app: Express;
let dbDir: string;

beforeEach(() => {
    dbDir = fs.mkdtempSync(path.join(os.tmpdir(), "l-shop-test-"));
    process.env.DB_DIR = dbDir;

    fs.writeFileSync(path.join(dbDir, "users.json"), JSON.stringify([
        {
            id: "admin-1",
            name: "Owner",
            email: "owner@example.com",
            password: "secret",
            role: "admin",
            recommendations: [],
        },
        {
            id: "user-1",
            name: "Buyer",
            email: "buyer@example.com",
            password: "secret",
            role: "user",
            recommendations: [],
        },
    ], null, 2));
    fs.writeFileSync(path.join(dbDir, "products.json"), JSON.stringify([seedProduct()], null, 2));
    fs.writeFileSync(path.join(dbDir, "carts.json"), "[]");
    fs.writeFileSync(path.join(dbDir, "deliveries.json"), "[]");

    jest.resetModules();
    app = require("../src/app").default;
});

afterEach(() => {
    fs.rmSync(dbDir, { recursive: true, force: true });
    delete process.env.DB_DIR;
});

describe("API", () => {
    test("documents the API with OpenAPI and Swagger UI", async () => {
        const spec = await request(app).get("/openapi.json").expect(200);
        expect(spec.body.paths["/product"]).toBeDefined();

        const docs = await request(app).get("/api-docs/").expect(200);
        expect(docs.text).toContain("Swagger UI");
    });

    test("supports auth register, login, getUser and logout", async () => {
        const agent = request.agent(app);

        const register = await agent
            .post("/auth/register")
            .send({ name: "New Buyer", email: "new@example.com", password: "123456" })
            .expect(200);

        expect(register.body.user.role).toBe("user");

        const currentUser = await agent.get("/auth/getUser").expect(200);
        expect(currentUser.body.user.email).toBe("new@example.com");

        await agent.post("/auth/logout").expect(200);

        const login = await request(app)
            .post("/auth/login")
            .send({ email: "buyer@example.com", password: "secret" })
            .expect(200);

        expect(login.headers["set-cookie"][0]).toContain("myShopToken");
    });

    test("stores locale in a session cookie", async () => {
        const response = await request(app)
            .post("/locale")
            .send({ locale: "en" })
            .expect(200);

        const cookie = response.headers["set-cookie"][0];
        expect(cookie).toContain("shopLocale=en");
        expect(cookie).not.toMatch(/Max-Age|Expires/i);

        const current = await request(app)
            .get("/locale")
            .set("Cookie", cookie)
            .expect(200);

        expect(current.body.locale).toBe("en");
    });

    test("supports product admin API, recommendations and reviews", async () => {
        await request(app).get("/product").expect(200);

        await request(app)
            .post("/product")
            .send(productPayload("blocked"))
            .expect(401);

        const created = await request(app)
            .post("/product")
            .set("Cookie", "myShopToken=admin-1")
            .send(productPayload("gpu-1"))
            .expect(201);

        expect(created.body.data.id).toBe("gpu-1");

        const updated = await request(app)
            .put("/product/gpu-1")
            .set("Cookie", "myShopToken=admin-1")
            .send({ ...productPayload("gpu-1"), price: 200 })
            .expect(200);

        expect(updated.body.data.price).toBe(200);

        await request(app)
            .post("/product/gpu-1/like")
            .set("Cookie", "myShopToken=user-1")
            .expect(200);

        const reviewed = await request(app)
            .post("/product/gpu-1/reviews")
            .set("Cookie", "myShopToken=user-1")
            .send({ rating: 5, comment: "Great card" })
            .expect(200);

        expect(reviewed.body.data.averageRating).toBe(5);

        const feed = await request(app)
            .get("/product")
            .set("Cookie", "myShopToken=user-1")
            .expect(200);

        expect(feed.body.data.some((item: any) => item.id === "gpu-1" && item.isRecommended)).toBe(true);
    });

    test("supports cart and delivery endpoints", async () => {
        await request(app)
            .post("/cart/add")
            .send({ productId: "cpu-1", quantity: 1 })
            .expect(401);

        await request(app)
            .post("/cart/add")
            .set("Cookie", "myShopToken=user-1")
            .send({ productId: "cpu-1", quantity: 2 })
            .expect(200);

        await request(app)
            .patch("/cart/quantity")
            .set("Cookie", "myShopToken=user-1")
            .send({ productId: "cpu-1", quantity: 1 })
            .expect(200);

        await request(app)
            .post("/delivery/checkout")
            .set("Cookie", "myShopToken=user-1")
            .send({ address: "Minsk", phone: "+375", email: "buyer@example.com", captcha: 4 })
            .expect(200);

        const deliveries = await request(app)
            .get("/delivery/my")
            .set("Cookie", "myShopToken=user-1")
            .expect(200);

        expect(deliveries.body.data).toHaveLength(1);

        await request(app)
            .delete("/cart/cpu-1")
            .set("Cookie", "myShopToken=user-1")
            .expect(200);
    });
});

function seedProduct() {
    return {
        id: "cpu-1",
        title: "CPU",
        description: "Processor",
        price: 100,
        isAvailable: true,
        categories: ["Processors"],
        tags: ["cpu"],
        reviews: [],
        images: { preview: "" },
    };
}

function productPayload(id: string) {
    return {
        id,
        title: "GPU",
        description: "Graphics card",
        price: 150,
        isAvailable: true,
        categories: ["Graphics cards"],
        tags: ["gpu", "gaming"],
        reviews: [],
        images: { preview: "" },
    };
}
