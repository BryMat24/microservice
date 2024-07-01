import express, { Router } from "express";
import productRouter from "./product-route";
import categoryRouter from "./category-route";
const router: Router = express.Router();

router.use("/product", productRouter);
router.use("/category", categoryRouter);

export default router;
