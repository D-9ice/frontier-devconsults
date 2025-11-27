'use client';

import { useState } from 'react';

export default function FloatingButtons() {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleAIChat = () => {
    // TODO: Implement AI chat functionality
    alert('DevConsults AI Chat will be available soon!');
  };

  return (
    <div className="fixed bottom-[180px] right-6 z-40">
      {/* AI Chat Button */}
      <div className="relative">
        {showTooltip && (
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg">
            Consult AI
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full border-8 border-transparent border-l-gray-900" />
          </div>
        )}
        <button
          onClick={handleAIChat}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all transform hover:scale-110"
          aria-label="Consult AI"
        >
          <div className="flex flex-col items-center justify-center text-center leading-tight">
            <span className="text-xs font-bold">Consult</span>
            <span className="text-xs font-bold">AI</span>
          </div>
        </button>
      </div>
    </div>
  );
}
