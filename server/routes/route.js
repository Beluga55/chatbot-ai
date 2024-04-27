import express from "express";
import userRoutes from "./userRoutes.js";

const router = express.Router();

// ROUTING FILES
router.use("/users", userRoutes);

export default router; 