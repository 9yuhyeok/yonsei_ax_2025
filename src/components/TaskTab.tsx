import { ReactNode } from 'react';

interface TaskTabProps {
  children: ReactNode;
}

export function TaskTab({ children }: TaskTabProps) {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* 헤더 */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-200">
        <h1 className="text-gray-900">과제 관리</h1>
      </div>

      {/* 콘텐츠 영역 */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
