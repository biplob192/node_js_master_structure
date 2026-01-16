// src/services/user.service.js

import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
// import redisClient from "../config/redis.js";
import { redisClient, isRedisAvailable } from "../config/redis.js";

// export const getUsers = async () => {
//   // Better to use a more specific key
//   const cacheKey = "users:all";

//   // Try to fetch from Redis
//   const cachedUsers = await redisClient.get(cacheKey);

//   if (cachedUsers) {
//     return JSON.parse(cachedUsers);
//   }

//   // Fetch from DB
//   const users = await User.find({});

//   // Throw error if not found
//   if (!users) throw new ApiError(404, "Users not found");

//   // Store in Redis cache (expire in 5 minutes – adjust as needed)
//   await redisClient.setEx(cacheKey, 300, JSON.stringify(users));

//   return users;
// };

export const getUsers = async () => {
  const cacheKey = "users:all";

  // Try Redis ONLY if available
  if (isRedisAvailable && redisClient.isOpen) {
    try {
      const cachedUsers = await redisClient.get(cacheKey);
      if (cachedUsers) {
        return JSON.parse(cachedUsers);
      }
    } catch (err) {
      console.warn("Redis GET failed, falling back to DB:", err.message);
    }
  }

  // Fetch from DB (main source)
  const users = await User.find({});
  if (!users) throw new ApiError(404, "Users not found");

  // Store in Redis (best-effort)
  if (isRedisAvailable && redisClient.isOpen) {
    try {
      await redisClient.setEx(cacheKey, 300, JSON.stringify(users));
    } catch (err) {
      console.warn("Redis SET failed:", err.message);
    }
  }

  return users;
};

export const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) throw new ApiError(404, "User not found");

  return user;
};
