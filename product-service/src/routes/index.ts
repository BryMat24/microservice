import express, { Router } from "express";
import ProductController from "../controller/product-controller";
import CategoryController from "../controller/category-controller";
const router: Router = express.Router();

router.get("/product", ProductController.getAllProducts);
router.get("/product/category", CategoryController.getAllCategories);
router.get("/product/:id", ProductController.getProductById);

export default router;
