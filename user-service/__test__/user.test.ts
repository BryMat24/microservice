import request from "supertest";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { server, app } from "../src/app";
import prisma from "../src/prisma/client";

jest.mock("../src/prisma/client", () => ({
    __esModule: true,
    default: {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
        },
    },
}));

jest.mock("jsonwebtoken", () => ({
    sign: jest.fn().mockReturnValue("mocked_token"),
}));

beforeEach(() => {
    jest.clearAllMocks();
});

afterAll(async () => {
    server.close();
});

describe("Testing POST /user/login", () => {
    test("should return a token on successful login 200", async () => {
        const mockUser = {
            id: 1,
            name: "John Doe",
            email: "john.doe@example.com",
            password: await bcrypt.hash("password123", 10),
        };

        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

        const response = await request(app)
            .post("/user/login")
            .send({ email: "john.doe@example.com", password: "password123" });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("token", "mocked_token");
        expect(response.body).toHaveProperty("message", "login successful");
        expect(response.body).toHaveProperty("username", "John Doe");
    });

    test("wrong credential should return 401", async () => {
        const mockUser = {
            id: 1,
            name: "John Doe",
            email: "john.doe@example.com",
            password: await bcrypt.hash("password123", 10),
        };

        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

        const response = await request(app)
            .post("/user/login")
            .send({ email: "john.doe@example.com", password: "wrongpassword" });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty(
            "message",
            "Incorrect username/password"
        );
    });

    test("User doesn't exist should return 400", async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

        const response = await request(app)
            .post("/user/login")
            .send({ email: "john.doe@example.com", password: "wrongpassword" });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty(
            "message",
            "User has not been registered"
        );
    });
});

describe("Testing POST /user/register endpoint", () => {
    test("successful register should return 200", async () => {
        const response = await request(app).post("/user/register").send({
            email: "john.doe@example.com",
            password: "password123",
            name: "john doe",
        });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("message", "register successful");
    });

    test("empty email should return 400", async () => {
        const response = await request(app).post("/user/register").send({
            password: "password123",
            name: "john doe",
        });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "Email is required");
    });

    test("empty name should return 400", async () => {
        const response = await request(app).post("/user/register").send({
            password: "password123",
            email: "john.doe@example.com",
        });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "Name is required");
    });

    test("empty password should return 400", async () => {
        const response = await request(app).post("/user/register").send({
            email: "john.doe@example.com",
            name: "john doe",
        });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "Password is required");
    });

    test("password too short should return 400", async () => {
        const response = await request(app).post("/user/register").send({
            email: "john.doe@example.com",
            name: "john doe",
            password: "john12",
        });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty(
            "message",
            "Must be 8 or more characters long"
        );
    });
});
