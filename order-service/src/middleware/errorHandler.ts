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
    } else if (err.name === "JsonWebTokenError") {
        message = "Invalid Token";
        code = 401;
    } else if (err.name === "CartEmptyError") {
        message = "Invalid order request, cart is empty";
        code = 400;
    } else if (err.nmae === "InvalidOrderId") {
        message = "Order Id is invalid";
        code = 400;
    }

    res.status(code).json({ message });
};

export default errorHandler;
