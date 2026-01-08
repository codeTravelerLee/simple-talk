import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

// 인증된 사용자만 접근 가능한 루트
export const ProtectedRoute = ({ children }) => {
  const { authUser, loading } = useAuthStore();
  const location = useLocation();

  if (loading) return <div>로딩 중...</div>;

  if (!authUser) {
    // 현재 시도했던 주소를 state에 담아 로그인 후 다시 돌아올 수 있게 합니다.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// 로그인한 사용자가 접근하면 안 되는 루트 (로그인, 회원가입 등)
export const PublicRoute = ({ children }) => {
  const { authUser, loading } = useAuthStore();

  if (loading) return <div>로딩 중...</div>;

  if (authUser) {
    return <Navigate to="/" replace />;
  }

  return children;
};
