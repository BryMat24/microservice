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
    }

    res.status(code).json({ message });
};

export default errorHandler;
