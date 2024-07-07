import { Request, Response, NextFunction } from "express";
import prisma from "../prisma/client";
import { querySchema } from "../schema/product-schema";

class ProductController {
    static async getAllProducts(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const queryParams = querySchema.parse(req.query);
            const filter: any = {
                status: "available",
            };

            if (queryParams.category) {
                filter.category = {
                    name: queryParams.category,
                };
            }

            const products = await prisma.product.findMany({
                skip: (queryParams.page - 1) * Number(process.env.PAGE_SIZE!),
                take: Number(process.env.PAGE_SIZE!),
                where: filter,
            });

            const totalProducts = await prisma.product.count();
            const totalPages = Math.ceil(
                totalProducts / Number(process.env.PAGE_SIZE!)
            );
            res.status(200).json({
                products,
                totalPages,
            });
        } catch (err) {
            console.log(err);
            next(err);
        }
    }

    static async getProductById(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { id } = req.params;
            const product = await prisma.product.findUnique({
                where: { id: Number(id) },
            });
            if (!product) throw { name: "ProductNotFound" };
            res.status(200).json(product);
        } catch (err) {
            next(err);
        }
    }
}

export default ProductController;
