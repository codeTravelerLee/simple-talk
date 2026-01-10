import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

const Navbar = () => {
  const { authUser, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      if (confirm("정말 로그아웃 하시겠습니까?")) {
        await logout();
        navigate("/login");
      } else {
        return;
      }
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  const handleProfileEdit = () => {
    // 프로필 수정 페이지로 이동 (아직 없으므로 임시)
    navigate("/profile");
  };

  if (!authUser) return null;

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-bold text-gray-900">Simple Talk</h1>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            {authUser.profileImg ? (
              <img
                src={authUser.profileImg}
                alt={authUser.fullName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <span className="text-gray-600 text-sm font-medium">
                {authUser.fullName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <span className="text-sm font-medium text-gray-900">
            {authUser.fullName}
          </span>
        </div>

        <button
          onClick={handleProfileEdit}
          className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded-md hover:bg-gray-100 transition-colors"
        >
          프로필 수정
        </button>

        <button
          onClick={handleLogout}
          className="text-sm text-red-600 hover:text-red-700 px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
        >
          로그아웃
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
