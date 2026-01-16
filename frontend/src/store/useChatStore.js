import { create } from "zustand";
import toast from "react-hot-toast";

import axiosInstance from "../api/axiosInstance";
import { io } from "socket.io-client";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  users: [], //서비스 가입된 사용자 전체

  messages: [], //하나의 채팅방에서 나눈 메시지의 모음

  chats: [], // 채팅 목록
  rooms: [], // 채팅방 목록

  selectedChatPartner: null, //선택된 대화상대
  selectedRoom: null, // 선택된 채팅방
  error: null,

  isFetchingUsers: false, //서비스 가입된 사용자 불러오기 로딩
  isFetchingMessages: false,
  isFetchingChats: false, // 채팅 목록 로딩
  isFetchingRooms: false, // 채팅방 목록 로딩
  isCreatingRoom: false, // 채팅방 생성 로딩

  socket: null,

  // 온라인(웹소켓 접속) 상태 관리
  onlineUsers: [], // 현재 온라인인 사용자 ID 배열
  userStatus: {}, // userId를 key로, lastSocketConnection 정보를 value로 저장

  //서비스 가입된 유저 전체 불러옴
  getUsers: async () => {
    set({ isFetchingUsers: true, error: null });
    try {
      const response = await axiosInstance.get("/api/v1/user");
      const usersArray = response.data.usersArray;

      set({ users: usersArray });
      return usersArray;
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      set({ error: errorMessage });

      throw new Error(errorMessage || "사용자를 불러오지 못했어요.");
    } finally {
      set({ isFetchingUsers: false });
    }
  },

  //채팅 목록 불러옴
  getChatList: async () => {
    set({ isFetchingChats: true, error: null });
    try {
      const response = await axiosInstance.get("/api/v1/message/chats");
      const chatsArray = response.data.chats;

      set({ chats: chatsArray });
      return chatsArray;
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      set({ error: errorMessage });

      throw new Error(errorMessage || "채팅 목록을 불러오지 못했어요.");
    } finally {
      set({ isFetchingChats: false });
    }
  },

  //특정 사용자와 주고받은 메시지 불러옴
  getMessageByRecipientId: async (recepientId) => {
    set({ isFetchingMessages: true });
    try {
      const response = await axiosInstance.get(
        `/api/v1/message/${recepientId}`
      );
      const messagesArray = response.data.messagesArray;

      set({ messages: messagesArray });

      return messagesArray;
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      set({ error: errorMessage });

      toast.error(error);

      throw new Error(errorMessage || "사용자를 불러오지 못했어요.");
    } finally {
      set({ isFetchingMessages: false });
    }
  },

  //대화상대 지정
  setSelectedChatPartner: (partner) => set({ selectedChatPartner: partner }),

  // 채팅방 선택
  setSelectedRoom: (room) => set({ selectedRoom: room }),

  // 채팅방 생성
  createRoom: async (participantIds, name = null) => {
    set({ isCreatingRoom: true, error: null });
    try {
      const response = await axiosInstance.post("/api/v1/room", {
        participantIds,
        name,
      });

      const newRoom = response.data;

      // 채팅방 목록에 새로운 방 추가
      set((state) => ({
        rooms: [newRoom, ...state.rooms],
        selectedRoom: newRoom, // 생성한 방을 바로 선택
      }));

      toast.success(
        newRoom.isGroupChat
          ? `채팅방을 만들었어요!`
          : "즐거운 대화를 나눠보세요!"
      );

      return newRoom;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "채팅방 생성을 실패했어요.";
      set({ error: errorMessage });
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      set({ isCreatingRoom: false });
    }
  },

  //내가 속한 채팅방 목록 불러오기
  getRooms: async () => {
    set({ isFetchingRooms: true, error: null });
    try {
      const response = await axiosInstance.get("/api/v1/room/list");
      const roomsArray = response.data;

      set({ rooms: roomsArray });
      return roomsArray;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "채팅방 목록을 불러오지 못했습니다.";
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      set({ isFetchingRooms: false });
    }
  },

  // Socket 연결
  connectSocket: (userId) => {
    console.log("[useChatStore] connectSocket called with userId:", userId);

    if (get().socket?.connected) {
      console.log("[useChatStore] Socket already connected, skipping");
      return; // 이미 연결된 경우 무시 - 여러번 중복호출 방지
    }

    if (!userId || userId === "undefined" || userId === "null") {
      console.error(
        "[useChatStore] Invalid userId, cannot connect socket:",
        userId
      );
      return;
    }

    console.log(
      "[useChatStore] Creating socket connection with userId:",
      userId
    );
    const socket = io(import.meta.env.VITE_SERVER_URI, {
      query: { userId },
    });

    socket.on("newMessage", (message) => {
      set((state) => ({
        messages: [...state.messages, message],
      }));
    });

    // 온라인 사용자 목록 수신
    socket.on("getConnectedUserId", (connectedUserIds) => {
      set({ onlineUsers: connectedUserIds });
    });

    set({ socket });
  },

  // Socket 연결 해제
  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.off("newMessage");
      socket.off("getConnectedUserId");
      socket.disconnect();
      set({ socket: null });
    }
  },

  //1:1 채팅 메시지 전송
  sendMessage: async (recipientId, message) => {
    try {
      // 1:1 채팅방 찾거나 생성
      let roomId = null;

      // 기존 rooms에서 해당 상대방과의 1:1 채팅방 찾기
      const existingRoom = get().rooms.find(
        (room) =>
          !room.isGroupChat &&
          room.participants.some(
            (p) => (typeof p === "object" ? p._id : p) === recipientId
          )
      );

      if (existingRoom) {
        roomId = existingRoom._id;
      } else {
        // 채팅방이 없으면 생성
        const roomResponse = await axiosInstance.post("/api/v1/room", {
          participantIds: [recipientId],
          name: null, // 1:1 채팅은 이름 불필요
        });
        roomId = roomResponse.data._id;

        // 생성된 채팅방을 rooms에 추가
        set((state) => ({
          rooms: [roomResponse.data, ...state.rooms],
        }));
      }

      const response = await axiosInstance.post("/api/v1/message", {
        receiverId: recipientId,
        roomId: roomId,
        message,
      });

      const newMessage = response.data.newMessage;

      // 메시지 목록에 새 메시지 추가
      set((state) => ({
        messages: [...state.messages, newMessage],
      }));

      return newMessage;
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      set({ error: errorMessage });

      toast.error(errorMessage || "메시지 전송에 실패했습니다.");

      throw new Error(errorMessage || "메시지 전송 실패");
    }
  },

  //1:1 채팅 이미지 메시지 전송
  sendImageMessage: async (recipientId, imageFile) => {
    try {
      // 1:1 채팅방 찾거나 생성
      let roomId = null;

      const existingRoom = get().rooms.find(
        (room) =>
          !room.isGroupChat &&
          room.participants.some(
            (p) => (typeof p === "object" ? p._id : p) === recipientId
          )
      );

      if (existingRoom) {
        roomId = existingRoom._id;
      } else {
        const roomResponse = await axiosInstance.post("/api/v1/room", {
          participantIds: [recipientId],
          name: null,
        });
        roomId = roomResponse.data._id;

        set((state) => ({
          rooms: [roomResponse.data, ...state.rooms],
        }));
      }

      const formData = new FormData();
      formData.append("receiverId", recipientId);
      formData.append("roomId", roomId);
      formData.append("image", imageFile);

      const response = await axiosInstance.post(
        "/api/v1/message/send-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const newMessage = response.data.newMessage;

      // 메시지 목록에 새 메시지 추가
      set((state) => ({
        messages: [...state.messages, newMessage],
      }));

      return newMessage;
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      set({ error: errorMessage });

      toast.error(errorMessage || "이미지 전송에 실패했습니다.");

      throw new Error(errorMessage || "이미지 전송 실패");
    }
  },

  //채팅방 메시지 조회
  getRoomMessages: async (roomId) => {
    set({ isFetchingMessages: true, error: null });
    try {
      const response = await axiosInstance.get(
        `/api/v1/message/room/${roomId}`
      );
      const messagesArray = response.data.messagesArray;

      console.log("채팅방 메시지 불러오기 완료:", {
        roomId,
        count: messagesArray.length,
        firstMessage: messagesArray[0],
      });

      set({ messages: messagesArray });
      return messagesArray;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "메시지를 불러오지 못했습니다.";
      set({ error: errorMessage });
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      set({ isFetchingMessages: false });
    }
  },

  //단톡방에서 메시지 보내기
  sendRoomMessage: async (roomId, message) => {
    try {
      const response = await axiosInstance.post("/api/v1/message/room", {
        roomId,
        message,
      });

      const newMessage = response.data.newMessage;

      console.log("메시지 전송 완료 - 데이터 구조 확인:", {
        roomId,
        senderId: newMessage.senderId,
        senderIdType: typeof newMessage.senderId,
        isObject: typeof newMessage.senderId === "object",
        senderId_id: newMessage.senderId?._id,
        isRead: newMessage.isRead,
        message: newMessage.message?.substring(0, 20),
      });

      // 메시지 목록에 새 메시지 추가
      set((state) => ({
        messages: [...state.messages, newMessage],
      }));

      // 채팅방 목록의 lastMessage 업데이트
      set((state) => ({
        rooms: state.rooms.map((room) =>
          room._id === roomId
            ? { ...room, lastMessage: message, lastMessageAt: new Date() }
            : room
        ),
      }));

      return newMessage;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "메시지 전송에 실패했습니다.";
      set({ error: errorMessage });
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // 단톡방에 이미지 메시지 보내기
  sendRoomImageMessage: async (roomId, imageFile) => {
    try {
      const formData = new FormData();
      formData.append("roomId", roomId);
      formData.append("image", imageFile);

      const response = await axiosInstance.post(
        "/api/v1/message/room/image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const newMessage = response.data.newMessage;

      // 메시지 목록에 새 메시지 추가
      set((state) => ({
        messages: [...state.messages, newMessage],
      }));

      // 채팅방 목록의 lastMessage 업데이트
      set((state) => ({
        rooms: state.rooms.map((room) =>
          room._id === roomId
            ? {
                ...room,
                lastMessage: "사진을 보냈습니다.",
                lastMessageAt: new Date(),
              }
            : room
        ),
      }));

      return newMessage;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "이미지 전송에 실패했습니다.";
      set({ error: errorMessage });
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // 사용자 1명의 웹소켓 접속 여부 확인(온라인, n분전 활동)
  getUserStatus: async (userId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/user/status/${userId}`);
      const { lastSocketConnection, isOnline } = response.data;

      // userStatus 업데이트
      set((state) => ({
        userStatus: {
          ...state.userStatus,
          [userId]: { lastSocketConnection, isOnline },
        },
      }));

      return { lastSocketConnection, isOnline };
    } catch (error) {
      console.error("Failed to fetch user status:", error);
      return null;
    }
  },

  // 여러 사용자의 웹소켓 접속 상태 일괄 확인
  getBatchUserStatus: async (userIds) => {
    try {
      const response = await axiosInstance.post(
        "/api/v1/user/socket-connection/status/multiple",
        {
          userIds,
        }
      );

      // userStatus 업데이트
      set((state) => ({
        userStatus: {
          ...state.userStatus,
          ...response.data,
        },
      }));

      return response.data;
    } catch (error) {
      console.error("Failed to fetch batch user status:", error);
      return {};
    }
  },

  //채팅방에서 상대방이 보낸 메시지를 읽음 처리
  markRoomMessagesAsRead: async (roomId) => {
    set({ error: null });
    try {
      const response = await axiosInstance.patch(`/api/v1/message/${roomId}`);
      const { message, modifiedCount } = response.data;

      console.log(`읽음 처리 성공: ${modifiedCount}개 메시지 업데이트됨`);

      // 읽음 처리 성공 시 로컬 상태의 메시지들도 업데이트
      set((state) => ({
        messages: state.messages.map((msg) => {
          // 해당 채팅방의 메시지이고, 아직 읽지 않은 메시지인 경우
          // senderId가 객체인 경우와 문자열인 경우 모두 처리
          const msgSenderId =
            typeof msg.senderId === "object" ? msg.senderId?._id : msg.senderId;

          // useAuthStore에서 현재 사용자 ID 가져오기
          const currentUserId = useAuthStore.getState().authUser?._id;

          if (
            msg.roomId === roomId &&
            !msg.isRead &&
            msgSenderId !== currentUserId
          ) {
            return { ...msg, isRead: true, readAt: new Date().toISOString() };
          }
          return msg;
        }),
      }));

      return { message, modifiedCount };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "메시지 읽음 처리에 실패했습니다.";
      set({ error: errorMessage });
      console.error("읽음 처리 실패:", error);
      throw new Error(errorMessage);
    }
  },
}));
