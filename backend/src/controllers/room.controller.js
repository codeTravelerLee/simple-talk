import Message from "../models/message.model.js";
import Room from "../models/room.model.js";
import User from "../models/user.model.js";

//내가 속한 채팅방 목록 전체 불러오기
export const getAllChattingRooms = async (req, res) => {
  const myId = req.user._id;

  try {
    const chattingRoomsList = await Room.find({
      "participants.userId": myId,
    })
      .populate("participants.userId", "fullName email profileImg")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      message: "내가 속한 모든 채팅방을 불러왔습니다.",
      roomsArray: chattingRoomsList,
    });
  } catch (error) {
    console.error("내가 속한 채팅방 불러오기 오류:", error);
    res.status(500).json({
      message: "내가 속한 채팅방을 불러오는 중 오류가 발생했습니다.",
    });
  }
};

//특정 대화방의 채팅내역을 불러오는 함수 - 채팅방 진입시 호출
//채팅방 내에서 주고받은 메시지를 말풍선 안에 뿌려주는 형태로 활용
export const getAllMessages = async (req, res) => {
  const { id: roomId } = req.params;
  const myId = req.user._id;

  const MESSAGE_LIMIT_SIZE = 50; //한 번에 불러올 메시지 개수 제한 

  try {
    const messages = await Message.find({ roomId: roomId })
      .populate("senderId", "username profileImage")
      .sort({
        createdAt: -1,
      })
      .limit(MESSAGE_LIMIT_SIZE)
      .then((msgs) => msgs.reverse());

    //메시지 읽음 처리 - 해당 API는 채팅방에 진입할 때 호출되므로, 불러온 메시지들을 모두 읽음 처리
    if (messages.length > 0) {
      const lastMessageId = messages[messages.length - 1]._id;

      await Room.updateOne(
        { _id: roomId, "participants.userId": myId },
        {
          $set: {
            "participants.$.lastReadMessageId": lastMessageId,
            "participants.$.lastReadAt": new Date(),
          },
        }
      );

      await Message.updateMany(
        { roomId: roomId, senderId: { $ne: myId }, readBy: { $ne: myId } },
        { $addToSet: { readBy: myId } }
      );
    }

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

//채팅방 생성 (1:1, 단톡 포괄)
export const createRoom = async (req, res) => {
  try {
    const { participantIds, name } = req.body;
    const currentUserId = req.user._id; // 로그인한 사용자 (방을 만드는 사람)

    // 참여자가 전달되지 않은 경우, 배열이 아닌 경우
    if (!participantIds || !Array.isArray(participantIds)) {
      return res.status(400).json({
        message: "참여자 목록이 필요해요!",
      });
    }

    // 참여자는 최소 1명 이상 (본인 + 상대방)
    if (participantIds.length < 1) {
      return res.status(400).json({
        message: "대화 상대를 선택해주세요!",
      });
    }

    // 본인도 참여자에 포함 (중복 방지)
    const allParticipants = [
      ...new Set([currentUserId.toString(), ...participantIds]),
    ];

    //  단체 채팅인지 확인 (3명 이상이면 단체 채팅)
    const isGroupChat = allParticipants.length >= 3;

    // 단체 채팅인데 이름이 없으면 에러
    if (isGroupChat && !name) {
      return res.status(400).json({
        message: "생성할 단체 채팅방의 이름을 지어주세요!",
      });
    }

    // 1:1 채팅인 경우, 이미 존재하는 방이 있는지 확인
    if (!isGroupChat) {
      const existingRoom = await Room.findOne({
        isGroupChat: false,
        participants: { $all: allParticipants, $size: allParticipants.length },
      });

      if (existingRoom) {
        // 이미 1:1 채팅방이 있으면 그 방을 반환
        return res.status(200).json(existingRoom);
      }
    }

    // 참여자가 실제로 존재하는 사용자인지 확인
    const users = await User.find({ _id: { $in: allParticipants } });
    if (users.length !== allParticipants.length) {
      return res.status(400).json({
        message: "대화를 나눌 수 없는 상대가 포함되어 있어요.",
      });
    }

    // 채팅방 이름 설정
    let roomName = name;
    if (!isGroupChat) {
      // 1:1 채팅은 상대방 이름이 곧 방의 이름이 된다
      const singleChatPartner = users.find(
        (user) => user._id.toString() !== currentUserId.toString()
      );
      roomName = singleChatPartner.fullName;
    }

    // 채팅방 생성
    const newRoom = new Room({
      name: roomName,
      participants: allParticipants,
      isGroupChat,
      createdBy: currentUserId,
      lastMessage: "",
      lastMessageAt: new Date(),
    });

    await newRoom.save();

    // 참여자 정보를 포함해서 반환 (populate)
    const populatedRoom = await Room.findById(newRoom._id)
      .populate("participants", "fullName email profileImg")
      .populate("createdBy", "fullName email");

    res.status(201).json(populatedRoom);
  } catch (error) {
    console.error("채팅방 생성 오류:", error);
    res.status(500).json({
      message: "채팅방 생성 중 오류가 발생했습니다.",
    });
  }
};

export const getRoomById = async (req, res) => {
  try {
    const { roomId } = req.params;
    const currentUserId = req.user._id;

    const room = await Room.findById(roomId)
      .populate("participants", "fullName email profileImg")
      .populate("createdBy", "fullName email");

    if (!room) {
      return res.status(404).json({
        message: "채팅방을 찾을 수 없습니다.",
      });
    }

    // 본인이 참여자인지 확인
    const isParticipant = room.participants.some(
      (participant) => participant._id.toString() === currentUserId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        message: "이 채팅방에 접근할 권한이 없습니다.",
      });
    }

    res.status(200).json(room);
  } catch (error) {
    console.error("채팅방 조회 오류:", error);
    res.status(500).json({
      message: "채팅방 조회 중 오류가 발생했습니다.",
    });
  }
};

