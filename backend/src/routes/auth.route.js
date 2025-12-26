import express from "express";

import { login, logout, signup } from "../controllers/auth.controller.js";
import protectedRoute from "../middleware/protectedRoute.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", protectedRoute, logout);

export default router;
