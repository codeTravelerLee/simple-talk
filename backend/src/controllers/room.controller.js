import Room from "../models/room.model.js";
import User from "../models/user.model.js";

/**
 * 채팅방 생성
 * 
 * 동작 방식:
 * 1. 프론트엔드에서 참여자 ID 목록과 방 이름을 보냄
 * 2. 참여자가 2명 이상인지 확인
 * 3. 단체 채팅인 경우 방 이름이 있는지 확인
 * 4. 데이터베이스에 채팅방 생성
 * 5. 생성된 채팅방 정보를 프론트엔드에 보냄
 * 
 * @param {Object} req - 요청 객체
 * @param {Array} req.body.participantIds - 참여자 ID 배열
 * @param {String} req.body.name - 채팅방 이름 (단체 채팅일 때 필수)
 * @param {Object} res - 응답 객체
 */

//단체채팅방 생성 
export const createRoom = async (req, res) => {
  try {
    const { participantIds, name } = req.body;
    const currentUserId = req.user._id; // 로그인한 사용자 (방을 만드는 사람)

    // 참여자가 전달되지 않은 경우, 배열이 아닌 경우
    if (!participantIds || !Array.isArray(participantIds)) {
      return res.status(400).json({ 
        message: "참여자 목록이 필요해요!" 
      });
    }

    // 참여자는 최소 1명 이상 (본인 + 상대방)
    if (participantIds.length < 1) {
      return res.status(400).json({ 
        message: "대화 상대를 선택해주세요!" 
      });
    }

    // 본인도 참여자에 포함 (중복 방지)
    const allParticipants = [...new Set([currentUserId.toString(), ...participantIds])];
    
    //  단체 채팅인지 확인 (3명 이상이면 단체 채팅)
    const isGroupChat = allParticipants.length >= 3;
    
    // 단체 채팅인데 이름이 없으면 에러
    if (isGroupChat && !name) {
      return res.status(400).json({ 
        message: "생성할 단체 채팅방의 이름을 지어주세요!" 
      });
    }

    // 1:1 채팅인 경우, 이미 존재하는 방이 있는지 확인
    if (!isGroupChat) {
      const existingRoom = await Room.findOne({
        isGroupChat: false,
        participants: { $all: allParticipants, $size: allParticipants.length }
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
        message: "대화를 나눌 수 없는 상대가 포함되어 있어요." 
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
      message: "채팅방 생성 중 오류가 발생했습니다." 
    });
  }
};

//내가 속한 채팅방 목록 가져오기 
export const getRooms = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // 내가 참여중인 모든 채팅방 찾기
    const rooms = await Room.find({
      participants: { $in: [currentUserId] } // 참여자 목록에 내가 있는 방들
    })
      .populate("participants", "fullName email profileImg") // 참여자 정보
      .populate("createdBy", "fullName email") // 방 만든 사람 정보
      .sort({ lastMessageAt: -1 }); // 최근 메시지 순으로 정렬

    res.status(200).json(rooms);
    
  } catch (error) {
    console.error("채팅방 목록 조회 오류:", error);
    res.status(500).json({ 
      message: "채팅방 목록 조회 중 오류가 발생했습니다." 
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
        message: "채팅방을 찾을 수 없습니다." 
      });
    }

    // 본인이 참여자인지 확인
    const isParticipant = room.participants.some(
      (participant) => participant._id.toString() === currentUserId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ 
        message: "이 채팅방에 접근할 권한이 없습니다." 
      });
    }

    res.status(200).json(room);
    
  } catch (error) {
    console.error("채팅방 조회 오류:", error);
    res.status(500).json({ 
      message: "채팅방 조회 중 오류가 발생했습니다." 
    });
  }
};
