import express from "express";
import cors from "cors";
import errorHandler from "./middleware/errorHandler";
import router from "./routes";
import dotenv from "dotenv";
import OrderController from "./controller/order-controller";

const app = express();
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

app.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    OrderController.stripeWebhook
);

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(router);
app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, () => {
        console.log(`Listening on port ${PORT}`);
    });
}

export default app;
