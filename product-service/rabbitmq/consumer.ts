import amqp from "amqplib";
import prisma from "../prisma/client";

export async function startConsumer() {
    try {
        const rabbitMQUrl = process.env.RABBITMQ_URL!;
        const exchangeName = "order_events";
        const routingKey = "product.orderFulfilled";
        const queueName = "product_service_queue";

        const connection = await amqp.connect(rabbitMQUrl);
        const channel = await connection.createChannel();

        await channel.assertExchange(exchangeName, "topic", { durable: true });
        await channel.assertQueue(queueName, { durable: true });
        await channel.bindQueue(queueName, exchangeName, routingKey);

        channel.consume(queueName, async (msg) => {
            if (msg !== null) {
                const { orderDetails } = JSON.parse(msg.content.toString());

                for (const item of orderDetails) {
                    const productId = item.product.id;
                    const quantity = item.quantity;

                    const updatedProduct = await prisma.product.update({
                        where: { id: productId },
                        data: {
                            stock: {
                                decrement: quantity,
                            },
                        },
                    });

                    if (updatedProduct.stock <= 0) {
                        await prisma.product.delete({
                            where: { id: productId },
                        });
                    }
                }

                channel.ack(msg);
            }
        });

        return { connection, channel };
    } catch (error) {
        console.error("Failed to start consumer:", error);
    }
}
