// src/utils/wrapRoutes.js

import { asyncHandler } from "./asyncHandler.js";

/**
 * Wraps all route handlers in the given Express router with `asyncHandler`.
 *
 * This ensures that any errors thrown inside async route handlers are automatically
 * caught and forwarded to the global error handler, eliminating the need for
 * try/catch blocks inside controllers.
 *
 * @param {express.Router} router - The Express router to wrap
 * @returns {express.Router} - The same router with all handlers wrapped
 */

export const wrapRoutes = (router) => {
  router.stack.forEach((layer) => {
    if (layer.route) {
      layer.route.stack.forEach((routeLayer) => {
        const fn = routeLayer.handle;
        routeLayer.handle = asyncHandler(fn);
      });
    }
  });
  return router;
};
