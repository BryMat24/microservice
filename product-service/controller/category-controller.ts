import { Request, Response, NextFunction } from "express";
import prisma from "../prisma/client";

class CategoryController {
    static async getAllCategories(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const categories = await prisma.category.findMany();
            res.status(200).json({ categories });
        } catch (err) {
            next(err);
        }
    }
}

export default CategoryController;
