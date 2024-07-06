import express from "express";
import cors from "cors";
import router from "./routes";
import errorHandler from "./middleware/errorHandling";
import amqp from "amqplib";

const app = express();
const PORT = process.env.PORT || 3000;

async function startConsumer() {
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

        channel.consume(queueName, (msg) => {
            if (msg !== null) {
                const event = JSON.parse(msg.content.toString());
                console.log("Received order fulfilled event:", event);
                console.log("Processing event:", event);
                channel.ack(msg);
            }
        });

        return { connection, channel };
    } catch (error) {
        console.error("Failed to start consumer:", error);
    }
}

startConsumer();
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(router);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
