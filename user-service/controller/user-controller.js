
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class UserController {
    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const user = await prisma.user.findUnique({
                where: {
                    email,
                },
            })

            if (!user) {
                throw { name: "UserNotFound" }
            }

            const match = await bcrypt.compare(password, user.password)
            if (match) {
                const token = jwt.sign({ email, password }, process.env.JWT_SECRET);
                res.status(200).json({ message: "login successful", token })
            } else {
                throw { name: "InvalidCredentials" }
            }
        } catch (err) {
            next(err);
        }
    }

    static async register(req, res, next) {
        try {
            const { name, email, password } = req.body;
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(password, salt);
            await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hash
                }
            })
            res.status(200).json({ message: "register successful" });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = UserController;