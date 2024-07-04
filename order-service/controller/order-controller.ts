import { NextFunction, Request, Response } from "express";
import axios from "axios";
import { extractToken } from "../helper/validateJwt";

class OrderController {
    static async createOrder(req: Request, res: Response, next: NextFunction) {
        try {
            res.status(200).json("this is order");
        } catch (err) {
            next(err);
        }
    }

    static async getOrderDetail(
        req: Request,
        res: Response,
        next: NextFunction
    ) {}

    static async payOrder(req: Request, res: Response, next: NextFunction) {}

    static async getOrderHistory(
        req: Request,
        res: Response,
        next: NextFunction
    ) {}
}

export default OrderController;
