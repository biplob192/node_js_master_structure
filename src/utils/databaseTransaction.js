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
    // CASE 1:
    // session === false  => disable transaction
    // session === null   => explicitly no transaction
    if (session === false || session === null) {
      console.log("Session is false");

      return await serviceFn(payload, null);
    }

    // CASE 2: no session provided => create a new transaction
    if (typeof session === "undefined") {
      console.log("Session is undefined");
      return await runTransaction(async (trx) => {
        return await serviceFn(payload, trx);
      });
    }

    // CASE 3: session is a valid mongoose session => reuse it
    if (session && typeof session.startTransaction === "function") {
      console.log("Session is defined");
      return await serviceFn(payload, session);
    }

    // CASE 4: invalid session provided
    throw new Error("Invalid session passed to withTransaction");
  };

  // Do NOT use `if (!session)` here.
  // It treats ALL falsy values the same, which breaks transaction logic:
  //
  // Value        | !session | Problem
  // ----------------------------------------------
  // undefined    | true     | OK — means "no session passed"
  // null         | true     | WRONG — we want null to mean "no transaction"
  // false        | true     | WRONG — false explicitly disables transactions
  // 0            | true     | Wrong (rare but still incorrect)
  // ""           | true     | Wrong
  // {}           | false    | Not falsy but also NOT a valid session
  //
  // Always use `typeof session === "undefined"`
  // to detect ONLY the case where no session was passed.
};
