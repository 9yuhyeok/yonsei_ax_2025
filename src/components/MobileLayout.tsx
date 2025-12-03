import { ReactNode } from 'react';
import { Home, CheckSquare, GraduationCap, Settings } from 'lucide-react';

interface MobileLayoutProps {
  children: ReactNode;
  activeTab: 'home' | 'task' | 'grades' | 'settings';
  onTabChange: (tab: 'home' | 'task' | 'grades' | 'settings') => void;
}

export function MobileLayout({ children, activeTab, onTabChange }: MobileLayoutProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-2xl flex flex-col" style={{ height: '100vh', maxHeight: '900px' }}>
        {/* 콘텐츠 영역 */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

        {/* 하단 탭 네비게이션 */}
        <div className="border-t border-gray-200 bg-white">
          <div className="flex items-center justify-around py-2 px-4">
            <button
              onClick={() => onTabChange('home')}
              className={`flex flex-col items-center justify-center py-2 px-4 rounded-lg transition-all ${
                activeTab === 'home'
                  ? 'text-indigo-600'
                  : 'text-gray-400'
              }`}
            >
              <Home className={`w-6 h-6 ${activeTab === 'home' ? 'fill-indigo-600' : ''}`} />
              <span className="text-xs mt-1">홈</span>
            </button>

            <button
              onClick={() => onTabChange('task')}
              className={`flex flex-col items-center justify-center py-2 px-4 rounded-lg transition-all ${
                activeTab === 'task'
                  ? 'text-indigo-600'
                  : 'text-gray-400'
              }`}
            >
              <CheckSquare className={`w-6 h-6 ${activeTab === 'task' ? 'fill-indigo-600' : ''}`} />
              <span className="text-xs mt-1">과제</span>
            </button>

            <button
              onClick={() => onTabChange('grades')}
              className={`flex flex-col items-center justify-center py-2 px-4 rounded-lg transition-all ${
                activeTab === 'grades'
                  ? 'text-indigo-600'
                  : 'text-gray-400'
              }`}
            >
              <GraduationCap className={`w-6 h-6 ${activeTab === 'grades' ? 'fill-indigo-600' : ''}`} />
              <span className="text-xs mt-1">성적</span>
            </button>

            <button
              onClick={() => onTabChange('settings')}
              className={`flex flex-col items-center justify-center py-2 px-4 rounded-lg transition-all ${
                activeTab === 'settings'
                  ? 'text-indigo-600'
                  : 'text-gray-400'
              }`}
            >
              <Settings className={`w-6 h-6 ${activeTab === 'settings' ? 'fill-indigo-600' : ''}`} />
              <span className="text-xs mt-1">설정</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
