import { NextFunction, Request, Response } from "express";
import axios from "axios";
import { extractToken } from "../helper/validateJwt";
import prisma from "../prisma/client";
import { Cart, CartItem } from "../types/cart-type";
import { OrderDetail, Product, OrderStatus } from "../types/order-type";

class OrderController {
    static async createOrder(req: Request, res: Response, next: NextFunction) {
        try {
            const { data } = await axios.get<Cart[]>(
                `${process.env.CART_SERVER!}/cart`,
                {
                    headers: { Authorization: `Bearer ${extractToken(req)}` },
                }
            );

            if (data.length === 0) throw { name: "CartEmptyError" };

            await axios.delete(`${process.env.CART_SERVER!}/cart`, {
                headers: { Authorization: `Bearer ${extractToken(req)}` },
            });

            let totalPrice: number = data.reduce(
                (accumulator: number, curr: Cart) =>
                    accumulator + curr.subTotal,
                0
            );

            const order = await prisma.order.create({
                data: {
                    status: OrderStatus.PENDING,
                    totalPrice: totalPrice,
                    userId: Number(req.userId),
                },
            });

            let cartItems: CartItem[] = [];
            data.forEach((el) => {
                const cartItem: CartItem = {
                    productId: el.productId,
                    orderId: order.id,
                    quantity: el.quantity,
                    subTotal: el.subTotal,
                };
                cartItems.push(cartItem);
            });

            await prisma.orderItem.createMany({
                data: cartItems,
            });

            res.status(201).json(order);
        } catch (err) {
            next(err);
        }
    }

    static async getOrderDetail(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { id } = req.params;
            const orderItems = await prisma.orderItem.findMany({
                where: {
                    orderId: Number(id),
                    order: {
                        userId: Number(req.userId),
                    },
                },
            });

            let orderDetails: OrderDetail[] = [];
            await Promise.all(
                orderItems.map(async (el) => {
                    const productId = el.productId;
                    const { data } = await axios.get<Product>(
                        `${process.env.PRODUCT_SERVER!}/product/${productId}`
                    );
                    orderDetails.push({
                        id: el.id,
                        product: data,
                        orderId: Number(id),
                        subTotal: el.subTotal,
                        quantity: el.quantity,
                    });
                })
            );

            res.status(200).json(orderDetails);
        } catch (err) {
            next(err);
        }
    }

    static async payOrder(req: Request, res: Response, next: NextFunction) {}

    static async getOrderHistory(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const orderHistory = await prisma.order.findMany({
                where: {
                    userId: Number(req.userId),
                    status: OrderStatus.PAID,
                },
            });

            res.status(200).json(orderHistory);
        } catch (err) {
            next(err);
        }
    }
}

export default OrderController;
