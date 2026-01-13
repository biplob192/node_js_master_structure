// src/services/user.service.js

import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import redisClient from "../config/redis.js";

export const getUsers = async () => {
  // Better to use a more specific key
  const cacheKey = "users:all";

  // Try Redis cache
  const cachedUsers = await redisClient.get(cacheKey);

  if (cachedUsers) {
    return JSON.parse(cachedUsers);
  }

  // Fetch from DB
  const users = await User.find({});

  // Store in Redis (optional TTL: 1 hour)
  await redisClient.set(cacheKey, JSON.stringify(users), "EX", 60 * 60);

  // Store in cache (expire in 5 minutes – adjust as needed)
  // await redisClient.setEx(cacheKey, 300, JSON.stringify(data));

  return users;
};

export const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) throw new ApiError(404, "User not found");

  return user;
};
