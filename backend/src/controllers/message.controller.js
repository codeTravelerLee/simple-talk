import Message from "../models/message.model.js";
import Room from "../models/room.model.js";

import cloudinary from "../lib/cloudinary.js";
import multer from "multer";
import { emitMessage } from "../lib/socket.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });

//로그인된 유저가 채팅한 상대방 목록을 불러오는 함수
export const getChatList = async (req, res) => {
  const myId = req.user._id;

  try {
    const chats = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: myId }, { receiverId: myId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$senderId", myId] },
              then: "$receiverId",
              else: "$senderId",
            },
          },
          lastMessage: { $first: "$$ROOT" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $addFields: {
          user: { $arrayElemAt: ["$user", 0] },
        },
      },
      {
        $project: {
          user: 1,
          lastMessage: 1,
        },
      },
      {
        $sort: { "lastMessage.createdAt": -1 },
      },
    ]);

    res.status(200).json({
      message: "채팅 목록을 불러왔어요.",
      chats,
    });
  } catch (error) {
    console.error(`채팅 목록 불러오는 도중 에러 발생: ${error}`);
    res.status(500).json({ error: "internal server error..." });
  }
};

//로그인된 유저가 특정 유저와 주고받은 대화목록 전체를 불러오는 함수
export const getAllMessages = async (req, res) => {
  const { id: receipientId } = req.params; //상대방id
  const myId = req.user._id; //내 아이디

  try {
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: receipientId },
        { senderId: receipientId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 }); //과거 대화 먼저

    //성공 응답시 보낼 멘트
    const responseSentence =
      messages.length === 0
        ? "나눈 대화내역이 없어요."
        : "채팅 내역을 불러왔어요.";

    res.status(200).json({
      message: responseSentence,
      messagesArray: messages,
    });
  } catch (error) {
    console.error(`채팅 내역 불러오는 도중 에러 발생: ${error}`);
    res.status(500).json({ error: "internal server error..." });
  }
};

//상대방에게 메시지를 전송하는 함수
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user._id;

    //메시지 내용이 비어있는지 확인
    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "메시지 내용을 입력해주세요." });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      message: message.trim(),
    });

    await newMessage.save();

    // 실시간 전송
    emitMessage(receiverId, newMessage);

    res.status(201).json({
      message: "메시지가 성공적으로 전송되었어요.",
      newMessage,
    });
  } catch (error) {
    console.error(`메시지 전송 중 에러 발생: ${error}`);
    res.status(500).json({ error: "internal server error..." });
  }
};

//이미지 메시지를 전송하는 함수
export const sendImageMessage = [
  upload.single("image"), //클라이언트가 보낸 formData중 key가 image인 파일을 req.file에 업로드
  //req.file에 이미지 저장 완료후 수행로직
  async (req, res) => {
    try {
      const { receiverId } = req.body;
      const senderId = req.user._id;

      if (!req.file) {
        return res.status(400).json({ error: "이미지 파일이 필요합니다." });
      }

      // Cloudinary에 업로드
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "messages" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      const newMessage = new Message({
        senderId,
        receiverId,
        image: uploadResult.secure_url,
      });

      await newMessage.save();

      // 실시간 전송
      emitMessage(receiverId, newMessage);

      res.status(201).json({
        message: "이미지가 성공적으로 전송되었어요.",
        newMessage,
      });
    } catch (error) {
      console.error(`이미지 메시지 전송 중 에러 발생: ${error}`);
      res.status(500).json({ error: "internal server error..." });
    }
  },
];

/*
 * ========================================
 * 채팅방(Room) 기반 메시지 함수들
 * ========================================
 */

//특정 채팅방의 모든 메시지 불러오기
export const getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const currentUserId = req.user._id;

    // 채팅방이 존재하는지 확인
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        message: "채팅방을 찾을 수 없습니다.",
      });
    }

    // 본인이 참여자인지 확인
    const isParticipant = room.participants.some(
      (participantId) => participantId.toString() === currentUserId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        message: "이 채팅방에 접근할 권한이 없습니다.",
      });
    }

    // 채팅방의 모든 메시지 가져오기 (시간순 정렬)
    const messages = await Message.find({ roomId })
      .populate("senderId", "fullName email profileImg")
      .sort({ createdAt: 1 }); // 오래된 메시지부터

    const responseSentence =
      messages.length === 0
        ? "아직 메시지가 없습니다."
        : "채팅 내역을 불러왔습니다.";

    res.status(200).json({
      message: responseSentence,
      messagesArray: messages,
    });
  } catch (error) {
    console.error(`채팅방 메시지 조회 중 에러 발생:`, error);
    res.status(500).json({
      message: "채팅방 메시지 조회 중 오류가 발생했습니다.",
    });
  }
};

