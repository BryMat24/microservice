import express from "express";
import cors from "cors";
import errorHandler from "./middleware/errorHandler";
import router from "./routes";
import dotenv from "dotenv";
import auth from "./middleware/auth";

const app = express();
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(auth);
app.use(router);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
