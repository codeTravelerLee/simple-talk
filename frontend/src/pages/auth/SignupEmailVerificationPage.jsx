import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../../api/axiosInstance";
import { useAuthStore } from "../../store/useAuthStore";

const SignupEmailVerificationPage = () => {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { signupProgress, setSignupProgress } = useAuthStore();

  useEffect(() => {
    if (!signupProgress.methodSelected) {
      navigate("/signup/method", { replace: true });
    }
  }, [signupProgress.methodSelected, navigate]);

  // 재전송 타이머
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  //인증 코드를 전송하는 API호출
  const handleSendCode = async () => {
    if (!email) {
      setError("이메일을 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // 이메일 인증 코드 전송 API 호출
      const response = await axiosInstance.post(
        "/api/v1/auth/send-email-verification",
        {
          email,
        }
      );

      setIsCodeSent(true);
      setResendTimer(60); // 60초 재전송 제한
      toast.success("인증 코드가 이메일로 전송되었습니다.");
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        "인증 코드 전송에 실패했습니다. 다시 시도해주세요.";
      setError(errorMessage);
      toast.error("인증 코드 전송 실패");
    } finally {
      setIsLoading(false);
    }
  };

  //인증코드 검증 API호출
  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setError("인증 코드를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // 이메일 인증 코드 확인 API 호출
      const response = await axiosInstance.post(
        "/api/v1/auth/verify-email-code",
        {
          email,
          code: verificationCode,
        }
      );

      setSignupProgress("emailVerified", true);
      setSignupProgress("email", email);
      toast.success("이메일 인증이 완료되었습니다!");
      navigate("/signup");
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "인증 코드가 올바르지 않습니다.";
      setError(errorMessage);
      toast.error("인증 실패");
    } finally {
      setIsLoading(false);
    }
  };

  //인증코드 재전송
  const handleResendCode = () => {
    if (resendTimer === 0) {
      handleSendCode();
    }
  };

  //이메일 입력하고 엔터쳐도 코드전송
  const handleEmailInputKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSendCode();
    }
  };

  //입력한 이메일 주소가 유효한지 확인
  const isEmailValid = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">이메일 인증</h1>
          <p className="text-gray-600">
            이메일 주소 확인을 위해 인증 코드를 입력해주세요
          </p>
        </div>

        <div className="space-y-6">
          {/* 이메일 입력 */}
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력하세요"
              disabled={isCodeSent}
              className="w-full px-0 py-3 border-b-2 border-gray-300 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-900 transition-colors disabled:bg-gray-50 disabled:text-gray-500"
              onKeyDown={handleEmailInputKeyDown}
            />
          </div>

          {/* 인증 코드 전송 버튼 */}
          {!isCodeSent && (
            <button
              onClick={handleSendCode}
              disabled={isLoading || !email || !isEmailValid(email)}
              className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "전송 중..." : "인증 코드 받기"}
            </button>
          )}

          {/* 인증 코드 입력 (코드 전송 후 표시) */}
          {isCodeSent && (
            <>
              <div>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="인증 코드를 입력하세요"
                  maxLength={6}
                  className="w-full px-0 py-3 border-b-2 border-gray-300 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-900 transition-colors text-center text-2xl tracking-widest"
                />
                <p className="text-sm text-gray-500 mt-2 text-center">
                  이메일로 전송된 6자리 코드를 입력해주세요
                </p>
              </div>

              {/* 인증 확인 버튼 */}
              <button
                onClick={handleVerifyCode}
                disabled={isLoading || !verificationCode}
                className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? "확인 중..." : "인증 확인"}
              </button>

              {/* 재전송 버튼 */}
              <div className="text-center">
                <button
                  onClick={handleResendCode}
                  disabled={resendTimer > 0 || isLoading}
                  className="text-sm text-gray-600 hover:text-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {resendTimer > 0
                    ? `재전송까지 ${resendTimer}초`
                    : "코드 재전송"}
                </button>
              </div>
            </>
          )}

          {/* 에러 메시지 */}
          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}
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

export default SignupEmailVerificationPage;
