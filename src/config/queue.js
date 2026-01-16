// src/config/queue.js

// import IORedis from "ioredis";

const connection = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
};

// let hasLoggedDown = false;

// const connection = new IORedis({
//   host: process.env.REDIS_HOST || "127.0.0.1",
//   port: process.env.REDIS_PORT || 6379,
//   password: process.env.REDIS_PASSWORD || undefined,

//   lazyConnect: true, // DO NOT connect on import

//   retryStrategy(times) {
//     if (!hasLoggedDown) {
//       console.warn("Redis (BullMQ) down. Queues disabled.");
//       hasLoggedDown = true;
//     }

//     return 5000; // retry every 5s silently
//   },

//   reconnectOnError() {
//     return true;
//   },
// });

// // Silence ioredis error spam
// connection.on("error", () => {});
// connection.on("connect", () => {
//   hasLoggedDown = false;
//   console.log("Redis (BullMQ) connected");
// });

export { connection };
