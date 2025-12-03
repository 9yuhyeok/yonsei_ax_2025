import { useState, ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Plus, Edit2, X, Check } from 'lucide-react';

export type ViewMode = 'daily' | 'weekly' | 'monthly';

interface Timetable {
  id: string;
  name: string;
}

interface HomeTabProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  currentDate: Date;
  onDateChange: (date: Date) => void;
  children: ReactNode;
  timetables: Timetable[];
  currentTimetableId: string;
  onTimetableChange: (id: string) => void;
  onAddTimetable: () => void;
  onRenameTimetable: (id: string, name: string) => void;
  onDeleteTimetable: (id: string) => void;
}

export function HomeTab({ 
  viewMode, 
  onViewModeChange, 
  currentDate,
  onDateChange,
  children,
  timetables,
  currentTimetableId,
  onTimetableChange,
  onAddTimetable,
  onRenameTimetable,
  onDeleteTimetable
}: HomeTabProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState('');
  const [showTimetableMenu, setShowTimetableMenu] = useState(false);

  const currentTimetable = timetables.find(t => t.id === currentTimetableId);

  const formatHeader = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const week = getWeekNumber(currentDate);

    if (viewMode === 'daily') {
      return `${year}년 ${month}월 ${currentDate.getDate()}일`;
    } else if (viewMode === 'weekly') {
      return `${year}년 ${month}월 ${week}주차`;
    } else {
      return `${year}년 ${month}월`;
    }
  };

  const getWeekNumber = (date: Date) => {
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const dayOfMonth = date.getDate();
    const firstDayOfWeek = firstDayOfMonth.getDay();
    return Math.ceil((dayOfMonth + firstDayOfWeek) / 7);
  };

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'daily') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (viewMode === 'weekly') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    onDateChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'daily') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (viewMode === 'weekly') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    onDateChange(newDate);
  };

  const startEditName = () => {
    setEditName(currentTimetable?.name || '');
    setIsEditingName(true);
  };

  const saveEditName = () => {
    if (editName.trim() && currentTimetableId) {
      onRenameTimetable(currentTimetableId, editName.trim());
    }
    setIsEditingName(false);
  };

  const cancelEditName = () => {
    setIsEditingName(false);
    setEditName('');
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 헤더 */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && saveEditName()}
                />
                <button onClick={saveEditName} className="text-green-600 hover:text-green-700">
                  <Check className="w-5 h-5" />
                </button>
                <button onClick={cancelEditName} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <button
                    onClick={() => setShowTimetableMenu(!showTimetableMenu)}
                    className="flex items-center gap-1 hover:bg-gray-100 rounded px-2 py-1"
                  >
                    <h1 className="text-gray-900">{currentTimetable?.name || '시간표'}</h1>
                    <ChevronLeft className="w-5 h-5 transform -rotate-90" />
                  </button>
                  
                  {showTimetableMenu && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[200px]">
                      <div className="py-1 max-h-60 overflow-y-auto">
                        {timetables.map(tt => (
                          <div
                            key={tt.id}
                            className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center justify-between cursor-pointer ${
                              tt.id === currentTimetableId ? 'bg-indigo-50 text-indigo-600' : ''
                            }`}
                          >
                            <span
                              onClick={() => {
                                onTimetableChange(tt.id);
                                setShowTimetableMenu(false);
                              }}
                              className="flex-1"
                            >
                              {tt.name}
                            </span>
                            {timetables.length > 1 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteTimetable(tt.id);
                                }}
                                className="text-red-400 hover:text-red-600"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button onClick={startEditName} className="text-gray-400 hover:text-gray-600">
                  <Edit2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
          <button 
            onClick={onAddTimetable}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Plus className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* 날짜 네비게이션 */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={handlePrevious}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="text-gray-700">{formatHeader()}</span>
          <button
            onClick={handleNext}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* 뷰 모드 탭 */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onViewModeChange('daily')}
            className={`flex-1 py-2 rounded-md text-sm transition-all ${
              viewMode === 'daily'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            일간
          </button>
          <button
            onClick={() => onViewModeChange('weekly')}
            className={`flex-1 py-2 rounded-md text-sm transition-all ${
              viewMode === 'weekly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            주간
          </button>
          <button
            onClick={() => onViewModeChange('monthly')}
            className={`flex-1 py-2 rounded-md text-sm transition-all ${
              viewMode === 'monthly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            월간
          </button>
        </div>
      </div>

      {/* 콘텐츠 영역 */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
