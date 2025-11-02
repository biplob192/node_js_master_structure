import express from "express";
import indexRoutes from "./index.routes.js";
import authRoutes from "./auth.routes.js";
// import userRoutes from "./user.routes.js";

const router = express.Router();

router.use("/", indexRoutes);
router.use("/api/auth", authRoutes);
// router.use("/api/users", userRoutes);

export default router;
