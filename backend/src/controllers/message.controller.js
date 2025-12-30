import Message from "../models/message.model.js";

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
