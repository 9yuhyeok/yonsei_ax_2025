import { useState } from 'react';
import { TimeSlot, Assignment, Recommendation } from '../App';
import { DayDetailDialog } from './DayDetailDialog';

interface MonthlyViewProps {
  schedule: TimeSlot[];
  recommendations: Recommendation[];
  currentDate: Date;
  hideClasses?: boolean;
  assignments?: Assignment[];
}

export function MonthlyView({ schedule, recommendations, currentDate, hideClasses = false, assignments = [] }: MonthlyViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedClasses, setSelectedClasses] = useState<TimeSlot[]>([]);
  const [selectedAssignments, setSelectedAssignments] = useState<Array<{
    assignment: Assignment;
    timeSlot: TimeSlot;
    fromRecommendation: boolean;
  }>>([]);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // 월의 첫날과 마지막날
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  // 첫 주의 시작일 (일요일부터 시작)
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - startDate.getDay());
  
  // 마지막 주의 종료일
  const endDate = new Date(lastDay);
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
  
  // 캘린더에 표시할 날짜들
  const dates: Date[] = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  // 주 단위로 그룹화
  const weeks: Date[][] = [];
  for (let i = 0; i < dates.length; i += 7) {
    weeks.push(dates.slice(i, i + 7));
  }

  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const koreanDayNames = ['일', '월', '화', '수', '목', '금', '토'];

  // 특정 날짜에 일정이 있는지 확인
  const getDateSchedules = (date: Date) => {
    const dayName = koreanDayNames[date.getDay()];
    const dateStr = date.toISOString().split('T')[0];
    
    // hideClasses가 true면 수업 제외
    const classCount = hideClasses ? 0 : schedule.filter(s => 
      s.day === dayName && s.subject
    ).length;

    // 추천에서 해당 요일의 과제
    const recommendationsForDay = recommendations.filter(r => 
      r.timeSlot.day === dayName
    );

    // 해당 날짜의 모든 과제
    const dateAssignments = assignments.filter(a => {
      const dueDate = new Date(a.dueDate);
      return dueDate.toISOString().split('T')[0] === dateStr;
    });

    // 추천에 없는 과제를 추가
    const allAssignments = [
      ...recommendationsForDay.map(r => ({ ...r, fromRecommendation: true })),
      ...dateAssignments
        .filter(a => !recommendationsForDay.some(r => r.assignment.id === a.id))
        .map(a => ({
          assignment: a,
          timeSlot: { day: dayName, startTime: '', endTime: '' },
          reason: '',
          fromRecommendation: false
        }))
    ];

    const assignmentCount = allAssignments.filter(r => r.assignment.type === 'school').length;
    const personalCount = allAssignments.filter(r => r.assignment.type === 'personal').length;

    return { classCount, assignmentCount, personalCount, assignments: allAssignments };
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === month;
  };

  const handleDateClick = (date: Date) => {
    const dayName = koreanDayNames[date.getDay()];
    const schedules = getDateSchedules(date);
    
    // 해당 날짜의 수업 가져오기
    const dayClasses = schedule.filter(s => 
      s.day === dayName && s.subject && !s.isBlocked
    ).sort((a, b) => a.startTime.localeCompare(b.startTime));
    
    // 항상 다이얼로그 표시 (수업이나 과제가 없어도)
    setSelectedDate(date);
    setSelectedClasses(hideClasses ? [] : dayClasses);
    setSelectedAssignments(schedules.assignments);
  };

  const handleCloseDialog = () => {
    setSelectedDate(null);
    setSelectedClasses([]);
    setSelectedAssignments([]);
  };

  return (
    <div className="p-4">
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div 
            key={day} 
            className={`text-center text-xs py-2 ${
              day === '일' ? 'text-red-500' : 
              day === '토' ? 'text-blue-500' : 
              'text-gray-600'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 캘린더 그리드 */}
      <div className="space-y-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1">
            {week.map((date, dayIndex) => {
              const schedules = getDateSchedules(date);
              const hasSchedules = schedules.classCount > 0 || 
                                   schedules.assignmentCount > 0 || 
                                   schedules.personalCount > 0;
              
              return (
                <div
                  key={dayIndex}
                  onClick={() => handleDateClick(date)}
                  className={`min-h-[70px] border rounded-lg p-1 cursor-pointer transition-all hover:shadow-md ${
                    isToday(date)
                      ? 'bg-indigo-50 border-indigo-300'
                      : isCurrentMonth(date)
                      ? 'bg-white border-gray-200'
                      : 'bg-gray-50 border-gray-100'
                  }`}
                >
                  <div
                    className={`text-xs mb-1 ${
                      isToday(date)
                        ? 'text-indigo-600'
                        : !isCurrentMonth(date)
                        ? 'text-gray-400'
                        : dayIndex === 0
                        ? 'text-red-500'
                        : dayIndex === 6
                        ? 'text-blue-500'
                        : 'text-gray-700'
                    }`}
                  >
                    {date.getDate()}
                  </div>

                  {isCurrentMonth(date) && (
                    <div className="space-y-0.5">
                      {schedules.classCount > 0 && (
                        <div className="w-full h-1 bg-green-300 rounded"></div>
                      )}
                      {schedules.assignments.slice(0, 2).map((rec, idx) => (
                        <div
                          key={idx}
                          className={`text-[9px] leading-tight px-0.5 py-0.5 rounded truncate ${
                            rec.assignment.type === 'school'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-pink-100 text-pink-800'
                          }`}
                          title={rec.assignment.title}
                        >
                          {rec.assignment.title}
                        </div>
                      ))}
                      {schedules.assignments.length > 2 && (
                        <div className="text-[9px] text-gray-500 px-0.5">
                          +{schedules.assignments.length - 2}개
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* 범례 */}
      <div className="mt-4 flex flex-wrap gap-3 text-xs">
        {!hideClasses && (
          <div className="flex items-center gap-1">
            <div className="w-8 h-1 rounded bg-green-300"></div>
            <span className="text-gray-600">수업</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <div className="w-8 h-1 rounded bg-yellow-300"></div>
          <span className="text-gray-600">학교 과제</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-8 h-1 rounded bg-pink-300"></div>
          <span className="text-gray-600">개인 일정</span>
        </div>
      </div>

      {/* 날짜별 상세 다이얼로그 */}
      {selectedDate && (
        <DayDetailDialog
          date={selectedDate}
          classes={selectedClasses}
          assignments={selectedAssignments}
          onClose={handleCloseDialog}
        />
      )}
    </div>
  );
}
