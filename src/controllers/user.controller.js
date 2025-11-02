// src/controllers/user.controller.js

import { registerValidation } from "../validations/user.validation.js";
import { registerUser } from "../services/user.service.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

export const register = async (req, res, next) => {
  try {
    // Validate request body
    const { error, value } = registerValidation.validate(req.body);
    if (error) {
      throw new ApiError(400, error.details[0].message);

      // return res.status(400).json({
      //   status: "fail",
      //   message: error.details[0].message,
      // });
    }

    // Perform registration logic
    const user = await registerUser(value);

    // Send success response
    return ApiResponse.success(res, "User registered successfully", user, 201);

    // res.status(201).json({
    //   status: "success",
    //   message: "User registered successfully",
    //   data: user,
    // });
  } catch (err) {
    next(err); // Let the global error handler deal with it
  }
};

