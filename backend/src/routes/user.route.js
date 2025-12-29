import express from "express";

import protectedRoute from "../middleware/protectedRoute.js";
import {
  deleteProfileImg,
  getUsers,
  updateProfile,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", protectedRoute, getUsers);
router.patch("/profile", protectedRoute, updateProfile);
router.delete("/profile-img", protectedRoute, deleteProfileImg);

export default router;
