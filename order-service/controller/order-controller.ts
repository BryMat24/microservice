import { NextFunction, Request, Response } from "express";

class OrderController {
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
