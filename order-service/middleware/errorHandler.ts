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

    console.log(err);
    if (axios.isAxiosError(err)) {
        message = err.response?.data.message;
        code = err.response?.status!;
    }

    if (err.name === "TokenNotFound") {
        message = "No2 token found";
        code = 400;
    }

    if (err.name === "JsonWebTokenError") {
        message = "Invalid Token";
        code = 400;
    }

    res.status(code).json({ message });
};

export default errorHandler;
