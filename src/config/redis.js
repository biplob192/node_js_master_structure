// src/config/redis.js

import { createClient } from "redis";
// ---------------------------------
// Option 01
// ---------------------------------

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
  // If has password or cloud redis:
  // password: process.env.REDIS_PASSWORD,
  // socket: { host: 'your-redis-host', port: 6379 }

  socket: {
    // Important for check if Redis is down
    reconnectStrategy: (retries) => {
      // Will not retry more than 10 times
      if (retries > 10) {
        console.log("Redis connection failed after 10 attempts. Giving up for now.");
        return new Error("Max retry attempts reached - Redis is down");
      }

      // Exponential backoff + random delay
      const delay = Math.min(retries * 500, 5000); // Upto 0.5s - 5s
      console.log(`Redis reconnect attempt ${retries} after ${delay}ms`);
      return delay;
    },

    // Timeout for connection
    connectTimeout: 5000, // Will be set to 5 seconds
  },
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));
redisClient.on("connect", () => console.log("Redis client created"));

/**
 * Connect Redis ONCE during app startup
 */
// export async function connectRedis() {
//   if (!redisClient.isOpen) {
//     await redisClient.connect();
//     console.log("Redis connected successfully");
//   }
// }

export async function connectRedis() {
  if (!redisClient.isOpen) {
    try {
      await redisClient.connect();
      console.log("Redis connected successfully");
    } catch (err) {
      console.error("Initial Redis connection failed:", err.message);
      // Throw error here will stop the app
      // So, don't throw error here
    }
  }
  return redisClient;
}

// Will be connect once on app start
// Import this in the app.js or server.js file to connect
// import { connectRedis } from './config/redis.js';
// await connectRedis(); // Redis connect here (ONCE)

export default redisClient;

// ---------------------------------
// Option 02
// ---------------------------------
// let redisClient;

// async function connectRedis() {
//   if (!redisClient) {
//     redisClient = createClient({
//       url: process.env.REDIS_URL || 'redis://localhost:6379'
//     });

//     redisClient.on('error', err => console.log('Redis Error:', err));

//     await redisClient.connect();
//     console.log('Redis Connected!');
//   }
//   return redisClient;
// }

// export default connectRedis;
