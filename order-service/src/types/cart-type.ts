export type CartItem = {
    quantity: number;
    name: string;
    price: number;
    productId: number;
    imageUrl: string;
    stock: number;
};

export type Cart = {
    items: CartItem[];
    totalPrice: number;
};

export type OrderItem = {
    productId: number;
    orderId: number;
    quantity: number;
    subTotal: number;
};
