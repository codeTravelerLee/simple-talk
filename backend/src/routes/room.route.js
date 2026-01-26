import express from "express";
import protectedRoute from "../middleware/protectedRoute.js";
import {
  createRoom,
  getRoomById,
  leaveRoom,
  inviteMembersToRoom,
  getAllChattingRooms,
  getAllMessages,
} from "../controllers/room.controller.js";

const router = express.Router();

//내가 속한 모든 채팅방 불러오기
router.get("/all", protectedRoute, getAllChattingRooms);

//채팅방의 채팅내역을 불러오는 함수 (id는 room id)
router.get("/history/:id", protectedRoute, getAllMessages);

//채팅방 생성
router.post("/", protectedRoute, createRoom);

//특정 채팅방 정보 조회
router.get("/:roomId", protectedRoute, getRoomById);

//채팅방 나가기
router.patch("/:roomId/member/:leaveUserId", protectedRoute, leaveRoom);

//채팅방에 초대 - 1명 이상을 body로 전달
router.patch("/:roomId/newMembers", protectedRoute, inviteMembersToRoom);

export default router;
