import express, { Router } from "express";
const router: Router = express.Router();
import UserController from "../controller/user-controller";

router.post("/login", UserController.login);
router.post("/register", UserController.register);

export default router;