//채팅방 나가기
//본인이 스스로 나가는 경우, 방장이 탈퇴시키는 경우 두 가지로 고려
//방장이 탈퇴하는 경우엔 새로운 방장이 될 사람의 id를 query로 전달
export const leaveRoom = async (req, res) => {
  const { roomId, userId } = req.params; //userId는 탈퇴시킬 대상
  const requesterId = req.user._id;
  const { newRoomManagerId } = req.query; //방장이 탈퇴하는 경우 새로운 방장 id

  try {
    const room = await Room.findById(roomId);

    if (!room)
      return res.status(404).json({ message: "채팅방을 찾을 수 없습니다." });

    //채팅방 탈퇴의 경우의 수
    const isSelfLeaving = requesterId.toString() === userId; //자기 스스로 나가는 경우
    const isManagerLeavingAnother =
      room.createdBy.toString() === requesterId.toString() && !isSelfLeaving; //방장이 다른 사람을 탈퇴시키는 경우

    //자기 스스로 나가는 것도 아니고 방장도 아니면 탈퇴 권한 없음
    if (!isSelfLeaving && !isManagerLeavingAnother) {
      return res
        .status(403)
        .json({ message: "해당 사용자를 탈퇴시킬 권한이 없습니다!" });
    }

    const isRoomManager = room.createdBy.toString() === requesterId.toString();

    //방장이 스스로 나가는 경우 새로운 방장 지정
    if (isSelfLeaving && isRoomManager) {
      // 새로운 방장을 지정하지 않은 경우
      if (!newRoomManagerId) {
        return res.status(400).json({
          message: "방장이 탈퇴하는 경우 새로운 방장을 지정해야 합니다!",
        });
      }

      //새로운 방장이 참여자 목록에 있는지 확인
      if (!room.participants.includes(newRoomManagerId)) {
        return res
          .status(400)
          .json({ message: "새로운 방장은 채팅방의 참여자여야 합니다!" });
      }

      //새로운 방장 지정
      room.createdBy = newRoomManagerId;
    }

    //room의 participants에서 탈퇴한 사용자 제거
    room.participants = room.participants.filter(
      (participantId) => participantId.toString() !== userId
    );

    await room.save();

    res.status(200).json({ message: "채팅방에서 성공적으로 탈퇴되었습니다." });
  } catch (error) {
    console.error("채팅방 탈퇴 오류:", error);
    res.status(500).json({
      message: "채팅방 탈퇴 중 오류가 발생했습니다.",
    });
  }
};

//채팅방에 초대하기 - 1명 이상을 body로 전달
export const inviteMembersToRoom = async (req, res) => {
  const { roomId } = req.params;
  const { memberIdArray } = req.body; //초대할 멤버들의 id가 담긴 배열

  try {
    const serviceUsersArray = await User.find({
      _id: { $ne: req.user._id },
    }).select("_id"); //서비스에 가입된 사용자의 id 배열

    //채팅방에 초대하고자 하는 사용자 중 서비스에 가입되지 않은 id가 포함되어 있는지 확인
    memberIdArray.forEach((memberId) => {
      const isUserExist = serviceUsersArray.some(
        (serviceUser) => serviceUser._id.toString() === memberId
      );

      if (!isUserExist)
        return res.status(400).json({
          message:
            "초대하려는 사용자 중 서비스에 가입되지 않은 사용자가 있습니다.",
        });
    });

    const room = await Room.findById(roomId);

    //채팅방이 존재하지 않는 경우
    if (!room) {
      return res.status(404).json({ message: "채팅방을 찾을 수 없습니다." });
    }

    //단체 채팅방이 아닌 경우 초대 불가
    if (!room.isGroupChat) {
      return res
        .status(400)
        .json({ message: "1:1 채팅방에는 멤버를 초대할 수 없습니다." });
    }

    //이미 초대되어 있는 사람은 제외하고 초대
    const newParticipants = memberIdArray.filter((memberId) => {
      return !room.participants.includes(memberId);
    });

    //채팅방에 초대 - participants업데이트
    room.participants.push(...newParticipants);
    await room.save();

    res.status(200).json({
      message: "채팅방 멤버를 성공적으로 초대했습니다.",
      newMembers: newParticipants,
    });
  } catch (error) {
    console.error("채팅방 멤버 초대 오류:", error);
    res.status(500).json({
      message: "채팅방 멤버 초대 중 오류가 발생했습니다.",
    });
  }
};
