// src/controllers/user.controller.js

import ApiResponse from "../utils/ApiResponse.js";
import { getUserProfile } from "../services/user.service.js";

// GET PROFILE
export const getProfile = async (req, res, next) => {
  // Get user profile data from service
  const data = await getUserProfile(req.user.id);

  // Return response
  return ApiResponse.success(res, "Profile fetched", data);
};