//채팅방에서 메시지 보내기
export const sendRoomMessage = async (req, res) => {
  try {
    const { roomId, message } = req.body;
    const senderId = req.user._id;

    // 메시지 내용 확인
    if (!message || message.trim() === "") {
      return res.status(400).json({
        message: "메시지 내용을 입력해주세요.",
      });
    }

    // 채팅방 존재 및 권한 확인
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        message: "채팅방을 찾을 수 없습니다.",
      });
    }

    const isParticipant = room.participants.some(
      (participantId) => participantId.toString() === senderId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        message: "이 채팅방에 메시지를 보낼 권한이 없습니다.",
      });
    }

    // 메시지 생성
    const newMessage = new Message({
      senderId,
      roomId,
      message: message.trim(),
    });

    await newMessage.save();

    // 채팅방의 마지막 메시지 업데이트
    room.lastMessage = message.trim();
    room.lastMessageAt = new Date();
    await room.save();

    // 메시지를 populate해서 반환
    const populatedMessage = await Message.findById(newMessage._id).populate(
      "senderId",
      "fullName email profileImg"
    );

    // 실시간 전송 (채팅방의 모든 참여자에게)
    room.participants.forEach((participantId) => {
      if (participantId.toString() !== senderId.toString()) {
        emitMessage(participantId, populatedMessage);
      }
    });

    res.status(201).json({
      message: "메시지가 성공적으로 전송되었습니다.",
      newMessage: populatedMessage,
    });
  } catch (error) {
    console.error(`채팅방 메시지 전송 중 에러 발생:`, error);
    res.status(500).json({
      message: "메시지 전송 중 오류가 발생했습니다.",
    });
  }
};

//채팅방에 이미지 메시지 보내기
export const sendRoomImageMessage = [
  upload.single("image"),

  async (req, res) => {
    try {
      const { roomId } = req.body;
      const senderId = req.user._id;

      if (!req.file) {
        return res.status(400).json({
          message: "이미지 파일이 필요합니다.",
        });
      }

      // 채팅방 존재 및 권한 확인
      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({
          message: "채팅방을 찾을 수 없습니다.",
        });
      }

      const isParticipant = room.participants.some(
        (participantId) => participantId.toString() === senderId.toString()
      );

      if (!isParticipant) {
        return res.status(403).json({
          message: "이 채팅방에 메시지를 보낼 권한이 없습니다.",
        });
      }

      // Cloudinary에 이미지 업로드
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "room_messages" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      // 메시지 생성
      const newMessage = new Message({
        senderId,
        roomId,
        image: uploadResult.secure_url,
      });

      await newMessage.save();

      // 채팅방의 마지막 메시지 업데이트
      room.lastMessage = "사진을 보냈습니다.";
      room.lastMessageAt = new Date();
      await room.save();

      // 메시지 populate
      const populatedMessage = await Message.findById(newMessage._id).populate(
        "senderId",
        "fullName email profileImg"
      );

      // 전송
      room.participants.forEach((participantId) => {
        if (participantId.toString() !== senderId.toString()) {
          emitMessage(participantId, populatedMessage);
        }
      });

      res.status(201).json({
        message: "이미지가 성공적으로 전송되었습니다.",
        newMessage: populatedMessage,
      });
    } catch (error) {
      console.error(`채팅방 이미지 전송 중 에러 발생:`, error);
      res.status(500).json({
        message: "이미지 전송 중 오류가 발생했습니다.",
      });
    }
  },
];

//채팅방 메시지들을 한 번에 읽음 처리
export const markRoomMessagesAsRead = async (req, res) => {
  const { roomId } = req.params;
  const currentUserId = req.user._id;

  try {
    // 채팅방 존재 및 권한 확인
    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        message: "채팅방을 찾을 수 없습니다.",
      });
    }

    // 요청을 보낸 사람이 채팅방의 참여자인지 확인 
    const isParticipant = room.participants.some(
      (participantId) => participantId.toString() === currentUserId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        message: "이 채팅방에 접근할 권한이 없습니다.",
      });
    }

    // 상대방이 보낸 메시지만 읽음 처리 (내가 보낸거 말고)
    const result = await Message.updateMany(
      {
        roomId,
        senderId: { $ne: currentUserId }, // 내가 보낸 메시지 제외
        isRead: false, // 아직 읽지 않은 메시지만
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    );

    res.status(200).json({
      message: "채팅방의 메시지를 읽음 처리했습니다.",
      modifiedCount: result.modifiedCount, // 읽은 메시지의 수 
    });
  } catch (error) {
    console.error(`채팅방 메시지 읽음 처리 중 에러 발생:`, error);
    return res.status(500).json({
      message: "메시지 읽음 처리 중 오류가 발생했습니다.",
    });
  }
};
