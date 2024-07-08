import app from "../app";
import request from "supertest";
import axios from "axios";
import client from "../config/redis";
import { IncrementStatus } from "../types/cart-type";

jest.mock("../config/redis", () => {
    return {
        __esModule: true,
        default: {
            hgetall: jest.fn(),
            hset: jest.fn(),
            hincrby: jest.fn(),
            hdel: jest.fn(),
            del: jest.fn(),
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

describe("Testing GET /cart endpoints", () => {
    test("on success should return user cart with status 200", async () => {
        const mockProducts = [
            {
                id: 1,
                imageUrl: "https://example.com/product1.jpg",
                name: "Product 1",
                price: 100,
                stock: 5,
                description: "description product 1",
                status: "available",
                categoryId: 1,
            },
            {
                id: 2,
                imageUrl: "https://example.com/product2.jpg",
                name: "Product 2",
                price: 800,
                stock: 3,
                description: "description product 2",
                status: "available",
                categoryId: 1,
            },
        ];

        (client.hgetall as jest.Mock).mockReturnValue({
            product_id_1: "2",
            product_id_2: "1",
        });

        (axios.get as jest.Mock).mockImplementation((url: string) => {
            const productId = Number(url.split("/").pop());
            return { data: mockProducts.find((el) => el.id == productId) };
        });

        const response = await request(app)
            .get("/cart")
            .set("Authorization", `Bearer ${mock_token}`);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            items: [
                {
                    productId: 1,
                    imageUrl: "https://example.com/product1.jpg",
                    name: "Product 1",
                    price: 100,
                    stock: 5,
                    quantity: 2,
                },
                {
                    productId: 2,
                    imageUrl: "https://example.com/product2.jpg",
                    quantity: 1,
                    name: "Product 2",
                    price: 800,
                    stock: 3,
                },
            ],
            totalPrice: 1000,
        });
    });

    test("Unauthorized request (missing token) should return 401", async () => {
        const response = await request(app).get("/cart");

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ message: "No token found" });
    });

    test("Unauthorized request (invalid token) should return 401", async () => {
        const response = await request(app)
            .get("/cart")
            .set("Authorization", `Bearer invalid_token`);

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ message: "Invalid Token" });
    });

    test("database error returns status 500", async () => {
        (client.hgetall as jest.Mock).mockImplementation(() => {
            throw new Error("Mock Redis error");
        });

        const response = await request(app)
            .get("/cart")
            .set("Authorization", `Bearer ${mock_token}`);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: "Internal server error" });
    });
});

describe("Testing POST /cart endpoints", () => {
    test("on success should return status 200", async () => {
        const mockProductId = 1;
        const mockProductResponse = {
            id: mockProductId,
            name: "Product 1",
            description: "description",
            imageUrl: "https://example.com/product1.jpg",
            stock: 5,
            price: 100,
            categoryId: 1,
            status: "available",
        };

        (axios.get as jest.Mock).mockResolvedValueOnce({
            data: mockProductResponse,
        });

        const response = await request(app)
            .post(`/cart/${mockProductId}`)
            .set("Authorization", `Bearer ${mock_token}`);

        expect(client.hset).toHaveBeenCalledWith(
            "cart:1",
            `product_id_${mockProductId}`,
            1
        );
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            message: "Item successfully added to cart",
        });
    });

    test("should handle unavailable product", async () => {
        const mockProductId = 2;
        const mockProductResponse = {
            id: mockProductId,
            name: "Product 2",
            description: "description",
            imageUrl: "https://example.com/product2.jpg",
            stock: 0,
            price: 80,
            categoryId: 2,
            status: "unavailable",
        };

        (axios.get as jest.Mock).mockResolvedValueOnce({
            data: mockProductResponse,
        });

        const response = await request(app)
            .post(`/cart/${mockProductId}`)
            .set("Authorization", `Bearer ${mock_token}`);

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: "Product is not available" });
    });

    test("Unauthorized request (missing token) should return 401", async () => {
        const response = await request(app).post("/cart/3");

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ message: "No token found" });
    });

    test("Unauthorized request (invalid token) should return 401", async () => {
        const response = await request(app)
            .post("/cart/3")
            .set("Authorization", `Bearer invalid_token`);

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ message: "Invalid Token" });
    });

    test("should handle axios network error", async () => {
        const mockProductId = "3";

        (axios.get as jest.Mock).mockRejectedValueOnce(
            new Error("Network error")
        );

        const response = await request(app)
            .post(`/cart/${mockProductId}`)
            .set("Authorization", `Bearer ${mock_token}`);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: "Internal server error" });
    });
});

