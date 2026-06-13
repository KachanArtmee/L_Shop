import {
    calculateAverageRating,
    getActiveRecommendationTags,
    getDecayedWeight,
    interleaveRecommendedProducts,
    mergeRecommendationTags,
} from "./recommendations";
import { Product } from "../models/product.model";

const now = Date.parse("2026-06-13T12:00:00.000Z");

describe("recommendation utilities", () => {
    test("decays old tags and drops stale tags", () => {
        expect(getDecayedWeight({ tag: "cpu", weight: 10, lastUsedAt: "2026-06-13T11:00:00.000Z" }, now)).toBe(10);
        expect(getDecayedWeight({ tag: "cpu", weight: 10, lastUsedAt: "2026-06-10T11:00:00.000Z" }, now)).toBe(3.5);
        expect(getDecayedWeight({ tag: "cpu", weight: 10, lastUsedAt: "2026-06-01T11:00:00.000Z" }, now)).toBe(0);
    });

    test("merges liked product tags into a sorted profile", () => {
        const profile = mergeRecommendationTags(
            [{ tag: "cpu", weight: 3, lastUsedAt: "2026-06-13T11:00:00.000Z" }],
            ["CPU", "Gaming"],
            "2026-06-13T12:00:00.000Z"
        );

        expect(profile[0]).toMatchObject({ tag: "cpu", weight: 5 });
        expect(profile[1]).toMatchObject({ tag: "gaming", weight: 2 });
    });

    test("returns active tags with decay applied", () => {
        const active = getActiveRecommendationTags([
            { tag: "cpu", weight: 5, lastUsedAt: "2026-06-13T11:00:00.000Z" },
            { tag: "gpu", weight: 5, lastUsedAt: "2026-06-01T11:00:00.000Z" },
        ], now);

        expect(active.map(item => item.tag)).toEqual(["cpu"]);
    });

    test("interleaves recommended products instead of replacing the feed", () => {
        const products = [
            product("cpu-1", ["cpu"]),
            product("ram-1", ["ram"]),
            product("ssd-1", ["ssd"]),
            product("gpu-1", ["gpu"]),
        ];

        const feed = interleaveRecommendedProducts(products, [
            { tag: "gpu", weight: 5, lastUsedAt: "2026-06-13T12:00:00.000Z" },
        ]);

        expect(feed).toHaveLength(products.length);
        expect(feed.some(item => item.id === "gpu-1" && item.isRecommended)).toBe(true);
        expect(feed[0].id).toBe("cpu-1");
    });

    test("calculates one-decimal average rating", () => {
        expect(calculateAverageRating([5, 4, 4])).toBe(4.3);
        expect(calculateAverageRating([])).toBe(0);
    });
});

function product(id: string, tags: string[]): Product {
    return {
        id,
        title: id,
        description: id,
        price: 1,
        isAvailable: true,
        categories: tags,
        tags,
        images: { preview: "" },
    };
}
