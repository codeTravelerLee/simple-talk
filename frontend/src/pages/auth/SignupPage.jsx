import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

import { useAuthStore } from "../../store/useAuthStore";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    password: "",
    passwordConfirm: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const { signup, setSignupProgress, signupProgress, loading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!signupProgress.emailVerified) {
      navigate("/signup/email-verification", { replace: true });
    }
  }, [signupProgress.emailVerified, navigate]);

  useEffect(() => {
    if (signupProgress.emailVerified && signupProgress.email) {
      setFormData((prev) => ({
        ...prev,
        email: signupProgress.email,
      }));
    }
  }, [signupProgress.emailVerified, signupProgress.email]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const userData = await signup(
        formData.email,
        formData.fullName,
        formData.password,
        formData.passwordConfirm
      );
      if (userData._id) {
        setSignupProgress("signupCompleted", true);
        toast.success("회원가입이 완료되었습니다!");
        navigate("/signup/info");
      } else {
        throw new Error("회원가입에 실패했어요.");
      }
    } catch (error) {
      console.error(error);
      const errorMessage =
        error.response?.data?.error || error.message || "회원가입 실패!";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">회원가입</h1>
          <p className="text-gray-600">새 계정을 만들어보세요</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              name="email"
              value={formData.email}
              placeholder="이메일을 입력하세요"
              onChange={onChange}
              readOnly={signupProgress.emailVerified}
              required
              className="w-full px-0 py-3 border-b-2 border-gray-300 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-900 transition-colors"
            />
          </div>

          <div>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              placeholder="이름을 입력하세요"
              onChange={onChange}
              required
              className="w-full px-0 py-3 border-b-2 border-gray-300 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-900 transition-colors"
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              placeholder="비밀번호를 입력하세요"
              onChange={onChange}
              required
              className="w-full px-0 py-3 border-b-2 border-gray-300 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-900 transition-colors pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showPasswordConfirm ? "text" : "password"}
              name="passwordConfirm"
              value={formData.passwordConfirm}
              placeholder="비밀번호를 다시 입력하세요"
              onChange={onChange}
              required
              className="w-full px-0 py-3 border-b-2 border-gray-300 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-900 transition-colors pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPasswordConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={
              loading ||
              !formData.email ||
              !formData.fullName ||
              !formData.password ||
              !formData.passwordConfirm
            }
            className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "회원가입 중..." : "회원가입"}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            이미 계정이 있으신가요?{" "}
            <Link
              to="/login"
              className="text-gray-900 font-medium hover:underline"
            >
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
