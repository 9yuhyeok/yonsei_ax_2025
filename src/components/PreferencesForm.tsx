import { useState } from 'react';
import { Clock, Save } from 'lucide-react';

export interface Preferences {
  preferredLocations: string[]; // 호환성을 위해 유지하지만 UI에서 제거
  preferredTimeSlots: {
    startTime: string;
    endTime: string;
  }[];
  avoidTimeSlots: {
    startTime: string;
    endTime: string;
  }[];
  hideClassesInMonthly: boolean;
}

interface PreferencesFormProps {
  onSave: (preferences: Preferences) => void;
  initialPreferences?: Preferences;
}

export function PreferencesForm({ onSave, initialPreferences }: PreferencesFormProps) {
  const [preferences, setPreferences] = useState<Preferences>(
    initialPreferences || {
      preferredLocations: [],
      preferredTimeSlots: [],
      avoidTimeSlots: [],
      hideClassesInMonthly: false
    }
  );
  const [newPreferredTime, setNewPreferredTime] = useState({ startTime: '09:00', endTime: '12:00' });
  const [newAvoidTime, setNewAvoidTime] = useState({ startTime: '18:00', endTime: '20:00' });

  const addPreferredTime = () => {
    setPreferences({
      ...preferences,
      preferredTimeSlots: [...preferences.preferredTimeSlots, newPreferredTime]
    });
  };

  const removePreferredTime = (index: number) => {
    setPreferences({
      ...preferences,
      preferredTimeSlots: preferences.preferredTimeSlots.filter((_, i) => i !== index)
    });
  };

  const addAvoidTime = () => {
    setPreferences({
      ...preferences,
      avoidTimeSlots: [...preferences.avoidTimeSlots, newAvoidTime]
    });
  };

  const removeAvoidTime = (index: number) => {
    setPreferences({
      ...preferences,
      avoidTimeSlots: preferences.avoidTimeSlots.filter((_, i) => i !== index)
    });
  };

  const handleSave = () => {
    onSave(preferences);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2">과제 선호 설정</h3>
        <p className="text-gray-600 mb-4">과제할 때 선호하는 시간대를 설정하면 더 맞춤화된 추천을 받을 수 있습니다.</p>
      </div>

      {/* 선호 시간대 */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-5 h-5 text-green-600" />
          <h4 className="text-green-900">선호하는 시간대</h4>
        </div>
        
        <div className="flex gap-2 mb-3">
          <input
            type="time"
            value={newPreferredTime.startTime}
            onChange={(e) => setNewPreferredTime({ ...newPreferredTime, startTime: e.target.value })}
            className="px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <span className="flex items-center">~</span>
          <input
            type="time"
            value={newPreferredTime.endTime}
            onChange={(e) => setNewPreferredTime({ ...newPreferredTime, endTime: e.target.value })}
            className="px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={addPreferredTime}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            추가
          </button>
        </div>

        {preferences.preferredTimeSlots.length > 0 && (
          <div className="space-y-2">
            {preferences.preferredTimeSlots.map((slot, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-3 py-2 bg-white border border-green-300 rounded-md"
              >
                <span>{slot.startTime} ~ {slot.endTime}</span>
                <button
                  onClick={() => removePreferredTime(index)}
                  className="text-green-600 hover:text-green-800"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 피하고 싶은 시간대 */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-5 h-5 text-red-600" />
          <h4 className="text-red-900">피하고 싶은 시간대</h4>
        </div>
        
        <div className="flex gap-2 mb-3">
          <input
            type="time"
            value={newAvoidTime.startTime}
            onChange={(e) => setNewAvoidTime({ ...newAvoidTime, startTime: e.target.value })}
            className="px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <span className="flex items-center">~</span>
          <input
            type="time"
            value={newAvoidTime.endTime}
            onChange={(e) => setNewAvoidTime({ ...newAvoidTime, endTime: e.target.value })}
            className="px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button
            onClick={addAvoidTime}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            추가
          </button>
        </div>

        {preferences.avoidTimeSlots.length > 0 && (
          <div className="space-y-2">
            {preferences.avoidTimeSlots.map((slot, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-3 py-2 bg-white border border-red-300 rounded-md"
              >
                <span>{slot.startTime} ~ {slot.endTime}</span>
                <button
                  onClick={() => removeAvoidTime(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 월간 캘린더 설정 */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-purple-900 mb-1">월간 캘린더 설정</h4>
            <p className="text-sm text-purple-700">월간 뷰에서 고정 학교 수업 표시 여부</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={!preferences.hideClassesInMonthly}
              onChange={(e) => setPreferences({ ...preferences, hideClassesInMonthly: !e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full py-3 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center justify-center gap-2"
      >
        <Save className="w-5 h-5" />
        설정 저장
      </button>
    </div>
  );
}
