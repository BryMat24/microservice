import express, { Router } from "express";
import OrderController from "../controller/order-controller";
import auth from "../middleware/auth";

const router: Router = express.Router();

router.get("/order", auth, OrderController.getOrderHistory);
router.post("/order", auth, OrderController.createOrder);
router.get("/order/:id", auth, OrderController.getOrderDetail);

export default router;
