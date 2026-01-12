//날짜 관련 포맷터

//채팅 홈 화면의 사이드바에서 채팅탭을 선택하면 나오는 채팅 목록에 최근 메시지의 전송 시간을 표시하기 위한 포맷터
//n분전 n일전 형식으로 표시, 7일 넘어가면 n월 n일로 표시
export const formatDateForChatList = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();

  const diffInMs = now - date; //밀리초

  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  switch (diffInMs) {
    case diffInMinutes < 1:
      return "방금 전";
    case diffInMinutes < 60:
      return `${diffInMinutes}분 전`;
    case diffInHours < 24:
      return `${diffInHours}시간 전`;
    case diffInDays < 7:
      return `${diffInDays}일 전`;
    default:
      return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  }
};
