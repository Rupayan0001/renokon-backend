import redis from "redis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = redis.createClient({
  url: process.env.REDIS_URI,
  socket: {
    connectTimeout: 10000, // 10 seconds
    keepAlive: 5000, // Keep connection alive every 5 seconds
  },
});

redisClient.on("connect", () => {});
redisClient.on("error", (err) => console.error("❌ Redis Error:", err));

redisClient
  .connect()
  .then(() => console.log("✅ Connected to Redis Cloud!"))
  .catch((err) => console.error("❌ Redis Connection Failed:", err));

export default redisClient;
