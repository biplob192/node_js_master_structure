// src/controllers/user.controller.js

import ApiResponse from "../utils/ApiResponse.js";
import { getUsers, getPaginatedUsers, getUserProfile } from "../services/user.service.js";

// GET USERS
export const index = async (req, res, next) => {
  // Get users data from service
  const data = await getUsers();

  // Return response
  return ApiResponse.success(res, "Users fetched", data);
};

export const indexPaginate = async (req, res) => {
  const result = await getPaginatedUsers(req.query);

  return ApiResponse.success(res, "Users fetched", result);
};

// GET PROFILE
export const getProfile = async (req, res, next) => {
  // Get user profile data from service
  const data = await getUserProfile(req.user.id);

  // Return response
  return ApiResponse.success(res, "Profile fetched", data);
};
