import { Request, Response, NextFunction } from "express";

const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let message = "Internal server error";
    let code = 500;

    if (err.name == "ProductNotFound") {
        message = "Product doesn't exist";
        code = 404;
    }

    res.status(code).json({ message });
};

export default errorHandler;
