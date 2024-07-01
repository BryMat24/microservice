import express, { Router } from "express";
import CategoryController from "../controller/category-controller";
const router: Router = express.Router();

router.get("/", CategoryController.getAllCategories);

export default router;
