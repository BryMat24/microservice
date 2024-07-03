import { Request, Response, NextFunction } from "express";
import axios from "axios";
import client from "../config/redis";
import { CartItem, ProductResponse, IncrementStatus } from "../types/cart-type";

class CartController {
    static async getUserCart(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.userId;
            const cartItems = await client.hgetall(`cart:${userId}`);

            const fetchProductPromises = Object.keys(cartItems).map(
                async (key) => {
                    const productId = key.split("_")[2];
                    const response = await axios.get<ProductResponse>(
                        `${process.env.PRODUCT_SERVER}/product/${productId}`
                    );
                    const cartItem: CartItem = {
                        productId: response.data.id,
                        quantity: Number(cartItems[key]),
                        name: response.data.name,
                    };
                    return cartItem;
                }
            );

            const cartItemsWithDetails = await Promise.all(
                fetchProductPromises
            );
            res.status(200).json(cartItemsWithDetails);
        } catch (err) {
            next(err);
        }
    }

    static async addItem(req: Request, res: Response, next: NextFunction) {
        try {
            const { productId } = req.params;

            const { data } = await axios.get<ProductResponse>(
                `${process.env.PRODUCT_SERVER}/product/${productId}`
            );

            await client.hset(`cart:${req.userId}`, `product_id_${data.id}`, 1);
            res.status(200).json({
                message: "Item successfully added to cart",
            });
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
            const userId = req.userId;
            const { productId } = req.params;
            const { status } = req.query;

            if (
                !status ||
                (+status != IncrementStatus.INCREMENT &&
                    +status != IncrementStatus.DECREMENT)
            ) {
                throw { name: "Invalid increment status" };
            }

            const updatedQuantity = await client.hincrby(
                `cart:${userId}`,
                `product_id_${productId}`,
                +status
            );

            if (updatedQuantity <= 0) {
                await client.hdel(`cart:${userId}`, `product_id_${productId}`);
            }

            res.status(200).json({
                message: "item quantity updated successfully",
            });
        } catch (err) {
            next(err);
        }
    }

    static async deleteItem(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.userId;
            const { productId } = req.params;
            await client.hdel(`cart:${userId}`, `product_id_${productId}`);

            res.status(200).json({ message: "item deleted successfully" });
        } catch (err) {
            next(err);
        }
    }
}

export default CartController;
