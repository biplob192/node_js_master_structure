// src/utils/withCache.js

import { redisClient, isRedisAvailable } from "../config/redis.js";

export const withCache = async (key, ttl, callback) => {
  if (!isRedisAvailable || !redisClient.isOpen) {
    return callback();
  }

  const cached = await redisClient.get(key);
  if (cached) return JSON.parse(cached);

  const result = await callback();
  await redisClient.setEx(key, ttl, JSON.stringify(result));

  return result;
};
