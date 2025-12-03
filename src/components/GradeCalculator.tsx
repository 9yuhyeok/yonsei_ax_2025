import { useState } from 'react';
import { Target, TrendingUp, AlertCircle } from 'lucide-react';
import type { Course } from './GradesTab';

interface GradeCalculatorProps {
  course: Course;
}

export function GradeCalculator({ course }: GradeCalculatorProps) {
  const [targetScore, setTargetScore] = useState<string>('95');

  // 현재까지 입력된 점수 계산
  const getCurrentScore = () => {
    let totalWeightedScore = 0;
    let remainingWeight = 0;

    course.gradeComponents.forEach(comp => {
      if (comp.score !== undefined) {
        totalWeightedScore += (comp.score / comp.maxScore) * comp.weight;
      } else {
        remainingWeight += comp.weight;
      }
    });

    return { currentScore: totalWeightedScore, remainingWeight };
  };

  const { currentScore, remainingWeight } = getCurrentScore();
  const target = parseFloat(targetScore) || 0;

  // 남은 과목에서 필요한 평균 점수 계산
  const calculateRequiredScore = () => {
    if (remainingWeight === 0) {
      return null; // 모든 점수가 입력됨
    }

    const requiredWeightedScore = target - currentScore;
    const requiredAveragePercentage = (requiredWeightedScore / remainingWeight) * 100;

    return {
      requiredWeightedScore,
      requiredAveragePercentage,
      isPossible: requiredAveragePercentage <= 100 && requiredAveragePercentage >= 0
    };
  };

  const result = calculateRequiredScore();

  // 남은 항목별 필요 점수 계산
  const getRemainingComponents = () => {
    return course.gradeComponents
      .filter(comp => comp.score === undefined)
      .map(comp => {
        const requiredScore = result 
          ? (result.requiredAveragePercentage / 100) * comp.maxScore
          : 0;
        return {
          ...comp,
          requiredScore
        };
      });
  };

  const remainingComponents = getRemainingComponents();

  // Letter Grade 범위
  const gradeRanges = [
    { grade: 'A+', min: 95, color: 'bg-green-100 text-green-800 border-green-300' },
    { grade: 'A', min: 90, color: 'bg-green-100 text-green-700 border-green-200' },
    { grade: 'B+', min: 85, color: 'bg-blue-100 text-blue-800 border-blue-300' },
    { grade: 'B', min: 80, color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { grade: 'C+', min: 75, color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    { grade: 'C', min: 70, color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  ];

  return (
    <div className="space-y-4">
      {/* 목표 점수 입력 */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <label className="block text-sm text-gray-700 mb-2">
          <Target className="w-4 h-4 inline mr-1" />
          목표 점수 설정
        </label>
        <input
          type="number"
          value={targetScore}
          onChange={(e) => setTargetScore(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          min="0"
          max="100"
          step="0.1"
        />
      </div>

      {/* 현재 상황 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-blue-900 mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          현재 상황
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-blue-700">현재 취득 점수</p>
            <p className="text-blue-900 text-xl">{currentScore.toFixed(1)}점</p>
          </div>
          <div>
            <p className="text-blue-700">남은 반영 비율</p>
            <p className="text-blue-900 text-xl">{remainingWeight}%</p>
          </div>
        </div>
      </div>

      {/* 계산 결과 */}
      {result === null ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            모든 점수가 입력되었습니다. 최종 점수: {currentScore.toFixed(1)}점
          </p>
        </div>
      ) : result.isPossible ? (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg p-6">
            <h3 className="mb-3 flex items-center gap-2">
              <Target className="w-5 h-5" />
              목표 달성을 위한 필요 점수
            </h3>
            <div className="text-center">
              <p className="text-sm text-purple-100 mb-2">
                남은 평가 항목에서 평균
              </p>
              <p className="text-4xl mb-2">
                {result.requiredAveragePercentage.toFixed(1)}점
              </p>
              <p className="text-sm text-purple-100">
                이상을 받아야 합니다
              </p>
            </div>
          </div>

          {/* 항목별 필요 점수 */}
          {remainingComponents.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2">
                <p className="text-sm text-gray-700">남은 평가 항목별 필요 점수</p>
              </div>
              <div className="divide-y divide-gray-200">
                {remainingComponents.map(comp => (
                  <div key={comp.id} className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-gray-900">{comp.name}</p>
                      <p className="text-sm text-gray-500">반영비율: {comp.weight}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-indigo-600">
                        {comp.requiredScore.toFixed(1)}점
                      </p>
                      <p className="text-sm text-gray-500">
                        / {comp.maxScore}점
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {result.requiredAveragePercentage > 100
              ? '목표 점수 달성이 불가능합니다. 더 낮은 목표를 설정해주세요.'
              : '이미 목표 점수를 초과했습니다!'}
          </p>
        </div>
      )}

      {/* Letter Grade 가이드 */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-gray-900 mb-3 text-sm">학점 등급 가이드</h3>
        <div className="space-y-2">
          {gradeRanges.map(range => {
            const scoreNeeded = range.min - currentScore;
            const achievable = remainingWeight >= scoreNeeded;
            
            return (
              <div
                key={range.grade}
                className={`flex items-center justify-between px-3 py-2 rounded border ${range.color}`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold">{range.grade}</span>
                  <span className="text-sm">{range.min}점 이상</span>
                </div>
                <div className="text-sm">
                  {currentScore >= range.min ? (
                    <span className="text-green-600">✓ 달성</span>
                  ) : achievable ? (
                    <span>
                      +{scoreNeeded.toFixed(1)}점 필요
                    </span>
                  ) : (
                    <span className="text-gray-400">달성 불가</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
