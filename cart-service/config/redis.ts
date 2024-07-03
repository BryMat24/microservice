import Redis from "ioredis";
const client = new Redis(6379, "cart-store");
export default client;
