import express from "express";
import protectedRoute from "../middleware/protectedRoute.js";
import {
  createRoom,
  getRooms,
  getRoomById,
  leaveRoom,
  inviteMembersToRoom,
} from "../controllers/room.controller.js";

const router = express.Router();

//채팅방 생성
router.post("/", protectedRoute, createRoom);

//내가 속해있는 채팅방 리스트 반환
router.get("/list", protectedRoute, getRooms);

//특정 채팅방 정보 조회
router.get("/:roomId", protectedRoute, getRoomById);

//채팅방 나가기
router.delete("/:roomId/member/:userId", protectedRoute, leaveRoom);

//채팅방에 초대 - 1명 이상을 body로 전달
router.post("/:roomId/members", protectedRoute, inviteMembersToRoom);

export default router;
