/*
2026.01.22 대규모 리팩토링 시작
*/

import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    // 해당 메시지가 속한 채팅방 ID
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    messageType: {
      type: String,
      enum: ["text", "image"],
      default: "text",
    },

    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
