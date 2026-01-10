import React from "react";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 귀여운 404 아이콘 */}
        <div className="mb-8">
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full mx-auto flex items-center justify-center shadow-lg">
              <span className="text-6xl font-bold text-white">4</span>
            </div>
            <div className="absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <span className="text-3xl font-bold text-white">0</span>
            </div>
            <div
              className="absolute -bottom-2 -left-2 w-16 h-16 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg animate-bounce"
              style={{ animationDelay: "0.2s" }}
            >
              <span className="text-3xl font-bold text-white">4</span>
            </div>
          </div>
        </div>

        {/* 메시지 */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          앗! 길을 잃었어요 🧭
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          찾으시는 페이지가 존재하지 않아요.
          <br />
          다른 곳으로 가볼까요?
        </p>

        {/* 귀여운 일러스트 */}
        <div className="mb-8">
          <div className="text-8xl animate-bounce">😵</div>
        </div>

        {/* 버튼 */}
        <button
          onClick={handleGoHome}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          🏠 홈으로 돌아가기
        </button>

        {/* 추가 메시지 */}
        <p className="text-sm text-gray-500 mt-6">
          문제가 지속되면 관리자에게 문의해주세요
        </p>
      </div>
    </div>
  );
};

export default NotFoundPage;
