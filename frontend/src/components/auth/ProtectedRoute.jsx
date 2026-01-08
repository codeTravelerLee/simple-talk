import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

// 인증된 사용자만 접근 가능한 루트
export const ProtectedRoute = () => {
  const { authUser, loading } = useAuthStore();
  const location = useLocation();

  if (loading) return <div>로딩 중...</div>;

  return authUser ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

// 로그인한 사용자가 접근하면 안 되는 루트 (로그인, 회원가입 등)
export const PublicRoute = () => {
  const { authUser, loading } = useAuthStore();

  if (loading) return <div>로딩 중...</div>;

  return authUser ? <Navigate to="/" replace /> : <Outlet />;
};
