import { create } from "zustand";
import toast from "react-hot-toast";

import axiosInstance from "../api/axiosInstance";
import { io } from "socket.io-client";

export const useChatStore = create((set, get) => ({
  users: [],
  messages: [],
  chats: [], // 채팅 목록
  rooms: [], // 채팅방 목록
  selectedChatPartner: null, //선택된 대화상대
  selectedRoom: null, // 선택된 채팅방
  error: null,

  isFetchingUsers: false,
  isFetchingMessages: false,
  isFetchingChats: false, // 채팅 목록 로딩
  isFetchingRooms: false, // 채팅방 목록 로딩
  isCreatingRoom: false, // 채팅방 생성 로딩
  socket: null,

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
    if (get().socket?.connected) return; // 이미 연결된 경우 무시 - 여러번 중복호출 방지

    const socket = io(import.meta.env.VITE_SERVER_URI, {
      query: { userId },
    });

    socket.on("newMessage", (message) => {
      set((state) => ({
        messages: [...state.messages, message],
      }));
    });

    set({ socket });
  },

  // Socket 연결 해제
  disconnectSocket: () => {
    const { socket } = get();
    socket.off("newMessage");
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

  //메시지 전송
  sendMessage: async (recipientId, message) => {
    try {
      const response = await axiosInstance.post("/api/v1/message", {
        receiverId: recipientId,
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

  //이미지 메시지 전송
  sendImageMessage: async (recipientId, imageFile) => {
    try {
      const formData = new FormData();
      formData.append("receiverId", recipientId);
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

  //채팅방에서 메시지 보내기
  sendRoomMessage: async (roomId, message) => {
    try {
      const response = await axiosInstance.post("/api/v1/message/room", {
        roomId,
        message,
      });

      const newMessage = response.data.newMessage;

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

  // 채팅방에 이미지 메시지 보내기 
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
}));
