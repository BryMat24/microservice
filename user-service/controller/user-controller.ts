import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../prisma/client";
import { registerSchema } from "../schema/user-schema";

class UserController {
    public static async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;
            const user = await prisma.user.findUnique({
                where: {
                    email,
                },
            });

            if (!user) {
                throw { name: "UserNotFound" };
            }

            const match = await bcrypt.compare(password, user.password);
            if (match) {
                const token = jwt.sign(
                    { id: user?.id, email },
                    process.env.JWT_SECRET as string
                );
                res.status(200).json({
                    message: "login successful",
                    token,
                    username: user?.name,
                });
            } else {
                throw { name: "InvalidCredentials" };
            }
        } catch (err) {
            next(err);
        }
    }

    public static async register(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { name, email, password } = req.body;
            registerSchema.parse({ name, email, password });
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(password, salt);
            await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hash,
                },
            });
            res.status(200).json({ message: "register successful" });
        } catch (err) {
            next(err);
        }
    }
}

export default UserController;
