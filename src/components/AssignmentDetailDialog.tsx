import { X, Calendar, Clock, BookOpen, User, Repeat, Bell } from 'lucide-react';
import { Assignment, TimeSlot } from '../App';

interface AssignmentDetailDialogProps {
  assignment: Assignment;
  timeSlot?: TimeSlot;
  date: Date;
  onClose: () => void;
}

export function AssignmentDetailDialog({ assignment, timeSlot, date, onClose }: AssignmentDetailDialogProps) {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = dayNames[d.getDay()];
    return `${month}월 ${day}일 ${dayName}요일`;
  };

  const formatTime = () => {
    if (timeSlot && timeSlot.startTime && timeSlot.endTime) {
      return `${timeSlot.startTime} - ${timeSlot.endTime}`;
    }
    return '시간 미정';
  };

  const getRepeatText = (repeat: string) => {
    switch (repeat) {
      case 'daily': return '매일 반복';
      case 'weekly': return '매주 반복';
      case 'monthly': return '매월 반복';
      default: return null;
    }
  };

  const getReminderText = (reminder: string) => {
    switch (reminder) {
      case '10min': return '10분 전';
      case '30min': return '30분 전';
      case '1hour': return '1시간 전';
      case '1day': return '1일 전';
      default: return null;
    }
  };

  const getPriorityColor = () => {
    switch (assignment.priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
    }
  };

  const getPriorityText = () => {
    switch (assignment.priority) {
      case 'high': return '높음';
      case 'medium': return '보통';
      case 'low': return '낮음';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl">일정 세부정보</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* 내용 */}
        <div className="px-6 py-4 space-y-4">
          {/* 제목 */}
          <div className="flex items-start gap-3">
            <div className={`w-4 h-4 rounded mt-1 ${assignment.type === 'school' ? 'bg-yellow-400' : 'bg-pink-400'}`}></div>
            <div className="flex-1">
              <h3 className="text-lg">{assignment.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-1 rounded text-sm ${getPriorityColor()}`}>
                  우선순위: {getPriorityText()}
                </span>
                <span className={`px-2 py-1 rounded text-sm ${
                  assignment.type === 'school' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                }`}>
                  {assignment.type === 'school' ? '학교 과제' : '개인 일정'}
                </span>
              </div>
            </div>
          </div>

          {/* 날짜 및 시간 */}
          <div className="flex items-start gap-3 pt-2">
            <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
            <div className="flex-1">
              <div className="text-gray-900">{formatDate(assignment.dueDate)}</div>
              {timeSlot && timeSlot.startTime && (
                <div className="text-gray-600 mt-1">• {formatTime()}</div>
              )}
            </div>
          </div>

          {/* 소요 시간 - AI에 추가되고 추천된 경우에만 표시 */}
          {assignment.addedToAI && assignment.estimatedTime > 0 && (
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-gray-600 mt-0.5" />
              <div className="flex-1">
                <div className="text-gray-900">예상 소요 시간</div>
                <div className="text-gray-600 mt-1">• {assignment.estimatedTime}분</div>
                {assignment.progress !== undefined && assignment.progress > 0 && (
                  <div className="text-gray-600 mt-1">• 진도율: {assignment.progress}%</div>
                )}
              </div>
            </div>
          )}

          {/* 반복 */}
          {assignment.repeat && assignment.repeat !== 'none' && (
            <div className="flex items-start gap-3">
              <Repeat className="w-5 h-5 text-gray-600 mt-0.5" />
              <div className="flex-1">
                <div className="text-gray-600">{getRepeatText(assignment.repeat)}</div>
              </div>
            </div>
          )}

          {/* 알림 */}
          {assignment.reminder && assignment.reminder !== 'none' && (
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-gray-600 mt-0.5" />
              <div className="flex-1">
                <div className="text-gray-600">알림: {getReminderText(assignment.reminder)}</div>
              </div>
            </div>
          )}

          {/* 메모 */}
          {assignment.memo && (
            <div className="flex items-start gap-3 pt-2">
              <BookOpen className="w-5 h-5 text-gray-600 mt-0.5" />
              <div className="flex-1">
                <div className="text-gray-900">메모</div>
                <div className="text-gray-600 mt-1 whitespace-pre-wrap">{assignment.memo}</div>
              </div>
            </div>
          )}

          {/* 완료 상태 */}
          {assignment.completed && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-700 text-sm">✓ 완료됨</p>
            </div>
          )}

          {/* AI 추가 여부 */}
          {!assignment.addedToAI && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-blue-700 text-sm">
                💡 과제 탭에서 'AI에 추가'하면 AI가 최적의 시간을 추천합니다
              </p>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
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
