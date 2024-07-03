export type CartItem = {
    productId: number;
    quantity: number;
    name: string;
};

export type ProductResponse = {
    id: number;
    name: string;
    description: string;
    imageUrl: string;
    stock: number;
    price: number;
    categoryId: number;
};

export enum IncrementStatus {
    INCREMENT = 1,
    DECREMENT = -1,
}
