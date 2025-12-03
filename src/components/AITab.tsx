import { ReactNode } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';

interface AITabProps {
  children: ReactNode;
  onRegenerateRecommendations?: () => void;
}

export function AITab({ children, onRegenerateRecommendations }: AITabProps) {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* 헤더 */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-600" />
            <h1 className="text-gray-900">AI 추천</h1>
          </div>
          {onRegenerateRecommendations && (
            <button
              onClick={onRegenerateRecommendations}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              재생성
            </button>
          )}
        </div>
        <p className="text-sm text-gray-600">
          AI가 공강 시간과 과제를 분석하여 최적의 일정을 추천합니다
        </p>
      </div>

      {/* 콘텐츠 영역 */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
