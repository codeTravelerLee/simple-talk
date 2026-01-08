import express from "express";

import {
  getCurrentUser,
  login,
  logout,
  signup,
} from "../controllers/auth.controller.js";
import protectedRoute from "../middleware/protectedRoute.js";

const router = express.Router();

router.get("/current", protectedRoute, getCurrentUser); //현재 로그인된 유저

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", protectedRoute, logout);

export default router;
