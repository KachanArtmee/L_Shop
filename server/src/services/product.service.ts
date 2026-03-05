import fs from 'fs';
import { DB_PATH } from "../constants/general";
import { Product } from "../models/product.model";

export class ProductService {

    static getAllProducts(): Product[] {
        try {
            if (!fs.existsSync(DB_PATH.products)) {
                return [];
            }
            let fileData = fs.readFileSync(DB_PATH.products, "utf8");
            fileData = fileData.replace(/^\uFEFF/, '');
            const products = JSON.parse(fileData || '[]') as Product[];
            return products;
        } catch (error) {
            console.error(`Error reading products:`, error);
            return [];
        }
    }

    static filterBySearch(products: Product[], search?: string): Product[] {
        if (!search) return products;
        const lSearch = search.toLowerCase().trim();
        return products.filter(product =>
            product.title?.toLowerCase().trim().includes(lSearch) ||
            product.description?.toLowerCase().trim().includes(lSearch)
        );
    }

    static sortByPrice(products: Product[], sort?: string): Product[] {
        if (!sort) return products;
        const sorted = [...products];
        return sort === 'asc'
            ? sorted.sort((a, b) => a.price - b.price)
            : sorted.sort((a, b) => b.price - a.price);
    }

    static filterByCategory(products: Product[], category: string): Product[] {
        return products.filter(product =>
            product.categories?.includes(category)
        );
    }

    static filterByAvailability(products: Product[], isAvailable: string): Product[] {
        return products.filter(product =>
            String(product.isAvailable) === isAvailable
        );
    }

    static filterByPrice(products: Product[], maxPrice: string): Product[] {
        const price = Number(maxPrice);
        if (isNaN(price)) return products;
        return products.filter(product => product.price <= price);
    }

/*    static filterBy(
        products: Product[],
        category?: string,
        isAvailable?: string,
        maxPrice?: string
    ): Product[] {
        return products.filter(product => {
            const mCategory = category
                ? product.categories?.includes(category)
                : true;

            const mAvailability = (isAvailable === 'true' || isAvailable === 'false')
                ? String(product.isAvailable) === isAvailable
                : true;

            const mPrice = (maxPrice && !isNaN(Number(maxPrice)))
                ? product.price <= Number(maxPrice)
                : true;

            return mCategory && mAvailability && mPrice;
        });*/

}