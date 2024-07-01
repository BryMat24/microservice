"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
class UserController {
    static login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const user = yield prisma.user.findUnique({
                    where: {
                        email,
                    },
                });
                if (!user) {
                    throw { name: "UserNotFound" };
                }
                console.log(user);
                const match = yield bcrypt_1.default.compare(password, user.password);
                if (match) {
                    const token = jsonwebtoken_1.default.sign({ email, password }, process.env.JWT_SECRET);
                    res.status(200).json({
                        message: "login successful",
                        token,
                        username: user === null || user === void 0 ? void 0 : user.name,
                    });
                }
                else {
                    throw { name: "InvalidCredentials" };
                }
            }
            catch (err) {
                next(err);
            }
        });
    }
    static register(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, email, password } = req.body;
                const salt = bcrypt_1.default.genSaltSync(10);
                const hash = bcrypt_1.default.hashSync(password, salt);
                yield prisma.user.create({
                    data: {
                        name,
                        email,
                        password: hash,
                    },
                });
                res.status(200).json({ message: "register successful" });
            }
            catch (err) {
                next(err);
            }
        });
    }
}
exports.default = UserController;
