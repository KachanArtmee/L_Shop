import { Product } from "../models/product.model";
import { RecommendationTag } from "../models/user.model";

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_TAG_WEIGHT = 10;

/**
 * Applies time decay to a recommendation tag weight.
 *
 * @param recommendation Stored tag recommendation.
 * @param now Timestamp used as the current moment.
 * @returns Decayed weight. Zero means the tag is no longer relevant.
 */
export function getDecayedWeight(recommendation: RecommendationTag, now = Date.now()): number {
    const lastUsed = new Date(recommendation.lastUsedAt).getTime();

    if (Number.isNaN(lastUsed)) {
        return 0;
    }

    const ageDays = Math.max(0, (now - lastUsed) / DAY_MS);

    if (ageDays >= 7) {
        return 0;
    }

    if (ageDays >= 3) {
        return recommendation.weight * 0.35;
    }

    if (ageDays >= 1) {
        return recommendation.weight * 0.7;
    }

    return recommendation.weight;
}

/**
 * Merges newly liked product tags into the existing user recommendation profile.
 *
 * @param existing Current user recommendation tags.
 * @param tags Tags from the liked product.
 * @param nowIso ISO date saved as the new interaction time.
 * @returns Updated and sorted recommendation profile.
 */
export function mergeRecommendationTags(
    existing: RecommendationTag[] = [],
    tags: string[] = [],
    nowIso = new Date().toISOString()
): RecommendationTag[] {
    const now = new Date(nowIso).getTime();
    const byTag = new Map<string, RecommendationTag>();

    existing.forEach((recommendation) => {
        const tag = recommendation.tag.trim().toLowerCase();
        const weight = getDecayedWeight(recommendation, now);

        if (tag && weight > 0) {
            byTag.set(tag, {
                tag,
                weight,
                lastUsedAt: recommendation.lastUsedAt,
            });
        }
    });

    tags.forEach((rawTag) => {
        const tag = rawTag.trim().toLowerCase();

        if (!tag) {
            return;
        }

        const current = byTag.get(tag);
        byTag.set(tag, {
            tag,
            weight: Math.min(MAX_TAG_WEIGHT, (current?.weight || 0) + 2),
            lastUsedAt: nowIso,
        });
    });

    return [...byTag.values()].sort((a, b) => b.weight - a.weight);
}

/**
 * Returns only active recommendation tags with their decayed weights.
 *
 * @param recommendations Stored user recommendations.
 * @param now Timestamp used for decay.
 * @returns Active tags sorted by relevance.
 */
export function getActiveRecommendationTags(
    recommendations: RecommendationTag[] = [],
    now = Date.now()
): RecommendationTag[] {
    return recommendations
        .map((recommendation) => ({
            ...recommendation,
            tag: recommendation.tag.trim().toLowerCase(),
            weight: getDecayedWeight(recommendation, now),
        }))
        .filter((recommendation) => recommendation.tag && recommendation.weight > 0.2)
        .sort((a, b) => b.weight - a.weight);
}

/**
 * Places recommended products between ordinary catalog products instead of sorting
 * the full catalog only by recommendation score.
 *
 * @param products Catalog products after regular search/filtering.
 * @param activeTags User tags with relevance weight.
 * @returns Products with recommended items inserted into the feed.
 */
export function interleaveRecommendedProducts(
    products: Product[],
    activeTags: RecommendationTag[] = []
): Product[] {
    if (activeTags.length === 0) {
        return products.map((product) => ({ ...product, isRecommended: false }));
    }

    const tagWeights = new Map(activeTags.map((item) => [item.tag, item.weight]));
    const recommended: Array<{ product: Product; score: number }> = [];
    const regular: Product[] = [];

    products.forEach((product) => {
        const score = (product.tags || []).reduce((sum, tag) => {
            return sum + (tagWeights.get(tag.trim().toLowerCase()) || 0);
        }, 0);

        if (score > 0) {
            recommended.push({ product, score });
        } else {
            regular.push(product);
        }
    });

    recommended.sort((a, b) => b.score - a.score);

    const feed: Product[] = [];
    let regularIndex = 0;
    let recommendedIndex = 0;

    while (regularIndex < regular.length || recommendedIndex < recommended.length) {
        for (let i = 0; i < 2 && regularIndex < regular.length; i += 1) {
            feed.push({ ...regular[regularIndex], isRecommended: false });
            regularIndex += 1;
        }

        if (recommendedIndex < recommended.length) {
            feed.push({ ...recommended[recommendedIndex].product, isRecommended: true });
            recommendedIndex += 1;
        }
    }

    return feed;
}

/**
 * Calculates a public average product rating.
 *
 * @param ratings Numeric ratings from product reviews.
 * @returns Average rounded to one decimal place.
 */
export function calculateAverageRating(ratings: number[]): number {
    if (ratings.length === 0) {
        return 0;
    }

    const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    return Math.round(average * 10) / 10;
}
