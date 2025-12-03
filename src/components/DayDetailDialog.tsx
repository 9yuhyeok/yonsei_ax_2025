import { useState } from 'react';
import { X, Calendar, Clock, BookOpen, AlertCircle } from 'lucide-react';
import { TimeSlot, Assignment } from '../App';

interface DayDetailDialogProps {
  date: Date;
  classes: TimeSlot[];
  assignments: Array<{
    assignment: Assignment;
    timeSlot: TimeSlot;
    fromRecommendation: boolean;
  }>;
  onClose: () => void;
}

export function DayDetailDialog({ date, classes, assignments, onClose }: DayDetailDialogProps) {
  const [selectedTab, setSelectedTab] = useState<'classes' | 'assignments'>('classes');
  
  const formatDate = (date: Date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = dayNames[date.getDay()];
    return `${month}월 ${day}일 ${dayName}요일`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return '높음';
      case 'medium': return '보통';
      case 'low': return '낮음';
    }
  };

  const schoolAssignments = assignments.filter(a => a.assignment.type === 'school');
  const personalAssignments = assignments.filter(a => a.assignment.type === 'personal');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="bg-indigo-600 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl">{formatDate(date)}</h2>
            <p className="text-indigo-100 text-sm mt-1">
              수업 {classes.length}개 · 과제 {assignments.length}개
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-indigo-700 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 탭 */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setSelectedTab('classes')}
            className={`flex-1 py-3 px-4 transition-colors ${
              selectedTab === 'classes'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>수업 ({classes.length})</span>
            </div>
          </button>
          <button
            onClick={() => setSelectedTab('assignments')}
            className={`flex-1 py-3 px-4 transition-colors ${
              selectedTab === 'assignments'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>과제 ({assignments.length})</span>
            </div>
          </button>
        </div>

        {/* 내용 */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedTab === 'classes' ? (
            <div className="space-y-3">
              {classes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>이 날은 수업이 없습니다</p>
                </div>
              ) : (
                classes.map((classItem, index) => (
                  <div
                    key={index}
                    className="bg-green-50 border border-green-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-gray-900">{classItem.subject}</h3>
                      <span className="px-2 py-1 bg-green-600 text-white rounded text-xs">
                        {index + 1}교시
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{classItem.startTime} - {classItem.endTime}</span>
                    </div>
                    {classItem.room && (
                      <div className="text-gray-600 text-sm mt-1">
                        📍 {classItem.room}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {assignments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>이 날은 과제가 없습니다</p>
                </div>
              ) : (
                <>
                  {schoolAssignments.length > 0 && (
                    <div>
                      <h4 className="text-sm text-gray-600 mb-2">학교 과제 ({schoolAssignments.length})</h4>
                      <div className="space-y-2">
                        {schoolAssignments.map((item, index) => (
                          <div
                            key={index}
                            className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="text-gray-900 flex-1">{item.assignment.title}</h3>
                              <span className={`px-2 py-1 rounded text-xs whitespace-nowrap ml-2 ${getPriorityColor(item.assignment.priority)}`}>
                                {getPriorityText(item.assignment.priority)}
                              </span>
                            </div>
                            
                            {item.timeSlot && item.timeSlot.startTime && (
                              <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                                <Clock className="w-4 h-4" />
                                <span>{item.timeSlot.startTime} - {item.timeSlot.endTime}</span>
                              </div>
                            )}
                            
                            {item.assignment.addedToAI && item.assignment.estimatedTime > 0 && (
                              <div className="text-gray-600 text-sm mb-1">
                                ⏱️ 예상 {item.assignment.estimatedTime}분
                              </div>
                            )}
                            
                            {item.assignment.memo && (
                              <div className="text-gray-600 text-sm mt-2 pt-2 border-t border-yellow-200">
                                {item.assignment.memo}
                              </div>
                            )}
                            
                            {item.fromRecommendation && (
                              <div className="mt-2 pt-2 border-t border-yellow-200">
                                <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                                  ✨ AI 추천
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {personalAssignments.length > 0 && (
                    <div>
                      <h4 className="text-sm text-gray-600 mb-2">개인 일정 ({personalAssignments.length})</h4>
                      <div className="space-y-2">
                        {personalAssignments.map((item, index) => (
                          <div
                            key={index}
                            className="bg-pink-50 border border-pink-200 rounded-lg p-4"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="text-gray-900 flex-1">{item.assignment.title}</h3>
                              <span className={`px-2 py-1 rounded text-xs whitespace-nowrap ml-2 ${getPriorityColor(item.assignment.priority)}`}>
                                {getPriorityText(item.assignment.priority)}
                              </span>
                            </div>
                            
                            {item.timeSlot && item.timeSlot.startTime && (
                              <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                                <Clock className="w-4 h-4" />
                                <span>{item.timeSlot.startTime} - {item.timeSlot.endTime}</span>
                              </div>
                            )}
                            
                            {item.assignment.addedToAI && item.assignment.estimatedTime > 0 && (
                              <div className="text-gray-600 text-sm mb-1">
                                ⏱️ 예상 {item.assignment.estimatedTime}분
                              </div>
                            )}
                            
                            {item.assignment.memo && (
                              <div className="text-gray-600 text-sm mt-2 pt-2 border-t border-pink-200">
                                {item.assignment.memo}
                              </div>
                            )}
                            
                            {item.fromRecommendation && (
                              <div className="mt-2 pt-2 border-t border-pink-200">
                                <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                                  ✨ AI 추천
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
