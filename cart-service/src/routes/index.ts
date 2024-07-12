import express, { Router } from "express";
const router: Router = express.Router();
import CartController from "../controller/cart-controller";

router.get("/cart", CartController.getUserCart);
router.delete("/cart", CartController.deleteCart);
router.post("/cart/:productId", CartController.addItem);
router.put("/cart/:productId", CartController.updateItemQuantity);
router.delete("/cart/:productId", CartController.deleteItem);

export default router;
