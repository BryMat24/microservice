export type Product = {
    name: string;
    description: string;
    imageUrl: string;
    stock: number;
    price: number;
};

export type OrderDetail = {
    id: number;
    product: Product;
    orderId: number;
    subTotal: number;
    quantity: number;
};

export enum OrderStatus {
    PENDING = "pending",
    PAID = "paid",
}
