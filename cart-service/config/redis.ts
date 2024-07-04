import Redis from "ioredis";
const client = new Redis(6379, process.env.REDIS_HOST!);
export default client;
