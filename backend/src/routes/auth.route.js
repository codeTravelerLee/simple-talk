import express from "express";

import {
  getCurrentUser,
  login,
  logout,
  signup,
  sendEmailVerification,
  verifyEmailCode,
  saveAdditionalSignupInfo,
} from "../controllers/auth.controller.js";
import protectedRoute from "../middleware/protectedRoute.js";

const router = express.Router();

router.get("/current", protectedRoute, getCurrentUser); //현재 로그인된 유저

router.post("/signup", signup);
router.post("/send-email-verification", sendEmailVerification);
router.post("/verify-email-code", verifyEmailCode);
router.post(
  "/signup/additional-info",
  protectedRoute,
  saveAdditionalSignupInfo
); //추가 회원정보 저장

router.post("/login", login);
router.post("/logout", protectedRoute, logout);

export default router;
