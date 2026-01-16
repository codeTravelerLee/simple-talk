import dotenv from "dotenv";
import { Server } from "socket.io";
import http from "http";
import express from "express";
import User from "../models/user.model.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, { cors: { origin: [process.env.CLIENT_URI] } });

const userSocketMap = {}; //socket에 접속한 사용자id와 socket연결의 세션id 매핑

io.on("connection", async (socket) => {
  console.log(`new socket connection: ${socket.id} `);

  const userId = socket.handshake.query.userId;

  // userId 유효성 검증
  if (!userId || userId === "undefined" || userId === "null") {
    console.error("Invalid userId received. socket.js:", userId);
    return;
  }

  // 사용자가 접속하면
  userSocketMap[userId] = socket.id;

  // 사용자 온라인 상태로 업데이트
  try {
    await User.findByIdAndUpdate(userId, { lastSocketConnection: null });
  } catch (err) {
    console.error("Failed to update user lastSocketConnection:", err);
  }

  io.emit("getConnectedUserId", Object.keys(userSocketMap)); //접속자 목록 공유

  //사용자가 연결 해제하면
  socket.on("disconnect", async () => {
    console.log(`socket disconnected...: ${socket.id}`);

    // 사용자 오프라인 상태로 업데이트 (lastSocketConnection을 현재 시간으로 설정)
    if (userId) {
      try {
        await User.findByIdAndUpdate(userId, {
          lastSocketConnection: new Date(),
        });
      } catch (err) {
        console.error("Failed to update user lastSocketConnection:", err);
      }
    }

    delete userSocketMap[userId];
    io.emit("getConnectedUserId", Object.keys(userSocketMap));
  });
});

export { app, server, io };

// 메시지 전송 시 실시간으로 상대방에게 전송
export const emitMessage = (receiverId, message) => {
  const receiverSocketId = userSocketMap[receiverId];
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("newMessage", message);
  }
};

// 읽음 처리 시 실시간으로 해당 채팅방의 모든 참여자에게 알림
export const emitMessagesRead = (roomId, participantIds, readByUserId) => {
  participantIds.forEach((participantId) => {
    const participantIdStr = participantId.toString();
    if (participantIdStr !== readByUserId.toString()) {
      const socketId = userSocketMap[participantIdStr];
      if (socketId) {
        io.to(socketId).emit("messagesRead", { roomId, readByUserId });
      }
    }
  });
};
