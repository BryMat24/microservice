import { NextFunction, Request, Response } from "express";
import axios from "axios";
import { extractToken } from "../helper/validateJwt";
import prisma from "../prisma/client";
import { Cart, CartItem, OrderItem } from "../types/cart-type";
import { OrderDetail, Product, OrderStatus } from "../types/order-type";
import Stripe from "stripe";
import { startProducer } from "../rabbitmq/producer";

class OrderController {
    static async createOrder(req: Request, res: Response, next: NextFunction) {
        try {
            // create pending order
            const { data } = await axios.get<Cart>(
                `${process.env.CART_SERVER!}/cart`,
                {
                    headers: { Authorization: `Bearer ${extractToken(req)}` },
                }
            );

            let cartData: CartItem[] = data.items;
            if (cartData.length === 0) throw { name: "CartEmptyError" };
            await axios.delete(`${process.env.CART_SERVER!}/cart`, {
                headers: { Authorization: `Bearer ${extractToken(req)}` },
            });

            const order = await prisma.order.create({
                data: {
                    status: OrderStatus.PENDING,
                    totalPrice: data.totalPrice,
                    userId: Number(req.userId),
                },
            });

            let orderItems: OrderItem[] = [];
            cartData.forEach((el) => {
                const cartItem: OrderItem = {
                    productId: el.productId,
                    orderId: order.id,
                    quantity: el.quantity,
                    subTotal: el.price * el.quantity,
                };
                orderItems.push(cartItem);
            });

            await prisma.orderItem.createMany({
                data: orderItems,
            });

            // create checkout session to stripe
            const lineItems = cartData.map((item) => ({
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: item.name,
                    },
                    unit_amount: item.price * 100,
                },
                quantity: item.quantity,
            }));

            const stripe = require("stripe")(process.env.STRIPE_API_KEY);
            const session = await stripe.checkout.sessions.create({
                success_url: `${process.env.CLIENT_URL}/payment/success`,
                cancel_url: `${process.env.CLIENT_URL}/cart`,
                line_items: lineItems,
                mode: "payment",
                metadata: {
                    orderId: order.id.toString(),
                },
            });

            res.status(201).json({
                url: session.url,
            });
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

            let totalPrice: number = 0;
            let orderDetails: OrderDetail[] = [];
            await Promise.all(
                orderItems.map(async (el) => {
                    const productId = el.productId;
                    const { data } = await axios.get<Product>(
                        `${process.env.PRODUCT_SERVER!}/product/${productId}`
                    );

                    totalPrice += el.subTotal;
                    orderDetails.push({
                        id: el.id,
                        product: data,
                        orderId: Number(id),
                        subTotal: el.subTotal,
                        quantity: el.quantity,
                    });
                })
            );

            res.status(200).json({ items: orderDetails, totalPrice });
        } catch (err) {
            next(err);
        }
    }

    static async stripeWebhook(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const stripe = require("stripe")(process.env.STRIPE_API_KEY);
            const sig = req.headers["stripe-signature"]!;
            let event: Stripe.Event;
            try {
                event = stripe.webhooks.constructEvent(
                    req.body,
                    sig,
                    process.env.STRIPE_WEBHOOK_SECRET!
                );
            } catch (err) {
                return res.sendStatus(400);
            }

            if (event.type === "checkout.session.completed") {
                const session = event.data.object as Stripe.Checkout.Session;
                const orderId = session.metadata?.orderId;
                if (!orderId) {
                    res.sendStatus(400);
                }

                await prisma.order.update({
                    where: { id: Number(orderId) },
                    data: { status: OrderStatus.PAID },
                });

                startProducer(Number(orderId));
            }

            res.sendStatus(200);
        } catch (err) {
            console.error("Error in stripeWebhook:", err);
            next(err);
        }
    }

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
