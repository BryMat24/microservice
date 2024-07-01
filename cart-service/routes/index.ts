import express, { Router } from "express";
const router: Router = express.Router();
import CartController from "../controller/cart-controller";

router.get("/", CartController.getUserCart);
router.post("/:productId", CartController.addItem);
router.put("/:productId", CartController.updateItemQuantity);
router.delete("/:productId", CartController.deleteItem);

export default router;
