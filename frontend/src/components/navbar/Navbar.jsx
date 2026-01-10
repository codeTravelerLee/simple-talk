import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const { authUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between relative">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-bold text-gray-900">Simple Talk</h1>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center space-x-4">
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

      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-gray-600 hover:text-gray-900"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 md:hidden shadow-lg">
          <div className="px-4 py-3 space-y-3">
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
              onClick={() => {
                handleProfileEdit();
                setIsMenuOpen(false);
              }}
              className="block w-full text-left text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              프로필 수정
            </button>

            <button
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className="block w-full text-left text-sm text-red-600 hover:text-red-700 px-3 py-2 rounded-md hover:bg-red-50 transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
