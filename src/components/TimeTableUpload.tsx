import { useState } from 'react';
import { Upload, Image as ImageIcon, Loader2, CheckCircle, XCircle } from 'lucide-react';
import type { TimeSlot } from '../App';

interface TimeTableUploadProps {
  onScheduleAnalyzed: (schedule: TimeSlot[]) => void;
  currentSchedule: TimeSlot[];
}

export function TimeTableUpload({ onScheduleAnalyzed, currentSchedule }: TimeTableUploadProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [blockedSlots, setBlockedSlots] = useState<TimeSlot[]>([]);
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [newBlock, setNewBlock] = useState({
    day: '월',
    startTime: '09:00',
    endTime: '10:00'
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
        analyzeTimeTable();
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeTimeTable = () => {
    setIsAnalyzing(true);
    
    // Mock AI 분석 (실제로는 AI API를 호출)
    setTimeout(() => {
      const mockSchedule: TimeSlot[] = [
        { day: '월', startTime: '09:00', endTime: '10:00', subject: '데이터구조' },
        { day: '월', startTime: '13:00', endTime: '14:00', subject: '알고리즘' },
        { day: '화', startTime: '10:00', endTime: '12:00', subject: '운영체제' },
        { day: '화', startTime: '14:00', endTime: '16:00', subject: '데이터베이스' },
        { day: '수', startTime: '09:00', endTime: '11:00', subject: '소프트웨어공학' },
        { day: '목', startTime: '13:00', endTime: '15:00', subject: '컴퓨터네트워크' },
        { day: '목', startTime: '16:00', endTime: '17:00', subject: '인공지능' },
        { day: '금', startTime: '10:00', endTime: '12:00', subject: '웹프로그래밍' },
      ];
      
      // 분석된 시간표와 차단된 시간 합치기
      const combinedSchedule = [...mockSchedule, ...blockedSlots.map(slot => ({
        ...slot,
        isBlocked: true,
        subject: '비우고 싶은 시간'
      }))];
      
      onScheduleAnalyzed(combinedSchedule);
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleBlockFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewBlock(prev => ({ ...prev, [name]: value }));
  };

  const addBlockedSlot = () => {
    setBlockedSlots(prev => [...prev, newBlock]);
    setShowBlockForm(false);
    setNewBlock({ day: '월', startTime: '09:00', endTime: '10:00' });
  };

  return (
    <div>
      <h2 className="mb-4">시간표 분석</h2>
      
      {!imagePreview ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <label className="cursor-pointer block">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">시간표 이미지를 업로드하세요</p>
            <p className="text-gray-400">PNG, JPG 형식 지원</p>
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <img 
              src={imagePreview} 
              alt="시간표" 
              className="w-full max-h-96 object-contain rounded-lg border border-gray-200"
            />
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                <div className="bg-white rounded-lg p-6 flex items-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                  <span className="text-gray-700">AI가 시간표를 분석하는 중...</span>
                </div>
              </div>
            )}
          </div>

          {currentSchedule.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800">시간표 분석 완료!</span>
              </div>
              
              <div className="space-y-2">
                <p className="text-gray-600">총 {currentSchedule.length}개 수업 감지됨</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                  {currentSchedule.map((slot, index) => (
                    <div key={index} className="bg-white rounded-md p-3 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-indigo-600">{slot.day}요일</span>
                        <span className="text-gray-500">{slot.startTime} - {slot.endTime}</span>
                      </div>
                      <p className="text-gray-800 mt-1">{slot.subject}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              setImagePreview(null);
              onScheduleAnalyzed([]);
            }}
            className="text-indigo-600 hover:text-indigo-700 flex items-center gap-2"
          >
            <ImageIcon className="w-4 h-4" />
            다른 시간표 업로드
          </button>

          <button
            onClick={() => setShowBlockForm(true)}
            className="text-red-600 hover:text-red-700 flex items-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            시간표 차단 추가
          </button>

          {showBlockForm && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
              <h3 className="text-gray-800 mb-3">차단 시간 추가</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="text-gray-600">요일:</label>
                  <input
                    type="text"
                    name="day"
                    value={newBlock.day}
                    onChange={handleBlockFormChange}
                    className="border border-gray-300 rounded-md px-2 py-1"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-gray-600">시작 시간:</label>
                  <input
                    type="text"
                    name="startTime"
                    value={newBlock.startTime}
                    onChange={handleBlockFormChange}
                    className="border border-gray-300 rounded-md px-2 py-1"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-gray-600">종료 시간:</label>
                  <input
                    type="text"
                    name="endTime"
                    value={newBlock.endTime}
                    onChange={handleBlockFormChange}
                    className="border border-gray-300 rounded-md px-2 py-1"
                  />
                </div>
              </div>
              <button
                onClick={addBlockedSlot}
                className="text-green-600 hover:text-green-700 flex items-center gap-2 mt-3"
              >
                <CheckCircle className="w-4 h-4" />
                추가
              </button>
            </div>
          )}

          {blockedSlots.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
              <h3 className="text-gray-800 mb-3">차단 시간 목록</h3>
              <div className="space-y-2">
                {blockedSlots.map((slot, index) => (
                  <div key={index} className="bg-white rounded-md p-3 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-indigo-600">{slot.day}요일</span>
                      <span className="text-gray-500">{slot.startTime} - {slot.endTime}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}