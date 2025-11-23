// src/utils/databaseTransaction.js

import mongoose from "mongoose";

/**
 * Reusable transaction helper for Mongoose.
 *
 * Usage:
 * return await runTransaction(async (session) => {
 *   await User.updateOne({ _id: id }, { $set: data }).session(session);
 * });
 *
 * Automatically:
 * - creates a session
 * - runs a transaction
 * - commits or rolls back
 * - forwards errors
 *
 * @param {Function} callback - The function that receives the session
 */
export const runTransaction = async (callback) => {
  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      result = await callback(session);
    });

    return result;
  } catch (error) {
    throw error; // allow global handler to catch
  } finally {
    session.endSession();
  }
};

export const withTransaction = (serviceFn) => {
  return async (payload, session = undefined) => {
    // Case 1 — explicitly disable transaction
    if (session === false) {
      return await serviceFn(payload, null);
    }

    // Case 2 — no session passed, so create a new transaction
    if (!session) {
      return await runTransaction(async (trx) => {
        return await serviceFn(payload, trx);
      });
    }

    // Case 3 — session is provided, use existing transaction
    if (session && typeof session.startTransaction === "function") {
      return await serviceFn(payload, session);
    }

    // If session is invalid or unexpected:
    throw new Error("Invalid session passed to withTransaction");

    // Case 3 — session is provided, use existing transaction
    // return await serviceFn(payload, session);
  };
};
