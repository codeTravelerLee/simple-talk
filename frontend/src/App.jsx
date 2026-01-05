import { Route, Routes } from "react-router-dom";

import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import SignupTermsPage from "./pages/auth/SignupTermsPage";
import SignupMethodPage from "./pages/auth/SignupMethodPage";
import SignupEmailVerificationPage from "./pages/auth/SignupEmailVerificationPage";
import SignupInfoPage from "./pages/auth/SignupInfoPage";
import MainPage from "./pages/MainPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/signup/terms" element={<SignupTermsPage />} />
      <Route path="/signup/method" element={<SignupMethodPage />} />
      <Route
        path="/signup/email-verfication"
        element={<SignupEmailVerificationPage />}
      />
      <Route path="/signup/info" element={<SignupInfoPage />} />
    </Routes>
  );
}

export default App;
