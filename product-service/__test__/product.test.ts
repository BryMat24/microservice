import { beforeEach } from "node:test";
import request from "supertest";
import app from "../app";
import prisma from "../prisma/client";

jest.mock("../prisma/client", () => {
    return {
        __esModule: true,
        default: {
            product: {
                findMany: jest.fn(),
                count: jest.fn(),
                findUnique: jest.fn(),
            },
        },
    };
});

process.env.PAGE_SIZE = "10";

beforeEach(() => {
    jest.clearAllMocks();
});

describe("Testing GET /product endpoints", () => {
    test("on success should return status 200", async () => {
        const mockProducts = [
            {
                id: 3,
                name: "samsung",
                description: "phone",
                imageUrl:
                    "https://images.samsung.com/is/image/samsung/p6pim/id/sm-a057flghxid/gallery/id-galaxy-a05s-sm-a057-sm-a057flghxid-thumb-538374529",
                stock: 10,
                price: 800,
                status: "available",
                categoryId: 1,
            },
        ];
        const mockTotalProducts = 1;

        (prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);
        (prisma.product.count as jest.Mock).mockResolvedValue(
            mockTotalProducts
        );

        const response = await request(app).get("/product").query({ page: 1 });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            products: mockProducts,
            totalPages: 1,
        });
    });

    test("database error should return status 500", async () => {
        (prisma.product.findMany as jest.Mock).mockRejectedValue(
            new Error("Database error")
        );

        const response = await request(app).get("/product").query({ page: 1 });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: "Internal server error" });
    });
});

describe("Testing GET /product/:id endpoints", () => {
    test("should return a product when valid ID is provided", async () => {
        const mockProduct = {
            id: 3,
            name: "samsung",
            description: "phone",
            imageUrl:
                "https://images.samsung.com/is/image/samsung/p6pim/id/sm-a057flghxid/gallery/id-galaxy-a05s-sm-a057-sm-a057flghxid-thumb-538374529",
            stock: 10,
            price: 800,
            status: "available",
            categoryId: 1,
        };
        (prisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);

        const response = await request(app).get("/product/3");
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockProduct);
    });

    test("should 404 ProductNotFound error when ID does not exist", async () => {
        const mockProduct = null;
        (prisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);

        const response = await request(app).get("/product/999");
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: "Product doesn't exist" });
    });

    test("should return 500 on server error", async () => {
        (prisma.product.findUnique as jest.Mock).mockRejectedValue(
            new Error("Database error")
        );

        const response = await request(app).get("/product/1");

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: "Internal server error" });
    });
});
