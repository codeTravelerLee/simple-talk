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
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignupPage />
          </PublicRoute>
        }
      />
      <Route
        path="/signup/terms"
        element={
          <PublicRoute>
            <SignupTermsPage />
          </PublicRoute>
        }
      />
      <Route
        path="/signup/method"
        element={
          <PublicRoute>
            <SignupMethodPage />
          </PublicRoute>
        }
      />
      <Route
        path="/signup/email-verfication"
        element={
          <PublicRoute>
            <SignupEmailVerificationPage />
          </PublicRoute>
        }
      />
      <Route
        path="/signup/info"
        element={
          <PublicRoute>
            <SignupInfoPage />
          </PublicRoute>
        }
      />
    </Routes>
  );
}

export default App;
