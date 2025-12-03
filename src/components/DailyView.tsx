import { TimeSlot, Assignment, Recommendation } from '../App';

interface DailyViewProps {
  schedule: TimeSlot[];
  recommendations: Recommendation[];
  currentDate: Date;
  assignments?: Assignment[];
}

interface ScheduleItem {
  startTime: string;
  endTime: string;
  title: string;
  subtitle?: string;
  location?: string;
  type: 'class' | 'assignment' | 'personal';
}

export function DailyView({ schedule, recommendations, currentDate, assignments = [] }: DailyViewProps) {
  // 시간에 분을 더하는 헬퍼 함수 (자연수 시간으로 반올림)
  const addMinutesToTime = (time: string, minutes: number): string => {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.ceil(totalMinutes / 60); // 자연수 시간으로 올림
    return `${String(newHours).padStart(2, '0')}:00`;
  };
  
  // 현재 날짜의 요일 구하기
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const currentDay = dayNames[currentDate.getDay()];
  
  // 현재 날짜와 일치하는 과제 찾기
  const todayDate = currentDate.toISOString().split('T')[0];
  const todayAssignments = assignments.filter(a => {
    const dueDate = new Date(a.dueDate);
    return dueDate.toISOString().split('T')[0] === todayDate;
  });
  
  // 해당 요일의 스케줄만 필터링
  const daySchedule: ScheduleItem[] = [
    ...schedule
      .filter(s => s.day === currentDay && s.subject)
      .map(s => ({
        startTime: s.startTime,
        endTime: s.endTime,
        title: s.subject || '',
        type: 'class' as const
      })),
    ...recommendations
      .filter(r => r.timeSlot.day === currentDay)
      .map(r => {
        // 과제의 실제 소요 시간에 맞게 endTime 계산
        const progress = r.assignment.progress || 0;
        const remainingTime = Math.ceil(r.assignment.estimatedTime * (100 - progress) / 100);
        const calculatedEndTime = addMinutesToTime(r.timeSlot.startTime, remainingTime);
        
        return {
          startTime: r.timeSlot.startTime,
          endTime: calculatedEndTime,
          title: r.assignment.title,
          subtitle: `${remainingTime}분`,
          type: r.assignment.type === 'school' ? 'assignment' as const : 'personal' as const
        };
      }),
    // 오늘의 과제 추가 (recommendations에 없는 경우만)
    ...todayAssignments
      .filter(a => !recommendations.some(r => r.assignment.id === a.id && r.timeSlot.day === currentDay))
      .map(a => {
        const calculatedEndTime = addMinutesToTime('09:00', a.estimatedTime);
        return {
          startTime: '09:00',
          endTime: calculatedEndTime,
          title: a.title,
          subtitle: `${a.estimatedTime}분`,
          type: a.type === 'school' ? 'assignment' as const : 'personal' as const
        };
      })
  ];

  // 시간 범위 계산 (기본: 9-16시, 데이터에 따라 확장)
  const getTimeRange = () => {
    let minHour = 9;
    let maxHour = 16;

    daySchedule.forEach(item => {
      const startHour = parseInt(item.startTime.split(':')[0]);
      const endHour = parseInt(item.endTime.split(':')[0]);
      
      if (startHour < minHour) minHour = startHour;
      if (endHour > maxHour) maxHour = endHour;
    });

    const hours: number[] = [];
    for (let h = minHour; h <= maxHour; h++) {
      hours.push(h);
    }
    return hours;
  };

  const hours = getTimeRange();

  const getColorClass = (type: 'class' | 'assignment' | 'personal') => {
    switch (type) {
      case 'class':
        return 'bg-green-50 border-l-4 border-green-400 text-green-900';
      case 'assignment':
        return 'bg-yellow-50 border-l-4 border-yellow-400 text-yellow-900';
      case 'personal':
        return 'bg-pink-50 border-l-4 border-pink-400 text-pink-900';
    }
  };

  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const formatTime = (time: string) => {
    return time;
  };

  return (
    <div className="p-4">
      <div className="space-y-1">
        {hours.map(hour => {
          const hourStart = `${String(hour).padStart(2, '0')}:00`;
          const hourEnd = `${String(hour + 1).padStart(2, '0')}:00`;
          
          // 현재 시간대의 일정 찾기
          const hourItems = daySchedule.filter(item => {
            const itemStart = timeToMinutes(item.startTime);
            const itemEnd = timeToMinutes(item.endTime);
            const currentHourStart = hour * 60;
            const currentHourEnd = (hour + 1) * 60;
            
            return itemStart < currentHourEnd && itemEnd > currentHourStart;
          });

          return (
            <div key={hour} className="flex gap-3 min-h-[60px] border-b border-gray-100">
              {/* 시간 */}
              <div className="w-12 flex-shrink-0 text-sm text-gray-500 pt-1">
                {String(hour).padStart(2, '0')}:00
              </div>

              {/* 일정 영역 */}
              <div className="flex-1 py-1">
                {hourItems.length > 0 ? (
                  <div className="space-y-2">
                    {hourItems.map((item, index) => (
                      <div
                        key={index}
                        className={`rounded-lg p-3 ${getColorClass(item.type)}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="text-sm">{item.title}</div>
                            {item.subtitle && (
                              <div className="text-xs opacity-75 mt-1">{item.subtitle}</div>
                            )}
                            {item.location && (
                              <div className="text-xs opacity-75 mt-1">{item.location}</div>
                            )}
                          </div>
                          <div className="text-xs opacity-75 ml-2">
                            {formatTime(item.startTime)} - {formatTime(item.endTime)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center">
                    <span className="text-xs text-gray-300">일정 없음</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 시간표에 없는 오늘의 할일 */}
      {todayAssignments.length > 0 && (
        <div className="mt-6 border-t border-gray-200 pt-4">
          <h3 className="text-sm text-gray-700 mb-3">오늘의 할일</h3>
          <div className="space-y-2">
            {todayAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className={`rounded-lg p-3 ${
                  assignment.type === 'school'
                    ? 'bg-yellow-50 border-l-4 border-yellow-400 text-yellow-900'
                    : 'bg-pink-50 border-l-4 border-pink-400 text-pink-900'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-sm">{assignment.title}</div>
                    {/* AI에 추가된 과제만 소요 시간 표시 */}
                    {assignment.addedToAI && assignment.estimatedTime > 0 && (
                      <div className="text-xs opacity-75 mt-1">{assignment.estimatedTime}분</div>
                    )}
                    {assignment.memo && (
                      <div className="text-xs opacity-75 mt-1">{assignment.memo}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 범례 */}
      <div className="mt-6 flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-200 border-l-4 border-green-400"></div>
          <span className="text-gray-600">수업</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-yellow-200 border-l-4 border-yellow-400"></div>
          <span className="text-gray-600">학교 과제</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-pink-200 border-l-4 border-pink-400"></div>
          <span className="text-gray-600">개인 일정</span>
        </div>
      </div>
    </div>
  );
}
