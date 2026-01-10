import express from "express";

import protectedRoute from "../middleware/protectedRoute.js";
import {
  getAllMessages,
  sendMessage,
  sendImageMessage,
} from "../controllers/message.controller.js";

const router = express.Router();

//로그인된 유저가 특정 유저와 주고받은 대화목록 전체를 불러오는 함수. id는 상대방의 id
router.get("/:id", protectedRoute, getAllMessages);

//상대방에게 텍스트 메시지를 전송
router.post("/", protectedRoute, sendMessage);

//이미지 메시지 전송
router.post("/send-image", protectedRoute, sendImageMessage);

export default router;
