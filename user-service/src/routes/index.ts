import express, { Router } from "express";
const router: Router = express.Router();
import UserController from "../controller/user-controller";

router.post("/user/login", UserController.login);
router.post("/user/register", UserController.register);

export default router;
