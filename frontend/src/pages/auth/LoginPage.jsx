import React, { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

import { useAuthStore } from "../../store/useAuthStore";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const { login, loading } = useAuthStore();

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const userData = await login(formData.email, formData.password);
      if (userData) {
        toast.success(`${userData.fullName}님, 환영해요!`);
      } else {
        throw new Error("인증에 실패했어요.");
      }
    } catch (error) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message || error.message || "로그인 실패!";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">로그인</h1>
          <p className="text-gray-600">계정에 로그인하세요</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              name="email"
              value={formData.email}
              placeholder="이메일을 입력하세요"
              onChange={onChange}
              required
              className="w-full px-0 py-3 border-b-2 border-gray-300 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-900 transition-colors"
            />
          </div>

          <div>
            <input
              type="password"
              name="password"
              value={formData.password}
              placeholder="비밀번호를 입력하세요"
              onChange={onChange}
              required
              className="w-full px-0 py-3 border-b-2 border-gray-300 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-900 transition-colors"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !formData.email || !formData.password}
            className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            아직 회원이 아니신가요?{" "}
            <Link
              to="/signup"
              className="text-gray-900 font-medium hover:underline"
            >
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
