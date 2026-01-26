import express from "express";

import protectedRoute from "../middleware/protectedRoute.js";
import {
  deleteProfileImg,
  getUsers,
  getUserStatus,
  getBatchUserStatus,
  updateProfile,
  deleteAccount,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", protectedRoute, getUsers);

//사용자의 웹소켓 접속 상태 조회
router.get("/status/:userId", protectedRoute, getUserStatus); //1명
router.post(
  "/socket-connection/status/multiple",
  protectedRoute,
  getBatchUserStatus,
); //여러명

router.patch("/profile", protectedRoute, updateProfile);
router.delete("/profile-img", protectedRoute, deleteProfileImg);

router.delete("/", protectedRoute, deleteAccount);

export default router;
