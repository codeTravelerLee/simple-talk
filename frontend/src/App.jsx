import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";

import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import SignupTermsPage from "./pages/auth/SignupTermsPage";
import SignupMethodPage from "./pages/auth/SignupMethodPage";
import SignupEmailVerificationPage from "./pages/auth/SignupEmailVerificationPage";
import SignupInfoPage from "./pages/auth/SignupInfoPage";
import MainPage from "./pages/MainPage";
import ErrorPage from "./common/ErrorPage";
import NotFoundPage from "./common/NotFoundPage";

import { PublicRoute, ProtectedRoute } from "./components/auth/ProtectedRoute";

import { useAuthStore } from "./store/useAuthStore";

function App() {
  const { getCurrentUser, loading, error } = useAuthStore();

  useEffect(() => {
    getCurrentUser();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>사용자 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error) return <ErrorPage error={error} />;

  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<MainPage />} />
      </Route>

      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/signup/terms" element={<SignupTermsPage />} />
        <Route path="/signup/method" element={<SignupMethodPage />} />
        <Route
          path="/signup/email-verfication"
          element={<SignupEmailVerificationPage />}
        />
        <Route path="/signup/info" element={<SignupInfoPage />} />
      </Route>

      {/* 404 페이지 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
