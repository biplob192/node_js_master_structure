// Utility to convert object keys to snake_case
// src/utils/case.util.js

// Uncomment the following line if you want to use lodash
// import _ from "lodash";

// export const toSnakeCase = (obj) => {
//   if (Array.isArray(obj)) {
//     return obj.map((item) => toSnakeCase(item));
//   } else if (obj !== null && typeof obj === "object") {
//     return Object.keys(obj).reduce((acc, key) => {
//       const snakeKey = _.snakeCase(key);
//       acc[snakeKey] = toSnakeCase(obj[key]);
//       return acc;
//     }, {});
//   }
//   return obj;
// };

export const toSnakeCase = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(item => toSnakeCase(item));
  } else if (obj !== null && typeof obj === "object") {
    const newObj = {};
    for (const key in obj) {
      // Convert camelCase to snake_case
      const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
      newObj[snakeKey] = toSnakeCase(obj[key]);
    }
    return newObj;
  }
  return obj;
};