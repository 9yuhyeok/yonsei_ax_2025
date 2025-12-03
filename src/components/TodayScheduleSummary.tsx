import { Calendar, Clock, MapPin, Coffee } from 'lucide-react';
import type { TimeSlot } from '../App';

interface TodayScheduleSummaryProps {
  schedule: TimeSlot[];
}

export function TodayScheduleSummary({ schedule }: TodayScheduleSummaryProps) {
  // 오늘 요일 구하기
  const today = new Date();
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const todayName = dayNames[today.getDay()];

  // 오늘 수업 필터링
  const todayClasses = schedule.filter(
    slot => slot.day === todayName && slot.subject && !slot.isBlocked
  );

  // 공강 시간 계산
  const calculateFreeTime = () => {
    if (todayClasses.length === 0) {
      return [{ startTime: '09:00', endTime: '18:00', duration: 9 }];
    }

    const freeSlots: { startTime: string; endTime: string; duration: number }[] = [];
    const sortedClasses = [...todayClasses].sort((a, b) => a.startTime.localeCompare(b.startTime));

    // 첫 수업 전 공강
    if (sortedClasses[0].startTime > '09:00') {
      const duration = calculateDuration('09:00', sortedClasses[0].startTime);
      if (duration > 0) {
        freeSlots.push({
          startTime: '09:00',
          endTime: sortedClasses[0].startTime,
          duration
        });
      }
    }

    // 수업 사이 공강
    for (let i = 0; i < sortedClasses.length - 1; i++) {
      const currentEnd = sortedClasses[i].endTime;
      const nextStart = sortedClasses[i + 1].startTime;
      const duration = calculateDuration(currentEnd, nextStart);
      
      if (duration > 0) {
        freeSlots.push({
          startTime: currentEnd,
          endTime: nextStart,
          duration
        });
      }
    }

    // 마지막 수업 후 공강
    const lastClass = sortedClasses[sortedClasses.length - 1];
    if (lastClass.endTime < '18:00') {
      const duration = calculateDuration(lastClass.endTime, '18:00');
      if (duration > 0) {
        freeSlots.push({
          startTime: lastClass.endTime,
          endTime: '18:00',
          duration
        });
      }
    }

    return freeSlots;
  };

  const calculateDuration = (startTime: string, endTime: string): number => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const totalMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
    return Math.round(totalMinutes / 60 * 10) / 10; // 소수점 첫째자리까지
  };

  const freeTimeSlots = calculateFreeTime();
  const totalFreeTime = freeTimeSlots.reduce((sum, slot) => sum + slot.duration, 0);

  if (todayClasses.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-6 h-6 text-blue-600" />
          <h3 className="text-blue-900">오늘 ({todayName}요일) 일정</h3>
        </div>
        <div className="text-center py-8">
          <Coffee className="w-16 h-16 mx-auto mb-3 text-blue-400" />
          <p className="text-blue-700">오늘은 수업이 없습니다!</p>
          <p className="text-blue-600">자유롭게 시간을 활용하세요 🎉</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          <h3 className="text-blue-900">오늘 ({todayName}요일) 일정</h3>
        </div>
        <span className="px-3 py-1 bg-blue-600 text-white rounded-full">
          총 {todayClasses.length}개 수업
        </span>
      </div>

      {/* 오늘 수업 목록 */}
      <div className="space-y-3 mb-6">
        {todayClasses.map((classItem, index) => (
          <div
            key={index}
            className="bg-white border border-blue-200 rounded-lg p-4 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-gray-900 mb-2">{classItem.subject}</h4>
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{classItem.startTime} - {classItem.endTime}</span>
                  </div>
                </div>
              </div>
              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-sm">
                {index + 1}교시
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 공강 시간 요약 */}
      <div className="bg-white border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Coffee className="w-5 h-5 text-green-600" />
          <h4 className="text-green-900">오늘 공강 시간</h4>
        </div>
        
        {freeTimeSlots.length > 0 ? (
          <div className="space-y-2">
            {freeTimeSlots.map((slot, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-3 py-2 bg-green-50 border border-green-200 rounded-md"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span className="text-gray-700">
                    {slot.startTime} - {slot.endTime}
                  </span>
                </div>
                <span className="text-green-700">
                  {slot.duration}시간
                </span>
              </div>
            ))}
            <div className="mt-3 pt-3 border-t border-green-200">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">총 공강 시간</span>
                <span className="text-green-700">
                  {totalFreeTime}시간
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-600 text-center py-3">
            오늘은 공강 시간이 없습니다
          </p>
        )}
      </div>
    </div>
  );
}
