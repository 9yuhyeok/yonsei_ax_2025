import { TimeSlot, Assignment, Recommendation } from '../App';

interface WeeklyViewProps {
  schedule: TimeSlot[];
  recommendations: Recommendation[];
  currentDate: Date;
  assignments?: Assignment[];
}

interface ScheduleItem {
  day: string;
  startTime: string;
  endTime: string;
  title: string;
  subtitle?: string;
  location?: string;
  type: 'class' | 'assignment' | 'personal';
}

export function WeeklyView({ schedule, recommendations, currentDate, assignments = [] }: WeeklyViewProps) {
  const days = ['월', '화', '수', '목', '금'];
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  
  // 시간에 분을 더하는 헬퍼 함수 (자연수 시간으로 반올림)
  const addMinutesToTime = (time: string, minutes: number): string => {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.ceil(totalMinutes / 60); // 자연수 시간으로 올림
    return `${String(newHours).padStart(2, '0')}:00`;
  };
  
  // 현재 주의 시작일과 종료일 계산
  const getWeekRange = () => {
    const day = currentDate.getDay();
    const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1); // 월요일 기준
    const monday = new Date(currentDate.setDate(diff));
    const friday = new Date(monday);
    friday.setDate(friday.getDate() + 4);
    return { monday, friday };
  };
  
  const { monday, friday } = getWeekRange();
  
  // 현재 주에 해당하는 과제 찾기
  const weekAssignments = assignments.filter(a => {
    const dueDate = new Date(a.dueDate);
    return dueDate >= monday && dueDate <= friday;
  }).map(a => {
    const dueDate = new Date(a.dueDate);
    const dueDayName = dayNames[dueDate.getDay()];
    return { assignment: a, day: dueDayName };
  });
  
  // 스케줄 + 추천을 하나의 배열로 합치기
  const allItems: ScheduleItem[] = [
    ...schedule
      .filter(s => s.subject)
      .map(s => ({
        day: s.day,
        startTime: s.startTime,
        endTime: s.endTime,
        title: s.subject || '',
        type: 'class' as const
      })),
    ...recommendations.map(r => {
      // 과제의 실제 소요 시간에 맞게 endTime 계산
      const progress = r.assignment.progress || 0;
      const remainingTime = Math.ceil(r.assignment.estimatedTime * (100 - progress) / 100);
      const calculatedEndTime = addMinutesToTime(r.timeSlot.startTime, remainingTime);
      
      return {
        day: r.timeSlot.day,
        startTime: r.timeSlot.startTime,
        endTime: calculatedEndTime,
        title: r.assignment.title,
        subtitle: `${remainingTime}분`,
        type: r.assignment.type === 'school' ? 'assignment' as const : 'personal' as const
      };
    }),
    // 주간 과제 추가 (recommendations에 없는 경우만)
    ...weekAssignments
      .filter(wa => days.includes(wa.day))
      .filter(wa => !recommendations.some(r => r.assignment.id === wa.assignment.id && r.timeSlot.day === wa.day))
      .map(wa => {
        const calculatedEndTime = addMinutesToTime('09:00', wa.assignment.estimatedTime);
        // AI에 추가된 과제만 소요 시간 표시
        const subtitle = wa.assignment.addedToAI && wa.assignment.estimatedTime > 0 
          ? `${wa.assignment.estimatedTime}분` 
          : '시간 미정';
        return {
          day: wa.day,
          startTime: '09:00',
          endTime: calculatedEndTime,
          title: wa.assignment.title,
          subtitle: subtitle,
          type: wa.assignment.type === 'school' ? 'assignment' as const : 'personal' as const
        };
      })
  ];

  // 시간 범위 계산 (기본: 9-16시, 데이터에 따라 확장)
  const getTimeRange = () => {
    let minHour = 9;
    let maxHour = 16;

    allItems.forEach(item => {
      const startHour = parseInt(item.startTime.split(':')[0]);
      const endHour = parseInt(item.endTime.split(':')[0]);
      
      if (startHour < minHour) minHour = startHour;
      if (endHour > maxHour) maxHour = endHour;
    });

    const hours: string[] = [];
    for (let h = minHour; h <= maxHour; h++) {
      hours.push(String(h));
    }
    return { hours, minHour };
  };

  const { hours, minHour } = getTimeRange();

  const getColorClass = (type: 'class' | 'assignment' | 'personal') => {
    switch (type) {
      case 'class':
        return 'bg-green-100 border-green-300 text-green-900';
      case 'assignment':
        return 'bg-yellow-100 border-yellow-300 text-yellow-900';
      case 'personal':
        return 'bg-pink-100 border-pink-300 text-pink-900';
    }
  };

  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const getItemPosition = (startTime: string, endTime: string) => {
    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);
    const baseTime = minHour * 60;
    
    const top = ((start - baseTime) / 60) * 60; // 1시간당 60px
    const height = ((end - start) / 60) * 60;
    
    return { top, height };
  };

  return (
    <div className="p-4">
      {/* 시간표 그리드 */}
      <div className="relative">
        {/* 요일 헤더 */}
        <div className="grid grid-cols-6 gap-1 mb-2">
          <div className="text-xs text-gray-500 text-center"></div>
          {days.map(day => (
            <div key={day} className="text-xs text-gray-500 text-center">
              {day}
            </div>
          ))}
        </div>

        {/* 시간표 그리드 */}
        <div className="grid grid-cols-6 gap-1">
          {/* 시간 열 */}
          <div className="flex flex-col">
            {hours.map(hour => (
              <div key={hour} className="h-[60px] flex items-start justify-center text-xs text-gray-500">
                {hour}
              </div>
            ))}
          </div>

          {/* 요일별 열 */}
          {days.map((day, dayIndex) => (
            <div key={day} className="relative border-l border-gray-200">
              {/* 시간 구분선 */}
              {hours.map((hour, hourIndex) => (
                <div 
                  key={hour} 
                  className="h-[60px] border-b border-gray-100"
                />
              ))}

              {/* 일정 아이템 */}
              {allItems
                .filter(item => item.day === day)
                .map((item, index) => {
                  const { top, height } = getItemPosition(item.startTime, item.endTime);
                  return (
                    <div
                      key={index}
                      className={`absolute left-0 right-0 mx-0.5 rounded border ${getColorClass(item.type)} p-1 overflow-hidden`}
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                        minHeight: '50px'
                      }}
                    >
                      <div className="text-xs leading-tight">
                        <div className="line-clamp-2">{item.title}</div>
                        {item.subtitle && (
                          <div className="text-xs opacity-75 mt-0.5">{item.subtitle}</div>
                        )}
                        {item.location && (
                          <div className="text-xs opacity-75">{item.location}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </div>

      {/* 범례 */}
      <div className="mt-4 flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-200 border border-green-300"></div>
          <span className="text-gray-600">수업</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-yellow-200 border border-yellow-300"></div>
          <span className="text-gray-600">학교 과제</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-pink-200 border border-pink-300"></div>
          <span className="text-gray-600">개인 일정</span>
        </div>
      </div>
    </div>
  );
}
