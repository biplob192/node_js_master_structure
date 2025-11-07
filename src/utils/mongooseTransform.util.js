// Utility to convert object keys to snake_case and remove sensitive fields
// src/utils/mongooseTransform.util.js

export const toSnakeCase = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map((item) => toSnakeCase(item));
  } else if (obj && typeof obj === "object") {
    const newObj = {};
    for (const key in obj) {
      const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
      newObj[snakeKey] = toSnakeCase(obj[key]);
    }
    return newObj;
  }
  return obj;
};

// export const mongooseToJSONTransform = (doc, ret) => {
//   // Convert _id → id (more readable)
//   if (ret._id) {
//     ret.id = ret._id.toString();
//     delete ret._id;
//   }

//   // Remove sensitive/internal fields
//   delete ret.password;
//   delete ret.__v;

//   // Convert ObjectIds and Dates to string
//   for (const key in ret) {
//     if (ret[key] instanceof Date) {
//       ret[key] = ret[key].toISOString();
//     } else if (ret[key]?._bsontype === "ObjectID") {
//       ret[key] = ret[key].toString();
//     }
//   }

//   // Optionally, move `id` to the top
//   const reordered = ret.id ? { id: ret.id, ...ret } : ret;

//   // Convert all keys to snake_case
// //   return toSnakeCase(ret);
//   return toSnakeCase(reordered);
// };

export const createMongooseTransform = (sensitiveFields = []) => {
  return (doc, ret) => {
    // Convert _id → id
    if (ret._id) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v; // optional, removes mongoose internal field
    }

    // Remove sensitive/internal fields
    sensitiveFields.forEach((field) => delete ret[field]);

    // Convert ObjectIds and Dates to string
    for (const key in ret) {
      if (ret[key] instanceof Date) {
        ret[key] = ret[key].toISOString();
      } else if (ret[key]?._bsontype === "ObjectID") {
        ret[key] = ret[key].toString();
      }
    }

    // Optionally, move `id` to the top
    const reordered = ret.id ? { id: ret.id, ...ret } : ret;

    // Convert all keys to snake_case
    return toSnakeCase(reordered);
  };
};
