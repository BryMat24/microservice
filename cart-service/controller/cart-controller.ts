import client from "../config/redis";
import { Request, Response, NextFunction } from "express";

class CartController {
    static async getUserCart(req: Request, res: Response, next: NextFunction) {}

    static async addItem(req: Request, res: Response, next: NextFunction) {}

    static async updateItemQuantity(
        req: Request,
        res: Response,
        next: NextFunction
    ) {}

    static async deleteItem(req: Request, res: Response, next: NextFunction) {}
}

export default CartController;
