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
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));
redisClient.on("connect", () => console.log("Redis client created"));

/**
 * Connect Redis ONCE during app startup
 */
export async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log("Redis connected successfully");
  }
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
