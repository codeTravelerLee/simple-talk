import Message from "../models/message.model.js";
import Room from "../models/room.model.js";

import multer from "multer";
import { emitMessage, emitMessagesRead } from "../lib/socket.js";
import { uploadImageToCloudinaryForChatting } from "../lib/cloudinary/uploadImage.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });

/*
2026.1.22 대규모 리팩토링 
-> 기존에는 1:1 채팅과 N:M 채팅 각각에서 텍스트, 이미지 메시지를 전송하는 API가 별도로 존재. (4개의 API가 존재하여 유지보수 어려움)
-> 하나의 API로 처리 가능하도록 통합  

-> messageType은 enum("text", "image") 범위 안에서만 값을 전달 
*/
export const sendMessage = [
  upload.single("image"),

  async (req, res) => {
    try {
      const { roomId, content, messageType } = req.body;
      const senderId = req.user._id;

      const room = await Room.findById(roomId);
      if (!room)
        return res.status(404).json({ error: "채팅방을 찾을 수 없습니다." });

      const isParticipant = room.participants.some(
        (p) => p.userId.toString() === senderId.toString()
      );
      if (!isParticipant)
        return res.status(403).json({ error: "권한이 없습니다." });

      let finalContent = content;
      let imageUrl = null;

      // 이미지 전송
      if (messageType === "image") {
        if (!req.file)
          return res.status(400).json({ error: "이미지 파일이 필요합니다." });

        // Cloudinary 업로드
        const { imageUrl, finalContent } =
          await uploadImageToCloudinaryForChatting(
            "chat_messages",
            req.file.buffer
          );

        imageUrl = imageUrl;
        finalContent = finalContent; // 방 목록에 표시될 텍스트
      }

      // 텍스트 전송
      if (messageType === "text") {
        if (!content || content.trim() === "") {
          return res.status(400).json({ error: "메시지 내용을 입력해주세요." });
        }
      }

      const newMessage = new Message({
        senderId,
        roomId,
        content: messageType === "text" ? content.trim() : imageUrl,
        messageType,
        readBy: [senderId], // 보낸 사람은 바로 읽음 처리
      });

      await newMessage.save();

      // 방 정보 업데이트
      room.lastMessage = finalContent;
      room.lastMessageAt = new Date();

      //해당 방에서 본인의 마지막 읽음 정보 업데이트
      const me = room.participants.find(
        (p) => p.userId.toString() === senderId.toString()
      );

      if (me) {
        me.lastReadAt = new Date();
        me.lastReadMessageId = newMessage._id;
      }

      await room.save();

      const populatedMessage = await newMessage.populate(
        "senderId",
        "fullName email profileImg"
      );

      // 메시지 실시간 전송 (Socket.io)
      room.participants.forEach((participant) => {
        if (participant.userId.toString() !== senderId.toString()) {
          emitMessage(participant.userId, populatedMessage);
        }
      });

      res.status(201).json({ message: "성공", newMessage: populatedMessage });
    } catch (error) {
      console.error("메시지 전송 에러:", error);
      res.status(500).json({ error: "서버 에러가 발생했습니다." });
    }
  },
];
