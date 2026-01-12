import Message from "../models/message.model.js";
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
