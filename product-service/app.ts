import express from "express";
import cors from "cors";
import router from "./routes";
import errorHandler from "./middleware/errorHandling";
import { startConsumer } from "./rabbitmq/consumer";

const app = express();
const PORT = process.env.PORT || 3000;

startConsumer();
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(router);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
