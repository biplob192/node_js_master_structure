// src/validations/user.validation.js

import Joi from "joi";

export const registerValidation = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const loginValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  // device_id: Joi.string().required(),
  // device_info: Joi.string().optional(),
  deviceId: Joi.string().required(),
  deviceInfo: Joi.string().optional(),
});

export const verifyOtpValidation = Joi.object({
  userId: Joi.string().required(),
  otp: Joi.string().min(6).max(6).required(),
  deviceId: Joi.string().required(),
  deviceInfo: Joi.string().optional(),
});

export const verifySendOtpValidation = Joi.object({
  userId: Joi.string().optional(),
  email: Joi.string().email().optional(),
})
  .or("userId", "email") // At least one must be present
  .messages({
    "object.missing": "Either userId or email must be provided",
    "string.email": "Please provide a valid email address",
  });
