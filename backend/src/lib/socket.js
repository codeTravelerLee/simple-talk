import dotenv from "dotenv";
import { Server } from "socket.io";
import http from "http";
import express from "express";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, { cors: { origin: [process.env.CLIENT_URI] } });

const userSocketMap = {}; //socket에 접속한 사용자id와 socket연결의 세션id 매핑

io.on("connection", (socket) => {
  console.log(`new socket connection: ${socket.id} `);

  // TODO: userId를 토큰과 함께 받아 유효성 검증하는 로직으로 변경 필요
  const userId = socket.handshake.query.userId; //클라이언트가 쿼리스트링으로 보낸 userId값을 받아옴

  //사용자가 접속하면
  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  io.emit("getConnectedUserId", Object.keys(userSocketMap)); //접속자 목록 공유

  //사용자가 연결 해제하면
  socket.on("disconnect", () => {
    console.log(`socket disconnected...: ${socket.id}`);

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
