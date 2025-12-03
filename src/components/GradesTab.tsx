import { useState } from 'react';
import { FileText, Calculator, Calendar as CalendarIcon } from 'lucide-react';
import { SyllabusUpload } from './SyllabusUpload';
import { GradeTracker } from './GradeTracker';
import { GradeCalculator } from './GradeCalculator';
import { CourseSchedule } from './CourseSchedule';

export interface GradeComponent {
  id: string;
  name: string;
  weight: number;
  score?: number;
  maxScore: number;
}

export interface Course {
  id: string;
  name: string;
  gradeComponents: GradeComponent[];
  scheduleEvents: ScheduleEvent[];
}

export interface ScheduleEvent {
  id: string;
  type: 'exam' | 'break' | 'assignment' | 'other';
  title: string;
  date: string;
  description?: string;
}

export function GradesTab() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const handleSyllabusAnalyzed = (courseData: Course) => {
    setCourses(prev => [...prev, courseData]);
    setSelectedCourseId(courseData.id);
  };

  const handleScoreUpdate = (courseId: string, componentId: string, score: number) => {
    setCourses(prev =>
      prev.map(course =>
        course.id === courseId
          ? {
              ...course,
              gradeComponents: course.gradeComponents.map(comp =>
                comp.id === componentId ? { ...comp, score } : comp
              )
            }
          : course
      )
    );
  };

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 헤더 */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-200">
        <h1 className="text-gray-900 mb-3">성적 관리</h1>
        
        {courses.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {courses.map(course => (
              <button
                key={course.id}
                onClick={() => setSelectedCourseId(course.id)}
                className={`px-3 py-1.5 text-sm rounded-lg whitespace-nowrap ${
                  selectedCourseId === course.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {course.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 콘텐츠 영역 */}
      <div className="flex-1 overflow-y-auto p-4">
        {courses.length === 0 ? (
          <div>
            <div className="mb-6">
              <h2 className="mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                강의 계획서 업로드
              </h2>
              <SyllabusUpload onSyllabusAnalyzed={handleSyllabusAnalyzed} />
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-blue-900 mb-2">💡 팁</h3>
              <ul className="text-blue-800 space-y-1 text-sm">
                <li>• 강의 계획서를 업로드하면 AI가 평가 방법과 비율을 분석합니다</li>
                <li>• 성적이 발표되면 표에 점수를 입력하세요</li>
                <li>• 목표 점수를 설정하면 필요한 점수를 계산해드립니다</li>
                <li>• 강의 일정(시험, 휴강 등)을 한눈에 확인할 수 있습니다</li>
              </ul>
            </div>
          </div>
        ) : selectedCourse ? (
          <div className="space-y-6">
            {/* 성적 추적 */}
            <div>
              <h2 className="mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                성적 현황
              </h2>
              <GradeTracker
                course={selectedCourse}
                onScoreUpdate={handleScoreUpdate}
              />
            </div>

            {/* 목표 점수 계산기 */}
            <div>
              <h2 className="mb-3 flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                목표 점수 계산
              </h2>
              <GradeCalculator course={selectedCourse} />
            </div>

            {/* 강의 일정 */}
            <div>
              <h2 className="mb-3 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                강의 일정
              </h2>
              <CourseSchedule events={selectedCourse.scheduleEvents} />
            </div>

            {/* 새 강의 추가 버튼 */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={() => setSelectedCourseId(null)}
                className="w-full px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50"
              >
                + 다른 과목 추가하기
              </button>
            </div>
          </div>
        ) : (
          <SyllabusUpload onSyllabusAnalyzed={handleSyllabusAnalyzed} />
        )}
      </div>
    </div>
  );
}
