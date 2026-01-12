import mongoose from "mongoose";

/*
 * Room 모델 - 단체 채팅방
 *
 *  1:1 채팅과 단체 채팅 모두를 위한 방
 *
 * 주요 필드:
 * - name: 채팅방 이름 (1:1 채팅은 자동 생성, 단체 채팅은 사용자가 지정)
 * - participants: 참여자 배열 (User ID들)
 * - isGroupChat: 단체 채팅 여부 (true: 단체, false: 1:1)
 * - createdBy: 방을 만든 사용자
 * - lastMessage: 마지막으로 보낸 메시지 (미리보기용)
 */

const roomSchema = new mongoose.Schema(
  {
    // 채팅방 이름
    name: {
      type: String,
      required: function () {
        // 단체 채팅일 때만 이름이 필수
        return this.isGroupChat;
      },
      trim: true,
    },

    // 참여자 목록 (최소 2명 - 1:1인 경우에도 자신을 포함함)
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    // 단체 채팅 여부
    isGroupChat: {
      type: Boolean,
      default: false,
    },

    // 방을 만든 사용자 (방장)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 마지막 메시지 (채팅방 목록에서 미리보기로 보여줌)
    lastMessage: {
      type: String,
      default: "",
    },

    // 마지막 메시지 시간
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt 자동 생성
  }
);

// 메시지 검색속도 단축을 위한 인덱스 
roomSchema.index({ participants: 1, lastMessageAt: -1 });

const Room = mongoose.model("Room", roomSchema);

export default Room;
