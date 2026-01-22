import express from "express";

import protectedRoute from "../middleware/protectedRoute.js";
import { sendMessage } from "../controllers/message.controller.js";

const router = express.Router();

//메시지 전송
router.post("/", protectedRoute, sendMessage);

export default router;
