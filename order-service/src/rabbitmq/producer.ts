import amqp from "amqplib";
import { OrderDetail, Product } from "../types/order-type";
import prisma from "../prisma/client";
import axios from "axios";

export async function startProducer(orderId: number) {
    try {
        const orderItems = await prisma.orderItem.findMany({
            where: {
                orderId: Number(orderId),
            },
        });

        let orderDetails: OrderDetail[] = [];
        await Promise.all(
            orderItems.map(async (el) => {
                const productId = el.productId;
                const { data } = await axios.get<Product>(
                    `http://${process.env.PRODUCT_SERVER!}/product/${productId}`
                );

                orderDetails.push({
                    id: el.id,
                    product: data,
                    orderId: Number(orderId),
                    subTotal: el.subTotal,
                    quantity: el.quantity,
                });
            })
        );

        const orderFulfilledEvent = {
            orderDetails,
        };

        const connection = await amqp.connect(process.env.RABBITMQ_URL!);
        const channel = await connection.createChannel();
        const exchangeName = "order_events";
        const routingKeyProductService = "product.orderFulfilled";
        await channel.assertExchange(exchangeName, "topic", {
            durable: true,
        });

        channel.publish(
            exchangeName,
            routingKeyProductService,
            Buffer.from(JSON.stringify(orderFulfilledEvent))
        );

        await channel.close();
        await connection.close();
    } catch (err) {
        console.log(err);
    }
}
