import express, { Router } from "express";
import OrderController from "../controller/order-controller";

const router: Router = express.Router();

router.get("/order", OrderController.getOrderHistory);
router.post("/order", OrderController.createOrder);
router.get("/order/:id", OrderController.getOrderDetail);
router.post("/order/:id", OrderController.payOrder);

export default router;
