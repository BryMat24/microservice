import { createClient } from "redis";

const client = createClient({
    url: "redis://cart-store:6379",
});

client.on("error", (err) => {
    console.error("Redis connection error:", err);
});

export default client;
