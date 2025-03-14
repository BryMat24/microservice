import { Request, Response, NextFunction } from "express";
import axios, { AxiosError } from "axios";

const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let message = "Internal server error";
    let code = 500;

    if (axios.isAxiosError(err)) {
        message = err.response?.data.message;
        code = err.response?.status!;
    } else if (err.name === "TokenNotFound") {
        message = "No token found";
        code = 401;
    } else if (err.name === "InvalidStatus") {
        message = "Invalid increment status";
        code = 400;
    } else if (err.name === "ProductEmptyStock") {
        message = "Product is not available";
        code = 400;
    } else if (err.name === "JsonWebTokenError") {
        message = "Invalid Token";
        code = 401;
    }

    res.status(code).json({ message });
};

export default errorHandler;
