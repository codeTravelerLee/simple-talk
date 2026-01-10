//이메일로 가입시 개인의 신상정보 입력하는 페이지

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/useAuthStore";
import axiosInstance from "../../api/axiosInstance";

const SignupInfoPage = () => {
  const [formData, setFormData] = useState({
    birthDate: "",
    gender: "",
    profileImage: null,
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { signupProgress, resetSignupProgress } = useAuthStore();

  useEffect(() => {
    if (!signupProgress.signupCompleted) {
      navigate("/signup", { replace: true });
    }
  }, [signupProgress.signupCompleted, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB 제한
        setError("이미지 파일은 5MB 이하로 선택해주세요.");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        profileImage: file,
      }));

      // 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  //부가정보를 저장하는 API호출
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    setIsLoading(true);

    try {
      const response = await axiosInstance.post(
        "/api/v1/auth/signup/additional-info",
        {
          dateOfBirth: formData.birthDate,
          gender: formData.gender,
          profileImage: formData.profileImage,
        }
      );

      resetSignupProgress();
      toast.success("회원가입이 완료되었습니다! 로그인해주세요.");
      navigate("/login");
    } catch (error) {
      setError("프로필 저장에 실패했습니다. 다시 시도해주세요.");
      toast.error("프로필 저장 실패");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">프로필 설정</h1>
          <p className="text-gray-600">
            더 나은 서비스를 위해 정보를 입력해주세요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 프로필 이미지 업로드 */}
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="프로필 미리보기"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-gray-900 text-white rounded-full p-2 cursor-pointer hover:bg-gray-800 transition-colors">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-sm text-gray-500">
              프로필 사진을 업로드하세요 (선택사항)
            </p>
          </div>

          {/* 생년월일 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              생년월일
            </label>
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleInputChange}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg bg-transparent text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
            />
          </div>

          {/* 성별 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              성별
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === "male"}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900"
                />
                <span className="ml-2 text-gray-700">남성</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === "female"}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900"
                />
                <span className="ml-2 text-gray-700">여성</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="other"
                  checked={formData.gender === "other"}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900"
                />
                <span className="ml-2 text-gray-700">기타</span>
              </label>
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* 완료 버튼 */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "저장 중..." : "회원가입 완료"}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => {
              if (
                confirm(
                  "정말로 이전 단계로 돌아가시겠습니까? 작성한 정보는 저장되지 않습니다."
                )
              ) {
                navigate(-1);
              }
            }}
            className="text-gray-600 hover:text-gray-900 text-sm"
          >
            이전으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupInfoPage;
