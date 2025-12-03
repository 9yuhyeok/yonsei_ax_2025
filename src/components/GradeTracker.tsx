import { useState } from 'react';
import { Edit2, Check, X } from 'lucide-react';
import type { Course } from './GradesTab';

interface GradeTrackerProps {
  course: Course;
  onScoreUpdate: (courseId: string, componentId: string, score: number) => void;
}

export function GradeTracker({ course, onScoreUpdate }: GradeTrackerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempScore, setTempScore] = useState<string>('');

  const handleEdit = (componentId: string, currentScore?: number) => {
    setEditingId(componentId);
    setTempScore(currentScore?.toString() || '');
  };

  const handleSave = (componentId: string) => {
    const score = parseFloat(tempScore);
    if (!isNaN(score) && score >= 0 && score <= 100) {
      onScoreUpdate(course.id, componentId, score);
      setEditingId(null);
      setTempScore('');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setTempScore('');
  };

  // 현재 총점 계산
  const calculateCurrentScore = () => {
    let totalWeightedScore = 0;
    let totalEnteredWeight = 0;

    course.gradeComponents.forEach(comp => {
      if (comp.score !== undefined) {
        totalWeightedScore += (comp.score / comp.maxScore) * comp.weight;
        totalEnteredWeight += comp.weight;
      }
    });

    return {
      currentScore: totalWeightedScore,
      enteredWeight: totalEnteredWeight,
      totalWeight: course.gradeComponents.reduce((sum, comp) => sum + comp.weight, 0)
    };
  };

  const { currentScore, enteredWeight, totalWeight } = calculateCurrentScore();

  // Letter Grade 계산
  const getLetterGrade = (score: number) => {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'B+';
    if (score >= 80) return 'B';
    if (score >= 75) return 'C+';
    if (score >= 70) return 'C';
    if (score >= 65) return 'D+';
    if (score >= 60) return 'D';
    return 'F';
  };

  const projectedScore = totalWeight > 0 ? (currentScore / enteredWeight) * totalWeight : 0;

  return (
    <div className="space-y-4">
      {/* 현재 성적 요약 */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-indigo-100 text-sm mb-1">현재 점수</p>
            <p className="text-3xl">{currentScore.toFixed(1)}점</p>
            <p className="text-indigo-100 text-sm mt-1">
              ({enteredWeight}/{totalWeight} 반영)
            </p>
          </div>
          <div>
            <p className="text-indigo-100 text-sm mb-1">예상 학점</p>
            <p className="text-3xl">{getLetterGrade(projectedScore)}</p>
            <p className="text-indigo-100 text-sm mt-1">
              (예상: {projectedScore.toFixed(1)}점)
            </p>
          </div>
        </div>
      </div>

      {/* 성적 입력 테이블 */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm text-gray-700">항목</th>
              <th className="px-4 py-3 text-center text-sm text-gray-700">반영비율</th>
              <th className="px-4 py-3 text-center text-sm text-gray-700">점수</th>
              <th className="px-4 py-3 text-center text-sm text-gray-700">취득점수</th>
              <th className="px-4 py-3 text-center text-sm text-gray-700"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {course.gradeComponents.map((comp) => {
              const isEditing = editingId === comp.id;
              const weightedScore = comp.score !== undefined 
                ? (comp.score / comp.maxScore) * comp.weight 
                : 0;

              return (
                <tr key={comp.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{comp.name}</td>
                  <td className="px-4 py-3 text-center">{comp.weight}%</td>
                  <td className="px-4 py-3 text-center">
                    {isEditing ? (
                      <input
                        type="number"
                        value={tempScore}
                        onChange={(e) => setTempScore(e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                        min="0"
                        max="100"
                        step="0.1"
                        autoFocus
                      />
                    ) : (
                      <span className={comp.score !== undefined ? 'text-gray-900' : 'text-gray-400'}>
                        {comp.score !== undefined ? `${comp.score}/${comp.maxScore}` : '-'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={comp.score !== undefined ? 'text-indigo-600' : 'text-gray-400'}>
                      {comp.score !== undefined ? weightedScore.toFixed(1) : '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {isEditing ? (
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleSave(comp.id)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEdit(comp.id, comp.score)}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td className="px-4 py-3">총점</td>
              <td className="px-4 py-3 text-center">{totalWeight}%</td>
              <td className="px-4 py-3 text-center">-</td>
              <td className="px-4 py-3 text-center text-indigo-600">
                {currentScore.toFixed(1)}
              </td>
              <td className="px-4 py-3"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* 진행률 바 */}
      <div className="bg-gray-100 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-700">평가 진행률</span>
          <span className="text-sm text-gray-900">
            {((enteredWeight / totalWeight) * 100).toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all"
            style={{ width: `${(enteredWeight / totalWeight) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
