import React, { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

import { useAuthStore } from "../../store/useAuthStore";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { login, loading } = useAuthStore();

  const navigate = useNavigate();

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = await login(formData.email, formData.password);
      if (userData) {
        navigate("/");
        toast.success(`${userData.fullName}님, 환영해요!`);
      } else {
        throw new Error("인증에 실패했어요.");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "로그인 실패!");
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <input
        type="email"
        name="email"
        value={formData.email}
        placeholder="example@gmail.com"
        onChange={onChange}
        required
      />
      <input
        type="password"
        name="password"
        value={formData.password}
        placeholder="비밀번호를 입력해주세요"
        onChange={onChange}
        required
      />
      <button
        type="submit"
        disabled={loading || !formData.email || !formData.password}
      >
        {loading ? "로그인중..." : "로그인"}
      </button>
      <p>아직 회원이 아니신가요? </p>
      <Link to={"/signup"}>회원가입</Link>
    </form>
  );
};

export default LoginPage;
