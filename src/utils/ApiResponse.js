// src/utils/ApiResponse.js

export default class ApiResponse {
  static success(res, message, data = {}, statusCode = 200) {
    return res.status(statusCode).json({
      status: "success",
      message,
      data,
    });
  }

  static fail(res, message, statusCode = 400) {
    return res.status(statusCode).json({
      status: "fail",
      message,
    });
  }
}
