import request from "supertest";
import app from "../src/app";
import prisma from "../src/prisma/client";
import axios from "axios";
import { OrderStatus } from "../src/types/order-type";
import Stripe from "stripe";

// mocking
jest.mock("../src/prisma/client", () => {
    return {
        __esModule: true,
        default: {
            order: {
                findMany: jest.fn(),
                create: jest.fn(),
            },
            orderItem: {
                findMany: jest.fn(),
                createMany: jest.fn(),
            },
        },
    };
});

const mock_token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QGdtYWlsLmNvbSIsImlhdCI6MTcxOTk5ODYxNn0.so3Yie8_Z8qlqiAMRNlgAsaUibzWSzituwUeFECZO6s";
process.env.JWT_SECRET = "testsecretkey";
jest.mock("axios");

beforeEach(() => {
    jest.clearAllMocks();
});

describe("Testing POST /order endpoint", () => {
    test("on success should return status 200", async () => {
        const mockCart = {
            items: [
                { productId: 1, name: "Product 1", price: 100, quantity: 2 },
                { productId: 2, name: "Product 2", price: 50, quantity: 1 },
            ],
            totalPrice: 250,
        };

        const mockOrder = {
            id: 1,
            status: OrderStatus.PENDING,
            totalPrice: mockCart.totalPrice,
            userId: 1,
        };

        (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockCart });
        (axios.delete as jest.Mock).mockResolvedValueOnce({});
        (prisma.order.create as jest.Mock).mockResolvedValueOnce(mockOrder);
        (prisma.orderItem.createMany as jest.Mock).mockResolvedValueOnce({});

        const mockStripe = {
            checkout: {
                sessions: {
                    create: jest
                        .fn()
                        .mockResolvedValueOnce({ url: "http://mockurl" }),
                },
            },
        };

        jest.mock("stripe", () => {
            return jest.fn().mockImplementation(() => mockStripe);
        });

        const response = await request(app)
            .post("/order")
            .set("Authorization", `Bearer ${mock_token}`);

        expect(response.status).toBe(201);
        expect(response.body).toEqual({ url: "http://mockurl" });
        expect(prisma.order.create).toHaveBeenCalledWith({
            data: {
                status: OrderStatus.PENDING,
                totalPrice: mockCart.totalPrice,
                userId: 1,
            },
        });
        expect(prisma.orderItem.createMany).toHaveBeenCalledWith({
            data: [
                {
                    productId: 1,
                    orderId: mockOrder.id,
                    quantity: 2,
                    subTotal: 200,
                },
                {
                    productId: 2,
                    orderId: mockOrder.id,
                    quantity: 1,
                    subTotal: 50,
                },
            ],
        });
    });

    test("should return status 400 if cart is empty", async () => {
        const mockCart = { items: [], totalPrice: 0 };

        (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockCart });

        const response = await request(app)
            .post("/order")
            .set("Authorization", `Bearer ${mock_token}`);

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            message: "Invalid order request, cart is empty",
        });
    });

    test("unauthenticated (missing token) request should return 401", async () => {
        const response = await request(app).post("/order");
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ message: "No token found" });
    });

    test("unauthenticated (invalid token) request should return 401", async () => {
        const response = await request(app)
            .post("/order")
            .set("Authorization", "Bearer mockAuthToken");
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ message: "Invalid Token" });
    });

    test("should return status 500 on error", async () => {
        (axios.get as jest.Mock).mockRejectedValueOnce(
            new Error("Axios error")
        );

        const response = await request(app)
            .post("/order")
            .set("Authorization", `Bearer ${mock_token}`);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: "Internal server error" });
    });
});

describe("Testing GET /order endpoint", () => {
    test("on success should return order history for user and status 200", async () => {
        const mockOrderHistory = [
            {
                id: 1,
                totalPrice: 350,
                status: OrderStatus.PAID,
                userId: 1,
            },
            {
                id: 2,
                totalPrice: 200,
                status: OrderStatus.PAID,
                userId: 1,
            },
        ];

        (prisma.order.findMany as jest.Mock).mockResolvedValueOnce(
            mockOrderHistory
        );

        const response = await request(app)
            .get("/order")
            .set("Authorization", `Bearer ${mock_token}`);
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockOrderHistory);
    });

    test("database error should return status 500", async () => {
        (prisma.order.findMany as jest.Mock).mockRejectedValueOnce(
            new Error("Database error")
        );

        const response = await request(app)
            .get("/order")
            .set("Authorization", `Bearer ${mock_token}`);
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: "Internal server error" });
    });

    test("unauthenticated (missing token) request should return 401", async () => {
        const response = await request(app).get("/order");
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ message: "No token found" });
    });

    test("unauthenticated (invalid token) request should return 401", async () => {
        const response = await request(app)
            .get("/order")
            .set("Authorization", "Bearer mockAuthToken");
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ message: "Invalid Token" });
    });
});

describe("Testing GET /order/:id endpoint", () => {
    test("on success should return order detail for user and status 200", async () => {
        const orderItems = [
            {
                id: 1,
                productId: 3,
                orderId: 26,
                subTotal: 800,
                quantity: 1,
            },
            {
                id: 2,
                productId: 4,
                orderId: 26,
                subTotal: 1600,
                quantity: 2,
            },
        ];

        const products = [
            {
                id: 3,
                name: "Product 3",
                description: "Description 3",
                price: 800,
            },
            {
                id: 4,
                name: "Product 4",
                description: "Description 4",
                price: 800,
            },
        ];

        const expectedResponse = {
            items: orderItems.map((item, index) => ({
                id: item.id,
                product: products[index],
                orderId: item.orderId,
                subTotal: item.subTotal,
                quantity: item.quantity,
            })),
            totalPrice: orderItems.reduce(
                (accumulator, curr) => accumulator + curr.subTotal,
                0
            ),
        };

        (prisma.orderItem.findMany as jest.Mock).mockResolvedValue(orderItems);

        (axios.get as jest.Mock).mockImplementation((url: string) => {
            const productId = parseInt(url.split("/").pop() as string);
            const product = products.find((p) => p.id === productId);
            return Promise.resolve({ data: product });
        });

        const response = await request(app)
            .get("/order/26")
            .set("Authorization", `Bearer ${mock_token}`);
        expect(response.status).toBe(200);
        expect(response.body).toEqual(expectedResponse);
    });

    test("database error should return status 500", async () => {
        (prisma.orderItem.findMany as jest.Mock).mockRejectedValueOnce(
            new Error("Database error")
        );

        const response = await request(app)
            .get("/order/26")
            .set("Authorization", `Bearer ${mock_token}`);
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: "Internal server error" });
    });

    test("unauthenticated (missing token) request should return 401", async () => {
        const response = await request(app).get("/order/26");
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ message: "No token found" });
    });

    test("unauthenticated (invalid token) request should return 401", async () => {
        const response = await request(app)
            .get("/order/26")
            .set("Authorization", "Bearer mockAuthToken");
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ message: "Invalid Token" });
    });
});
