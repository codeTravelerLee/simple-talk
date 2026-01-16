import express from "express";

import protectedRoute from "../middleware/protectedRoute.js";
import {
  getAllMessages,
  sendMessage,
  sendImageMessage,
  getChatList,
  getRoomMessages,
  sendRoomMessage,
  sendRoomImageMessage,
  markRoomMessagesAsRead,
} from "../controllers/message.controller.js";

const router = express.Router();

//채팅 목록 불러오기
router.get("/chats", protectedRoute, getChatList);

//로그인된 유저가 특정 유저와 주고받은 대화목록 전체를 불러오는 함수. id는 상대방의 id
router.get("/:id", protectedRoute, getAllMessages);

//상대방에게 텍스트 메시지를 전송
router.post("/", protectedRoute, sendMessage);

//이미지 메시지 전송
router.post("/send-image", protectedRoute, sendImageMessage);

//채팅방의 모든 메시지 읽음 처리
router.patch("/:roomId", protectedRoute, markRoomMessagesAsRead);

/*
 * 채팅방(Room) 기반 메시지 라우트
 */

// 채팅방 메시지 조회
router.get("/room/:roomId", protectedRoute, getRoomMessages);

// 채팅방에 텍스트 메시지 전송
router.post("/room", protectedRoute, sendRoomMessage);

// 채팅방에 이미지 메시지 전송
router.post("/room/image", protectedRoute, sendRoomImageMessage);

export default router;
