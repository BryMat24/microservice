import client from "../config/redis";
import { Request, Response, NextFunction } from "express";

class CartController {
    static async getUserCart(req: Request, res: Response, next: NextFunction) {
        try {
        } catch (err) {
            next(err);
        }
    }

    static async addItem(req: Request, res: Response, next: NextFunction) {
        try {
        } catch (err) {
            next(err);
        }
    }

    static async updateItemQuantity(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
        } catch (err) {
            next(err);
        }
    }

    static async deleteItem(req: Request, res: Response, next: NextFunction) {
        try {
        } catch (err) {
            next(err);
        }
    }
}

export default CartController;
