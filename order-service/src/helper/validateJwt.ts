import { Request } from "express";
import jwt from "jsonwebtoken";

export function extractToken(req: Request): string {
    if (
        req.headers.authorization &&
        req.headers.authorization.split(" ")[0] === "Bearer"
    ) {
        return req.headers.authorization.split(" ")[1];
    } else {
        throw { name: "TokenNotFound" };
    }
}

export function verify(token: string) {
    return jwt.verify(token, process.env.JWT_SECRET as string);
}