describe("Testing PUT /cart/:productId endpoints", () => {
    test("on success should return status 200", async () => {
        const mockUserId = "1";
        const mockProductId = "1";
        const mockStatus = IncrementStatus.DECREMENT;
        // decrement status to 0
        const updatedQuantity = 0;
        (client.hincrby as jest.Mock).mockResolvedValueOnce(updatedQuantity);

        // delete current cart
        (client.hdel as jest.Mock).mockResolvedValueOnce(1);

        const response = await request(app)
            .put(`/cart/${mockProductId}?status=${mockStatus}`)
            .set("Authorization", `Bearer ${mock_token}`);

        expect(client.hincrby).toHaveBeenCalledWith(
            `cart:${mockUserId}`,
            `product_id_${mockProductId}`,
            +mockStatus
        );
        expect(client.hdel).toHaveBeenCalledWith(
            `cart:${mockUserId}`,
            `product_id_${mockProductId}`
        );
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            message: "item quantity updated successfully",
        });
    });

    test("invalid increment status returns status 400", async () => {
        const mockProductId = "1";
        const mockStatus = "invalid_status";

        const response = await request(app)
            .put(`/cart/${mockProductId}?status=${mockStatus}`)
            .set("Authorization", `Bearer ${mock_token}`);

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            message: "Invalid increment status",
        });
    });

    test("Unauthorized request (missing token) should return 401", async () => {
        const response = await request(app).put("/cart/3");

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ message: "No token found" });
    });

    test("Unauthorized request (invalid token) should return 401", async () => {
        const response = await request(app)
            .put("/cart/3")
            .set("Authorization", `Bearer invalid_token`);

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ message: "Invalid Token" });
    });

    test("database error returns status 500", async () => {
        const mockStatus = IncrementStatus.DECREMENT;
        const mockProductId = "1";
        (client.hincrby as jest.Mock).mockImplementation(() => {
            throw new Error("Mock Redis error");
        });

        const response = await request(app)
            .put(`/cart/${mockProductId}?status=${mockStatus}`)
            .set("Authorization", `Bearer ${mock_token}`);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: "Internal server error" });
    });
});

describe("Testing DELETE /cart/:productId endpoints", () => {
    test("on success should return status 200", async () => {
        const mockUserId = 1;
        const mockProductId = 1;
        (client.hdel as jest.Mock).mockResolvedValue(1);

        const response = await request(app)
            .delete(`/cart/${mockProductId}`)
            .set("Authorization", `Bearer ${mock_token}`);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: "Item deleted successfully" });
        expect(client.hdel).toHaveBeenCalledWith(
            `cart:${mockUserId}`,
            `product_id_${mockProductId}`
        );
    });

    test("Unauthorized request (missing token) should return 401", async () => {
        const mockProductId = 1;
        const response = await request(app).delete(`/cart/${mockProductId}`);

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ message: "No token found" });
    });

    test("Unauthorized request (invalid token) should return 401", async () => {
        const mockProductId = 1;
        const response = await request(app)
            .delete(`/cart/${mockProductId}`)
            .set("Authorization", `Bearer invalid_token`);

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ message: "Invalid Token" });
    });

    test("database error returns status 500", async () => {
        const mockProductId = 1;
        (client.hdel as jest.Mock).mockRejectedValue(
            new Error("Database error")
        );

        const response = await request(app)
            .delete(`/cart/${mockProductId}`)
            .set("Authorization", `Bearer ${mock_token}`);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: "Internal server error" });
    });
});

describe("Testing DELETE /cart endpoints", () => {
    test("on success should return status 200", async () => {
        const mockUserId = 1;
        (client.del as jest.Mock).mockResolvedValue(1);

        const response = await request(app)
            .delete(`/cart`)
            .set("Authorization", `Bearer ${mock_token}`);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: "Cart deleted successfully" });
        expect(client.del).toHaveBeenCalledWith(`cart:${mockUserId}`);
    });

    test("Unauthorized request (missing token) should return 401", async () => {
        const response = await request(app).delete(`/cart`);

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ message: "No token found" });
    });

    test("Unauthorized request (invalid token) should return 401", async () => {
        const response = await request(app)
            .delete(`/cart`)
            .set("Authorization", `Bearer invalid_token`);

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ message: "Invalid Token" });
    });

    test("database error returns status 500", async () => {
        (client.del as jest.Mock).mockRejectedValue(
            new Error("Database error")
        );

        const response = await request(app)
            .delete(`/cart`)
            .set("Authorization", `Bearer ${mock_token}`);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: "Internal server error" });
    });
});
