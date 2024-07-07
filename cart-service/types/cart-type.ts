export type CartItem = {
    productId: number;
    quantity: number;
    name: string;
    price: number;
    imageUrl: string;
    stock: number;
};

export type ProductResponse = {
    id: number;
    name: string;
    description: string;
    imageUrl: string;
    stock: number;
    price: number;
    categoryId: number;
    status: string;
};

export enum IncrementStatus {
    INCREMENT = 1,
    DECREMENT = -1,
}
