import { beforeEach } from "node:test";
import request from "supertest";
import app from "../src/app";
import prisma from "../src/prisma/client";

jest.mock("../src/prisma/client", () => {
    return {
        __esModule: true,
        default: {
            category: {
                findMany: jest.fn(),
            },
        },
    };
});

beforeEach(() => {
    jest.clearAllMocks();
});

describe("Testing GET /category endpoints", () => {
    test("should return status 200 on success", async () => {
        const mockCategories = [
            { id: 1, name: "Category 1" },
            { id: 2, name: "Category 2" },
        ];

        (prisma.category.findMany as jest.Mock).mockResolvedValue(
            mockCategories
        );

        const response = await request(app).get("/category");
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockCategories);
    });

    test("database error should return status 500", async () => {
        (prisma.category.findMany as jest.Mock).mockRejectedValue(
            new Error("Database error")
        );

        const response = await request(app).get("/category");

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: "Internal server error" });
    });
});
