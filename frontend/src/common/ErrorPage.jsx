import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore"; // 에러 초기화를 위해 임포트

const ErrorPage = ({ error }) => {
  const navigate = useNavigate();
  const { clearError } = useAuthStore();

  const handleGoHome = () => {
    clearError();
    navigate("/", { replace: true });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-6 py-12">
      <div className="bg-white p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] max-w-md w-full text-center border border-slate-100">
        {/* 경고 아이콘 - 부드러운 애니메이션 추가 */}
        <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <svg
            className="w-10 h-10 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-extrabold text-slate-800 mb-3 tracking-tight">
          서비스 연결이 원활하지 않습니다
        </h2>

        <p className="text-slate-500 mb-10 leading-relaxed break-keep">
          {error ||
            "잠시 후 다시 시도해 주세요. 문제가 지속되면 고객센터로 문의 바랍니다."}
        </p>

        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold py-4 rounded-2xl transition-all duration-200 shadow-lg shadow-blue-100"
          >
            다시 시도하기
          </button>

          <button
            onClick={handleGoHome}
            className="w-full bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-500 font-semibold py-4 rounded-2xl border border-slate-200 transition-all duration-200"
          >
            홈으로 이동
          </button>
        </div>

        <p className="mt-8 text-xs text-slate-400">
          Error Code: {error ? "API_CONNECTION_ERROR" : "UNKNOWN_ERROR"}
        </p>
      </div>
    </div>
  );
};

export default ErrorPage;
