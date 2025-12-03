import { useState, useEffect } from 'react';
import { X, CheckCircle, Clock } from 'lucide-react';
import type { Assignment } from '../App';
import { toast } from 'sonner@2.0.3';

interface ProgressCheckDialogProps {
  assignment: Assignment;
  timeSlot: {
    day: string;
    startTime: string;
    endTime: string;
  };
  onClose: () => void;
  onUpdate: (assignmentId: string, completed: boolean, progress: number) => void;
}

export function ProgressCheckDialog({ assignment, timeSlot, onClose, onUpdate }: ProgressCheckDialogProps) {
  const [progress, setProgress] = useState(assignment.progress || 0);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleSubmit = () => {
    onUpdate(assignment.id, isCompleted, progress);
    
    if (isCompleted) {
      toast.success('과제를 완료했습니다! 🎉');
    } else if (progress > 0) {
      toast.info(`진도율 ${progress}%로 저장되었습니다`);
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-900">일정 완료 체크</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
            <h4 className="text-indigo-900 mb-2">{assignment.title}</h4>
            <div className="flex items-center gap-2 text-indigo-600">
              <Clock className="w-4 h-4" />
              <span>{timeSlot.day}요일 {timeSlot.startTime} - {timeSlot.endTime}</span>
            </div>
          </div>

          <div className="space-y-4">
            {/* 완료 여부 */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isCompleted}
                  onChange={(e) => {
                    setIsCompleted(e.target.checked);
                    if (e.target.checked) {
                      setProgress(100);
                    }
                  }}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-gray-700">완료했습니다</span>
              </label>
            </div>

            {/* 진도율 */}
            {!isCompleted && (
              <div>
                <label className="block text-gray-700 mb-2">
                  진도율: {progress}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-gray-500 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            )}

            {/* 진도율 표시 바 */}
            <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  isCompleted
                    ? 'bg-green-600'
                    : progress >= 70
                    ? 'bg-blue-600'
                    : progress >= 30
                    ? 'bg-yellow-600'
                    : 'bg-red-600'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            저장
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
