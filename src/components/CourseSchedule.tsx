import { Calendar, Clock, BookOpen, Coffee, AlertCircle } from 'lucide-react';
import type { ScheduleEvent } from './GradesTab';

interface CourseScheduleProps {
  events: ScheduleEvent[];
}

export function CourseSchedule({ events }: CourseScheduleProps) {
  const getEventIcon = (type: ScheduleEvent['type']) => {
    switch (type) {
      case 'exam':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'break':
        return <Coffee className="w-5 h-5 text-green-600" />;
      case 'assignment':
        return <BookOpen className="w-5 h-5 text-blue-600" />;
      default:
        return <Calendar className="w-5 h-5 text-gray-600" />;
    }
  };

  const getEventColor = (type: ScheduleEvent['type']) => {
    switch (type) {
      case 'exam':
        return 'bg-red-50 border-red-200';
      case 'break':
        return 'bg-green-50 border-green-200';
      case 'assignment':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getEventLabel = (type: ScheduleEvent['type']) => {
    switch (type) {
      case 'exam':
        return '시험';
      case 'break':
        return '휴강';
      case 'assignment':
        return '과제';
      default:
        return '기타';
    }
  };

  // 날짜순 정렬
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // 날짜 포맷팅
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
    
    return `${year}년 ${month}월 ${day}일 (${dayOfWeek})`;
  };

  // 오늘 날짜
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 이벤트 타입별 분류
  const eventsByType = {
    exam: sortedEvents.filter(e => e.type === 'exam'),
    break: sortedEvents.filter(e => e.type === 'break'),
    assignment: sortedEvents.filter(e => e.type === 'assignment'),
    other: sortedEvents.filter(e => e.type === 'other')
  };

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>등록된 일정이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 타임라인 뷰 */}
      <div className="space-y-3">
        {sortedEvents.map((event) => {
          const eventDate = new Date(event.date);
          eventDate.setHours(0, 0, 0, 0);
          const isPast = eventDate < today;
          const isToday = eventDate.getTime() === today.getTime();
          const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

          return (
            <div
              key={event.id}
              className={`border rounded-lg p-4 ${getEventColor(event.type)} ${
                isPast ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                {getEventIcon(event.type)}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <span className="inline-block px-2 py-0.5 text-xs rounded bg-white bg-opacity-60 mb-2">
                        {getEventLabel(event.type)}
                      </span>
                      <h4 className="text-gray-900">{event.title}</h4>
                    </div>
                    {isToday && (
                      <span className="px-2 py-1 bg-red-500 text-white text-xs rounded">
                        오늘
                      </span>
                    )}
                    {!isPast && !isToday && daysUntil <= 7 && (
                      <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded">
                        D-{daysUntil}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Clock className="w-4 h-4" />
                    {formatDate(event.date)}
                  </div>
                  {event.description && (
                    <p className="text-sm text-gray-600 mt-2">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 요약 통계 */}
      <div className="grid grid-cols-2 gap-3">
        {eventsByType.exam.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-900">시험</span>
            </div>
            <p className="text-2xl text-red-600">{eventsByType.exam.length}회</p>
          </div>
        )}
        {eventsByType.assignment.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-900">과제</span>
            </div>
            <p className="text-2xl text-blue-600">{eventsByType.assignment.length}건</p>
          </div>
        )}
        {eventsByType.break.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Coffee className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-900">휴강</span>
            </div>
            <p className="text-2xl text-green-600">{eventsByType.break.length}일</p>
          </div>
        )}
      </div>
    </div>
  );
}
