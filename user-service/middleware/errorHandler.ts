import { Request, Response, NextFunction } from "express";

const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let message = "Internal server error";
    let code = 500;

    if (err.name === "InvalidCredentials") {
        message = "Incorrect username/password";
        code = 400;
    } else if (err.name === "UserNotFound") {
        message = "User has not been registered";
        code = 400;
    }

    res.status(code).json({ message });
};

export default errorHandler;
