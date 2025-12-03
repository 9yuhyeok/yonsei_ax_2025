import type { TimeSlot, Recommendation } from '../App';

interface TimeTableViewProps {
  recommendations: Recommendation[];
}

export function TimeTableView({ recommendations }: TimeTableViewProps) {
  const days = ['월', '화', '수', '목', '금'];
  const timeSlots = [
    '09:00-10:30',
    '10:30-12:00',
    '13:00-14:30',
    '14:30-16:00',
    '16:00-17:30'
  ];

  const getRecommendationForSlot = (day: string, time: string): Recommendation | undefined => {
    const [startTime, endTime] = time.split('-');
    return recommendations.find(
      rec => rec.timeSlot.day === day && 
             rec.timeSlot.startTime === startTime && 
             rec.timeSlot.endTime === endTime
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 border-red-400';
      case 'medium': return 'bg-yellow-100 border-yellow-400';
      case 'low': return 'bg-green-100 border-green-400';
      default: return 'bg-gray-100 border-gray-400';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border border-gray-300 bg-gray-100 p-3 min-w-[100px]">시간</th>
            {days.map(day => (
              <th key={day} className="border border-gray-300 bg-gray-100 p-3 min-w-[140px]">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map(time => (
            <tr key={time}>
              <td className="border border-gray-300 bg-gray-50 p-3 text-center">
                {time}
              </td>
              {days.map(day => {
                const rec = getRecommendationForSlot(day, time);
                return (
                  <td 
                    key={`${day}-${time}`} 
                    className={`border border-gray-300 p-2 ${
                      rec ? getPriorityColor(rec.assignment.priority) : 'bg-white'
                    }`}
                  >
                    {rec && (
                      <div className="text-sm">
                        <p className="text-gray-800 line-clamp-2 mb-1">
                          {rec.assignment.title}
                        </p>
                        {/* AI가 배치한 추천이므로 항상 소요 시간 표시 */}
                        {rec.assignment.estimatedTime > 0 && (
                          <p className="text-gray-600">
                            {rec.assignment.estimatedTime}분
                          </p>
                        )}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="flex items-center gap-4 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border border-red-400 rounded"></div>
          <span className="text-gray-600">높은 우선순위</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-100 border border-yellow-400 rounded"></div>
          <span className="text-gray-600">보통 우선순위</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border border-green-400 rounded"></div>
          <span className="text-gray-600">낮은 우선순위</span>
        </div>
      </div>
    </div>
  );
}
