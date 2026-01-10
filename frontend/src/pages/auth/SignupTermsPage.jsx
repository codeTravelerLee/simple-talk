//회원가입 약관 동의 페이지
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

const SignupTermsPage = () => {
  const [agreements, setAgreements] = useState({
    serviceTerms: false,
    privacyPolicy: false,
    marketingConsent: false,
  });

  const navigate = useNavigate();
  const { setSignupProgress } = useAuthStore();

  const handleAgreementChange = (name) => {
    setAgreements((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const handleAllAgree = () => {
    const allChecked = Object.values(agreements).every(Boolean);
    setAgreements({
      serviceTerms: !allChecked,
      privacyPolicy: !allChecked,
      marketingConsent: !allChecked,
    });
  };

  const handleNext = () => {
    if (!agreements.serviceTerms || !agreements.privacyPolicy) {
      alert("필수 약관에 동의해주세요.");
      return;
    }
    setSignupProgress("termsAgreed", true);
    navigate("/signup/method");
  };

  const allAgreed = Object.values(agreements).every(Boolean);
  const requiredAgreed = agreements.serviceTerms && agreements.privacyPolicy;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">약관 동의</h1>
          <p className="text-gray-600">
            서비스 이용을 위해 약관에 동의해주세요
          </p>
        </div>

        <div className="space-y-6">
          {/* 전체 동의 */}
          <div className="border border-gray-200 rounded-lg p-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={allAgreed}
                onChange={handleAllAgree}
                className="w-5 h-5 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
              />
              <span className="text-lg font-medium text-gray-900">
                전체 동의
              </span>
            </label>
          </div>

          {/* 개별 약관들 */}
          <div className="space-y-4">
            {/* 서비스 이용약관 - 필수 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreements.serviceTerms}
                  onChange={() => handleAgreementChange("serviceTerms")}
                  className="w-5 h-5 mt-1 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">
                      서비스 이용약관
                    </span>
                    <span className="text-red-500 text-sm">(필수)</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Simple Talk 서비스 이용에 대한 약관입니다. 회원 가입 및
                    서비스 이용에 필요한 기본 규정을 포함합니다.
                  </p>
                </div>
              </label>
            </div>

            {/* 개인정보 처리방침 - 필수 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreements.privacyPolicy}
                  onChange={() => handleAgreementChange("privacyPolicy")}
                  className="w-5 h-5 mt-1 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">
                      개인정보 처리방침
                    </span>
                    <span className="text-red-500 text-sm">(필수)</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    수집하는 개인정보의 항목, 이용목적, 보유기간 등 개인정보
                    처리에 대한 내용을 담고 있습니다.
                  </p>
                </div>
              </label>
            </div>

            {/* 마케팅 정보 수신 동의 - 선택 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreements.marketingConsent}
                  onChange={() => handleAgreementChange("marketingConsent")}
                  className="w-5 h-5 mt-1 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">
                      마케팅 정보 수신 동의
                    </span>
                    <span className="text-gray-500 text-sm">(선택)</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    이벤트, 프로모션 등 마케팅 정보를 이메일로 받아보실 수
                    있습니다. 동의하지 않아도 서비스 이용이 가능합니다.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* 다음 버튼 */}
          <button
            onClick={handleNext}
            disabled={!requiredAgreed}
            className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            다음
          </button>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900 text-sm"
          >
            이전으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupTermsPage;
