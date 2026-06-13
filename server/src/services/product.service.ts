import { DB_PATH } from "../constants/general";
import { Product, ProductReview } from "../models/product.model";
import { RecommendationTag } from "../models/user.model";
import { readJsonFile, writeJsonFile } from "../utils/file-db";
import { calculateAverageRating, interleaveRecommendedProducts } from "../utils/recommendations";

export class ProductService {
    /**
     * Loads all products and attaches calculated fields used by the API.
     *
     * @returns Products from JSON storage.
     */
    static getAllProducts(): Product[] {
        const products = readJsonFile<Product[]>(DB_PATH.products, []);
        return products.map(product => this.withCalculatedFields(product));
    }

    /**
     * Saves products into JSON storage.
     *
     * @param products Full product collection.
     */
    static saveProducts(products: Product[]): void {
        const normalized = products.map(({ averageRating, isRecommended, ...product }) => product);
        writeJsonFile(DB_PATH.products, normalized);
    }

    /**
     * Finds one product by id.
     *
     * @param productId Product id.
     * @returns Product with calculated fields or undefined.
     */
    static getProductById(productId: string | number): Product | undefined {
        return this.getAllProducts().find(product => String(product.id) === String(productId));
    }

    /**
     * Creates a product from an admin form.
     *
     * @param product Product payload without calculated fields.
     * @returns Created product.
     */
    static createProduct(product: Omit<Product, "id"> & { id?: string | number }): Product {
        const products = this.getAllProducts();
        const newProduct: Product = this.withCalculatedFields({
            ...product,
            id: product.id || `product-${Date.now()}`,
            tags: product.tags || product.categories || [],
            reviews: product.reviews || [],
            images: product.images || { preview: "" },
        });

        products.push(newProduct);
        this.saveProducts(products);

        return newProduct;
    }

    /**
     * Updates a product from an admin form.
     *
     * @param productId Product id.
     * @param patch Partial product fields.
     * @returns Updated product.
     */
    static updateProduct(productId: string | number, patch: Partial<Product>): Product | undefined {
        const products = this.getAllProducts();
        const productIndex = products.findIndex(product => String(product.id) === String(productId));

        if (productIndex === -1) {
            return undefined;
        }

        const updatedProduct = this.withCalculatedFields({
            ...products[productIndex],
            ...patch,
            id: products[productIndex].id,
            tags: patch.tags || products[productIndex].tags || patch.categories || products[productIndex].categories,
            reviews: patch.reviews || products[productIndex].reviews || [],
        });

        products[productIndex] = updatedProduct;
        this.saveProducts(products);

        return updatedProduct;
    }

    /**
     * Adds or updates the current user's review for a product.
     *
     * @param productId Product id.
     * @param review Review payload.
     * @returns Updated product.
     */
    static addReview(productId: string | number, review: ProductReview): Product | undefined {
        const products = this.getAllProducts();
        const productIndex = products.findIndex(product => String(product.id) === String(productId));

        if (productIndex === -1) {
            return undefined;
        }

        const product = products[productIndex];
        const reviews = [...(product.reviews || [])];
        const existingReviewIndex = reviews.findIndex(item => String(item.userId) === String(review.userId));

        if (existingReviewIndex === -1) {
            reviews.push(review);
        } else {
            reviews[existingReviewIndex] = {
                ...reviews[existingReviewIndex],
                rating: review.rating,
                comment: review.comment,
                createdAt: review.createdAt,
                userName: review.userName,
            };
        }

        const updatedProduct = this.withCalculatedFields({ ...product, reviews });
        products[productIndex] = updatedProduct;
        this.saveProducts(products);

        return updatedProduct;
    }

    /**
     * Filters products by search text in title or description.
     *
     * @param products Product collection.
     * @param search User search text.
     * @returns Filtered products.
     */
    static filterBySearch(products: Product[], search?: string): Product[] {
        if (!search) return products;
        const lSearch = search.toLowerCase().trim();
        return products.filter(product =>
            product.title?.toLowerCase().trim().includes(lSearch) ||
            product.description?.toLowerCase().trim().includes(lSearch) ||
            product.translations?.en?.title?.toLowerCase().trim().includes(lSearch) ||
            product.translations?.en?.description?.toLowerCase().trim().includes(lSearch)
        );
    }

    /**
     * Sorts products by price.
     *
     * @param products Product collection.
     * @param sort Sort direction: asc or desc.
     * @returns Sorted product copy.
     */
    static sortByPrice(products: Product[], sort?: string): Product[] {
        if (!sort) return products;
        const sorted = [...products];
        return sort === 'asc'
            ? sorted.sort((a, b) => a.price - b.price)
            : sorted.sort((a, b) => b.price - a.price);
    }

    /**
     * Filters products by category in any supported locale.
     *
     * @param products Product collection.
     * @param category Category from query string.
     * @returns Filtered products.
     */
    static filterByCategory(products: Product[], category: string): Product[] {
        return products.filter(product => {
            const categories = [
                ...(product.categories || []),
                ...(product.translations?.en?.categories || []),
                ...(product.translations?.ru?.categories || []),
            ];

            return categories.includes(category);
        });
    }

    /**
     * Filters products by availability.
     *
     * @param products Product collection.
     * @param isAvailable String value from query string.
     * @returns Filtered products.
     */
    static filterByAvailability(products: Product[], isAvailable: string): Product[] {
        return products.filter(product =>
            String(product.isAvailable) === isAvailable
        );
    }

    /**
     * Filters products by maximum price.
     *
     * @param products Product collection.
     * @param maxPrice Price from query string.
     * @returns Filtered products.
     */
    static filterByPrice(products: Product[], maxPrice: string): Product[] {
        const price = Number(maxPrice);
        if (Number.isNaN(price)) return products;
        return products.filter(product => product.price <= price);
    }

    /**
     * Interleaves products that match active user recommendations.
     *
     * @param products Product collection.
     * @param recommendations Active user recommendation tags.
     * @returns Recommendation-aware catalog feed.
     */
    static applyRecommendations(products: Product[], recommendations: RecommendationTag[]): Product[] {
        return interleaveRecommendedProducts(products, recommendations);
    }

    private static withCalculatedFields(product: Product): Product {
        const reviews = product.reviews || [];

        return {
            ...product,
            tags: product.tags || product.categories || [],
            reviews,
            averageRating: calculateAverageRating(reviews.map(review => review.rating)),
        };
    }
}
