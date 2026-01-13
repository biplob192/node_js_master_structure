// src/controllers/user.controller.js

import ApiResponse from "../utils/ApiResponse.js";
import { getUsers, getUserProfile } from "../services/user.service.js";

// GET USERS
export const index = async (req, res, next) => {
  const data = await getUsers();

  return ApiResponse.fail(res, message, 409);
  
  return ApiResponse.success(res, "Users fetched", data);
};

// GET PROFILE
export const getProfile = async (req, res, next) => {
  // Get user profile data from service
  const data = await getUserProfile(req.user.id);

  // Return response
  return ApiResponse.success(res, "Profile fetched", data);
};
