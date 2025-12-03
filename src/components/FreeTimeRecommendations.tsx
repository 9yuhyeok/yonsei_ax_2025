import { CheckCircle, Calendar, Clock, BookOpen, Sparkles, LayoutGrid, List, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Recommendation } from '../App';
import { TimeTableView } from './TimeTableView';
import { ProgressCheckDialog } from './ProgressCheckDialog';
import { toast } from 'sonner@2.0.3';

interface FreeTimeRecommendationsProps {
  recommendations: Recommendation[];
  onAssignmentComplete: (assignmentId: string) => void;
  onProgressUpdate: (assignmentId: string, completed: boolean, progress: number) => void;
  onRegenerateRecommendations?: () => void;
}

export function FreeTimeRecommendations({ recommendations, onAssignmentComplete, onProgressUpdate, onRegenerateRecommendations }: FreeTimeRecommendationsProps) {
  const [viewMode, setViewMode] = useState<'list' | 'table'>('list');
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  const [scheduledNotifications, setScheduledNotifications] = useState<Set<string>>(new Set());

  console.log('📺 [FreeTimeRecommendations 렌더링]');
  console.log('  - recommendations.length:', recommendations.length);
  if (recommendations.length > 0) {
    console.log('  - recommendations:', recommendations);
  }

  // 추천 일정 종료 시간에 알림 설정
  useEffect(() => {
    const now = new Date();
    const today = ['일', '월', '화', '수', '목', '금', '토'][now.getDay()];

    recommendations.forEach((rec) => {
      const notificationKey = `${rec.assignment.id}-${rec.timeSlot.day}-${rec.timeSlot.endTime}`;
      
      // 이미 설정된 알림은 건너뛰기
      if (scheduledNotifications.has(notificationKey)) return;

      // 오늘 일정만 처리
      if (rec.timeSlot.day !== today) return;

      const [endHour, endMin] = rec.timeSlot.endTime.split(':').map(Number);
      const endTime = new Date();
      endTime.setHours(endHour, endMin, 0, 0);

      const timeUntilEnd = endTime.getTime() - now.getTime();

      // 미래 시간이면 타이머 설정
      if (timeUntilEnd > 0) {
        setTimeout(() => {
          // 알림 표시
          toast(
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                <span>일정 종료 알림</span>
              </div>
              <p>{rec.assignment.title}</p>
              <button
                onClick={() => setSelectedRecommendation(rec)}
                className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                진도율 체크하기
              </button>
            </div>,
            { duration: 10000 }
          );
        }, timeUntilEnd);

        setScheduledNotifications(prev => new Set(prev).add(notificationKey));
      }
    });
  }, [recommendations, scheduledNotifications]);

  const getDayColor = (day: string) => {
    const colors: Record<string, string> = {
      '월': 'bg-blue-100 text-blue-700',
      '화': 'bg-green-100 text-green-700',
      '수': 'bg-yellow-100 text-yellow-700',
      '목': 'bg-purple-100 text-purple-700',
      '금': 'bg-pink-100 text-pink-700'
    };
    return colors[day] || 'bg-gray-100 text-gray-700';
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm">긴급</span>;
      case 'medium':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-sm">보통</span>;
      case 'low':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">여유</span>;
    }
  };

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-12">
        <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-gray-600 mb-2">추천 일정이 생성되지 않았습니다</h3>
        <div className="text-gray-500 space-y-2 mt-4 text-left max-w-md mx-auto text-sm">
          <p>📋 <strong>추천 생성 조건:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>시간표에 공강 시간이 있어야 합니다</li>
            <li>AI에 추가된 미완료 과제가 있어야 합니다</li>
            <li>과제의 예상 시간이 공강 시간 내에 완료 가능해야 합니다</li>
          </ul>
          <p className="mt-4">💡 <strong>문제 해결:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>과제 탭에서 과제를 선택하고 'AI에 추가' 버튼을 누르세요</li>
            <li>과제의 예상 시간을 줄여보세요 (현재는 1시간 공강 단위)</li>
            <li>설정에서 선호 시간대 필터를 확인하세요</li>
            <li>브라우저 콘솔(F12)에서 상세 로그를 확인하세요</li>
          </ul>
        </div>
        <p className="text-gray-400 mt-6 text-sm">위 조건을 만족하면 AI가 공강 시간에 맞는 일정을 추천합니다!</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-indigo-600" />
          <h2>AI 추천 일정</h2>
        </div>
        
        <div className="flex gap-2">
          {onRegenerateRecommendations && (
            <button
              onClick={onRegenerateRecommendations}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              일정 재생성
            </button>
          )}
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-md flex items-center gap-2 ${
              viewMode === 'list' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <List className="w-4 h-4" />
            목록 보기
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 rounded-md flex items-center gap-2 ${
              viewMode === 'table' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            시간표 보기
          </button>
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-2">
          <Bell className="w-5 h-5 text-indigo-600 mt-0.5" />
          <div>
            <p className="text-indigo-900">
              공강 시간을 분석하여 각 과제를 완료하기 적합한 시간대를 추천합니다.
              과제의 예상 소요 시간과 우선순위를 고려했습니다.
            </p>
            <p className="text-indigo-700 mt-1">
              💡 일정 종료 시간에 알림이 표시되어 진도율을 체크할 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      {viewMode === 'table' ? (
        <TimeTableView recommendations={recommendations} />
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className="border border-gray-300 rounded-lg p-5 bg-white hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded ${getDayColor(rec.timeSlot.day)}`}>
                    {rec.timeSlot.day}요일
                  </span>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{rec.timeSlot.startTime} - {rec.timeSlot.endTime}</span>
                  </div>
                </div>
                
                {getPriorityBadge(rec.assignment.priority)}
              </div>

              <div className="mb-4">
                <div className="flex items-start gap-2 mb-2">
                  <BookOpen className="w-5 h-5 text-indigo-600 mt-0.5" />
                  <h3 className="flex-1">{rec.assignment.title}</h3>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-gray-600 ml-7">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>마감: {rec.assignment.dueDate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>예상: {rec.assignment.estimatedTime}분</span>
                  </div>
                  {rec.assignment.progress !== undefined && rec.assignment.progress > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                        진도 {rec.assignment.progress}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-md p-3 mb-4">
                <p className="text-gray-600">
                  💡 <span className="text-gray-700">{rec.reason}</span>
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedRecommendation(rec)}
                  className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Bell className="w-5 h-5" />
                  진도율 체크
                </button>
                <button
                  onClick={() => onAssignmentComplete(rec.assignment.id)}
                  className="px-4 py-2 border border-green-600 text-green-600 rounded-md hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  완료
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'list' && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">
            ✨ 추천된 일정대로 과제를 진행하면 효율적으로 공강 시간을 활용할 수 있습니다!
          </p>
        </div>
      )}

      {/* 진도율 체크 다이얼로그 */}
      {selectedRecommendation && (
        <ProgressCheckDialog
          assignment={selectedRecommendation.assignment}
          timeSlot={selectedRecommendation.timeSlot}
          onClose={() => setSelectedRecommendation(null)}
          onUpdate={onProgressUpdate}
        />
      )}
    </div>
  );
}
