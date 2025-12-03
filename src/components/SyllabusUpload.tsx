import { useState } from 'react';
import { Upload, Loader2, FileText, Sparkles } from 'lucide-react';
import type { Course, GradeComponent, ScheduleEvent } from './GradesTab';

interface SyllabusUploadProps {
  onSyllabusAnalyzed: (course: Course) => void;
}

export function SyllabusUpload({ onSyllabusAnalyzed }: SyllabusUploadProps) {
  const [syllabusText, setSyllabusText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = () => {
    if (!syllabusText.trim()) return;

    setIsAnalyzing(true);

    // AI 분석 시뮬레이션 (실제로는 AI API 호출)
    setTimeout(() => {
      // 예시: 강의 계획서에서 추출한 데이터
      const gradeComponents: GradeComponent[] = [
        { id: '1', name: '출석', weight: 10, maxScore: 100 },
        { id: '2', name: '과제', weight: 20, maxScore: 100 },
        { id: '3', name: '쪽지시험', weight: 10, maxScore: 100 },
        { id: '4', name: '중간고사', weight: 30, maxScore: 100 },
        { id: '5', name: '기말고사', weight: 30, maxScore: 100 }
      ];

      const scheduleEvents: ScheduleEvent[] = [
        {
          id: '1',
          type: 'break',
          title: '개천절 휴강',
          date: '2025-10-03',
          description: '공휴일'
        },
        {
          id: '2',
          type: 'exam',
          title: '중간고사',
          date: '2025-10-21',
          description: '시험 범위: 1-7주차'
        },
        {
          id: '3',
          type: 'assignment',
          title: '중간 프로젝트 제출',
          date: '2025-11-10',
          description: '팀 프로젝트 보고서'
        },
        {
          id: '4',
          type: 'exam',
          title: '기말고사',
          date: '2025-12-16',
          description: '시험 범위: 전체'
        }
      ];

      const course: Course = {
        id: Date.now().toString(),
        name: syllabusText.split('\n')[0] || '과목명',
        gradeComponents,
        scheduleEvents
      };

      onSyllabusAnalyzed(course);
      setSyllabusText('');
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
        <div className="text-center mb-4">
          <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p className="text-gray-600 mb-2">강의 계획서 내용을 붙여넣으세요</p>
          <p className="text-sm text-gray-500">
            과목명, 평가 방법, 반영 비율, 강의 일정 등이 포함된 내용
          </p>
        </div>

        <textarea
          value={syllabusText}
          onChange={(e) => setSyllabusText(e.target.value)}
          placeholder="예시:
데이터구조

평가 방법:
- 출석: 10%
- 과제: 20%
- 쪽지시험: 10%
- 중간고사: 30%
- 기말고사: 30%

주요 일정:
- 10/03: 개천절 휴강
- 10/21: 중간고사
- 11/10: 중간 프로젝트 제출
- 12/16: 기말고사"
          className="w-full h-64 p-3 border border-gray-300 rounded-lg resize-none"
        />
      </div>

      <button
        onClick={handleAnalyze}
        disabled={!syllabusText.trim() || isAnalyzing}
        className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 ${
          syllabusText.trim() && !isAnalyzing
            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            AI가 분석 중...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            AI로 분석하기
          </>
        )}
      </button>
    </div>
  );
}
