import { createClient } from "redis";

let isRedisAvailable = false;
const MAX_STARTUP_RETRIES = 3;
let hasLoggedDown = false;

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
  // If has password or cloud redis:
  // password: process.env.REDIS_PASSWORD,
  // socket: { host: 'your-redis-host', port: 6379 }

  socket: {
    connectTimeout: 5000,

    reconnectStrategy: (retries) => {
      if (retries >= MAX_STARTUP_RETRIES) {
        if (!hasLoggedDown) {
          console.warn("Redis down. Cache disabled.");
          hasLoggedDown = true;
        }

        return 5000; // keep retrying every 5s
        // return false; // stop retrying
      }

      return Math.min(retries * 500, 5000);
    },
  },
});

/* -------------------- Events -------------------- */

redisClient.on("connect", () => {
  // console.log("Redis client created");
  console.log("Redis socket opened (not ready yet)");
});

redisClient.on("ready", () => {
  console.log("Redis connected");
  isRedisAvailable = true;
  hasLoggedDown = false;
});

redisClient.on("end", () => {
  if (isRedisAvailable) {
    console.warn("Redis disconnected");
  }
  isRedisAvailable = false;
});

redisClient.on("error", (err) => {
  if (isRedisAvailable) {
    console.warn("Redis error:", err.message);
  }
  isRedisAvailable = false;
});

/* -------------------- Initial Connect -------------------- */

export async function connectRedis() {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch {
    console.warn("Initial Redis connection failed. App will continue.");
    isRedisAvailable = false;
  }
}

/* -------------------- Exports -------------------- */

export default redisClient;
export { redisClient, isRedisAvailable };
