
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

class UserController {
    static async login(req, res, next) {
        try {

        } catch (err) {
            next(err);
        }
    }

    static async register(req, res, next) {
        try {
            console.log(req.body);
        } catch (err) {
            next(err);
        }
    }
}

module.exports = UserController;