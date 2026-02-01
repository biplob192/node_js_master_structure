// src/services/user.service.js

import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
// import redisClient from "../config/redis.js";
import ApiFeatures from "../utils/ApiFeatures.js";
import { withCache } from "../utils/withCache.js";
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

// export const getPaginatedUsers = async (query) => {
//   const { page = 1, limit = 10, sort = "-created_at", search, fields, filter = {} } = query;

//   const pageNum = Math.max(parseInt(page), 1);
//   const limitNum = Math.min(parseInt(limit), 100);
//   const skip = (pageNum - 1) * limitNum;

//   // Base filter
//   const mongoFilter = { ...filter };

//   // Search
//   if (search) {
//     mongoFilter.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }];
//   }

//   // Field selection
//   const projection = fields ? fields.split(",").join(" ") : "-password -__v";

//   // Cache key (important!)
//   const cacheKey = `users:${JSON.stringify({
//     pageNum,
//     limitNum,
//     sort,
//     search,
//     filter,
//     fields,
//   })}`;

//   // Try cache
//   if (isRedisAvailable && redisClient.isOpen) {
//     const cached = await redisClient.get(cacheKey);
//     if (cached) return JSON.parse(cached);
//   }

//   // Query
//   const [data, total] = await Promise.all([
//     User.find(mongoFilter).select(projection).sort(sort.split(",").join(" ")).skip(skip).limit(limitNum).lean(),
//     User.countDocuments(mongoFilter),
//   ]);

//   if (!data) throw new ApiError(404, "Users not found");

//   const result = {
//     data,
//     meta: {
//       total,
//       page: pageNum,
//       limit: limitNum,
//       totalPages: Math.ceil(total / limitNum),
//       hasNextPage: skip + data.length < total,
//       hasPrevPage: pageNum > 1,
//     },
//   };

//   // Cache response
//   if (isRedisAvailable && redisClient.isOpen) {
//     await redisClient.setEx(cacheKey, 300, JSON.stringify(result));
//   }

//   return result;
// };

export const getPaginatedUsers = async (query) => {
  const cacheKey = `users:${JSON.stringify(query)}`;

  return withCache(cacheKey, 300, async () => {
    const features = new ApiFeatures(User, query, {
      searchableFields: ["name", "email"],
      defaultProjection: "-password -__v",
    });

    return features.filter().search().sort().selectFields().paginate().exec();
  });
};

export const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) throw new ApiError(404, "User not found");

  return user;
};
