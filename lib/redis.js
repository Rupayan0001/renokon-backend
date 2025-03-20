import { Redis } from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = new Redis(process.env.REDIS_URI, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  connectTimeout: 10000,
  keepAlive: 5000,
});

redisClient.on("connect", () => {
  console.log("✅ Connected to Redis Cloud!");
});
redisClient.on("error", (err) => console.error("❌ Redis Error:", err));

export default redisClient;
