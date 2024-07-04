export type Cart = {
    quantity: number;
    name: string;
    subTotal: number;
    productId: number;
};

export type CartItem = {
    productId: number;
    orderId: number;
    quantity: number;
    subTotal: number;
};
