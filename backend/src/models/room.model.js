/*
2026.01.22 대규모 리팩토링 시작
*/

import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    roomName: {
      type: String,
      trim: true,
    },

    roomType: {
      type: String,
      enum: ["private", "group"],
      default: "private",
    },

    participants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },

        lastReadMessageId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Message",
        },

        lastReadAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // 방장
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.roomType === "group";
      },
    },

    //채팅방의 가장 최근 메시지
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  {
    timestamps: true,
  }
);

const Room = mongoose.model("Room", roomSchema);

export default Room;
