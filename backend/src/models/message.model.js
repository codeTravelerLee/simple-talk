import mongoose from "mongoose";

/*
 * Message 모델 - 메시지
 *
 * 수정사항: roomId 추가
 * - 각 메시지는 "채팅방"에 속함
 * - 1:1 채팅도 roomId를 통해 관리
 * - receiverId는 선택사항, roomId는 필수
 */

const messageSchema = new mongoose.Schema(
  {
    // 보낸 사람
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 받는 사람 (1:1 채팅)
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    // 해당 메시지가 속한 채팅방 ID
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },

    // 메시지 내용
    message: {
      type: String,
    },

    // 이미지
    image: {
      type: String,
    },

    // 읽음 여부
    isRead: {
      type: Boolean,
      default: false,
    },

    // 읽은 시간
    readAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
