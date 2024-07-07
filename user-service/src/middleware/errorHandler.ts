import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let message = "Internal server error";
    let code = 500;

    if (err instanceof ZodError) {
        message = err.errors[0].message;
        code = 400;
    } else if (err.name === "InvalidCredentials") {
        message = "Incorrect username/password";
        code = 401;
    } else if (err.name === "UserNotFound") {
        message = "User has not been registered";
        code = 400;
    }

    res.status(code).json({ message });
};

export default errorHandler;
