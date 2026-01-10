//회원가입 방법 선택 페이지(카카오, 이메일)
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

const SignupMethodPage = () => {
  const navigate = useNavigate();
  const { signupProgress, setSignupProgress } = useAuthStore();

  useEffect(() => {
    if (!signupProgress.termsAgreed) {
      navigate("/signup/terms", { replace: true });
    }
  }, [signupProgress.termsAgreed, navigate]);

  const handleKakaoSignup = () => {
    etSignupProgress("methodSelected", true);
    // 카카오 회원가입 로직 (추후 구현)
    alert("카카오 회원가입은 아직 지원되지 않습니다.");
  };

  const handleEmailSignup = () => {
    setSignupProgress("methodSelected", true);
    navigate("/signup/email-verification");
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">회원가입</h1>
          <p className="text-gray-600">가입 방법을 선택해주세요</p>
        </div>

        <div className="space-y-4">
          {/* 카카오 회원가입 버튼 */}
          <button
            onClick={handleKakaoSignup}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-4 px-6 rounded-lg flex items-center justify-center space-x-3 transition-colors"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 5.86 2 10.74c0 3.06 1.69 5.76 4.32 7.46L5.5 21.5l4.08-2.38c.99.28 2.05.43 3.17.43 5.52 0 10-3.86 10-8.74S17.52 2 12 2z" />
            </svg>
            <span>카카오로 시작하기</span>
          </button>

          {/* 구분선 */}
          <div className="flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">또는</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* 이메일 회원가입 버튼 */}
          <button
            onClick={handleEmailSignup}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-4 px-6 rounded-lg transition-colors"
          >
            이메일로 가입하기
          </button>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-600">
            이미 계정이 있으신가요?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-gray-900 font-medium hover:underline"
            >
              로그인
            </button>
          </p>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900 text-sm"
          >
            이전으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupMethodPage;
