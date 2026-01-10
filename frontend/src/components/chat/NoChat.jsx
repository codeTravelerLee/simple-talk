/*
채팅 홈 화면에서 선택된 대화상대가 없을때 기본으로 보여줄 화면
*/

import React from "react";
import { MessageCircle } from "lucide-react";

const NoChat = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-gray-50 text-gray-500">
      <div className="flex flex-col items-center space-y-6 animate-in fade-in zoom-in duration-500">
        {/* 아이콘 영역 */}
        <div className="p-6 bg-white rounded-full shadow-sm border border-gray-100">
          <MessageCircle size={48} className="text-blue-400" />
        </div>

        {/* 텍스트 영역 */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            대화가 선택되지 않았습니다
          </h2>
          <p className="text-gray-500 max-w-xs">
            목록에서 대화 상대를 선택하여 <br />
            즐거운 대화를 시작해보세요!
          </p>
        </div>
      </div>
    </div>
  );
};

export default NoChat;
