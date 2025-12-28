import express from "express";

import protectedRoute from "../middleware/protectedRoute.js";
import { updateProfile } from "../controllers/user.controller.js";

const router = express.Router();

router.patch("/profile", protectedRoute, updateProfile);

export default router;
