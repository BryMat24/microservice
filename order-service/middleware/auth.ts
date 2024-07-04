import { Request, Response, NextFunction } from "express";
import { extractToken, verify } from "../helper/validateJwt";
import { jwtPayloadSchema } from "../schema/jwt-schema";

export default (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = extractToken(req);
        const payload = verify(token);
        jwtPayloadSchema.parse(payload);
        const { id } = payload;
        req.userId = id;
        next();
    } catch (err) {
        next(err);
    }
};
