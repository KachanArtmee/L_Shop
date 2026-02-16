export type Address = {
    country?: string;
    town?: string;
    street?: string;
    houseNumber?: string;
};

export interface Product {
    id: number | string;
    title: string;
    price: number;
    isAvailable: boolean;
    description: string;
    categories: string[];
    images: {
        preview: string;
        gallery?: string[];
    };
    delivery?: {
        startTown: Address;
        earlyDate: Date;
        price: number;
    }
    discount?: number;
}

export interface CartItem {
    productId: number | string;
    quantity: number;
}

export interface UserCart {
    userId: number | string;
    items: CartItem[];
}

export interface DeliveryItem {
    productId: number | string;
    status: string;
    expectedDate: Date | string;
}

export interface UserDelivery {
    userId: number | string;
    items: DeliveryItem[];
}