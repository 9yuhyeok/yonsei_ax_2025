import { useState } from 'react';
import { Plus, Link as LinkIcon, Loader2, Trash2, Check, Clock, AlertCircle, BookOpen, Calendar as CalendarIcon, StickyNote, Sparkles } from 'lucide-react';
import type { Assignment } from '../App';

interface AssignmentScheduleProps {
  assignments: Assignment[];
  onAssignmentsUpdated: (assignments: Assignment[]) => void;
  onApplyAI: (assignmentId: string) => void;
}

export function AssignmentSchedule({ 
  assignments, 
  onAssignmentsUpdated,
  onApplyAI
}: AssignmentScheduleProps) {
  const [viewMode, setViewMode] = useState<'today' | 'all'>('today');
  const [scheduleUrl, setScheduleUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualAssignment, setManualAssignment] = useState({
    title: '',
    dueDate: '',
    estimatedTime: 60,
    priority: 'medium' as 'high' | 'medium' | 'low',
    type: 'school' as 'school' | 'personal',
    memo: '',
    repeat: 'none' as 'none' | 'daily' | 'weekly' | 'monthly',
    reminder: 'none' as 'none' | '10min' | '30min' | '1hour' | '1day'
  });

  const handleUrlAnalyze = () => {
    if (!scheduleUrl.trim()) return;
    
    setIsAnalyzing(true);
    
    // AI가 URL에서 과제를 분석하고 자동으로 시간 예측
    setTimeout(() => {
      const mockAssignments: Assignment[] = [
        {
          id: Date.now().toString() + '1',
          title: '데이터구조 과제 #3 - 이진트리 구현',
          dueDate: '2025-12-03',
          estimatedTime: 120, // AI가 자동 예측
          priority: 'high',
          completed: false,
          type: 'school',
          progress: 0,
          addedToAI: true, // 자동으로 AI에 추가
          memo: '',
          repeat: 'none',
          reminder: 'none'
        },
        {
          id: Date.now().toString() + '2',
          title: '알고리즘 중간고사 준비',
          dueDate: '2025-12-05',
          estimatedTime: 180, // AI가 자동 예측
          priority: 'high',
          completed: false,
          type: 'school',
          progress: 0,
          addedToAI: true, // 자동으로 AI에 추가
          memo: '',
          repeat: 'none',
          reminder: 'none'
        },
        {
          id: Date.now().toString() + '3',
          title: '운영체제 프로젝트 1단계',
          dueDate: '2025-12-07',
          estimatedTime: 90, // AI가 자동 예측
          priority: 'medium',
          completed: false,
          type: 'school',
          progress: 0,
          addedToAI: true, // 자동으로 AI에 추가
          memo: '',
          repeat: 'none',
          reminder: 'none'
        }
      ];

      onAssignmentsUpdated([...assignments, ...mockAssignments]);
      setScheduleUrl('');
      setIsAnalyzing(false);
    }, 1500);
  };

  const handleManualAddWithAI = () => {
    if (!manualAssignment.title.trim() || !manualAssignment.dueDate) return;

    const newAssignment: Assignment = {
      id: Date.now().toString(),
      title: manualAssignment.title,
      dueDate: manualAssignment.dueDate,
      estimatedTime: manualAssignment.estimatedTime, // 사용자가 입력한 시간 사용
      priority: manualAssignment.priority,
      completed: false,
      type: manualAssignment.type,
      progress: 0,
      addedToAI: true, // 자동으로 AI에 추가
      memo: manualAssignment.memo,
      repeat: manualAssignment.repeat,
      reminder: manualAssignment.reminder
    };

    onAssignmentsUpdated([...assignments, newAssignment]);
    setManualAssignment({
      title: '',
      dueDate: '',
      estimatedTime: 60,
      priority: 'medium',
      type: 'school',
      memo: '',
      repeat: 'none',
      reminder: 'none'
    });
    setShowManualForm(false);
  };

  const handleDelete = (id: string) => {
    onAssignmentsUpdated(assignments.filter(a => a.id !== id));
  };

  const handleToggleComplete = (id: string) => {
    onAssignmentsUpdated(
      assignments.map(a =>
        a.id === id ? { ...a, completed: !a.completed, progress: a.completed ? 0 : 100 } : a
      )
    );
  };

  const handleApplyAIToExisting = (id: string) => {
    const assignment = assignments.find(a => a.id === id);
    if (!assignment) return;

    // AI가 과제 제목을 분석해서 예상 시간 자동 계산
    const estimateTime = (title: string, type: string): number => {
      const lowerTitle = title.toLowerCase();
      
      if (lowerTitle.includes('프로젝트') || lowerTitle.includes('project')) return 180;
      if (lowerTitle.includes('시험') || lowerTitle.includes('exam') || lowerTitle.includes('준비')) return 120;
      if (lowerTitle.includes('보고서') || lowerTitle.includes('report')) return 120;
      if (lowerTitle.includes('발표') || lowerTitle.includes('presentation')) return 90;
      if (lowerTitle.includes('과제') || lowerTitle.includes('숙제') || lowerTitle.includes('assignment')) return 90;
      if (lowerTitle.includes('읽기') || lowerTitle.includes('독서')) return 60;
      if (lowerTitle.includes('문제풀이') || lowerTitle.includes('연습')) return 60;
      
      return type === 'school' ? 90 : 60;
    };

    onAssignmentsUpdated(
      assignments.map(a =>
        a.id === id 
          ? { ...a, estimatedTime: estimateTime(a.title, a.type), addedToAI: true } 
          : a
      )
    );
    onApplyAI(id);
  };

  // 오늘 날짜
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 오늘의 할일 필터링
  const todayAssignments = assignments.filter(a => {
    if (a.completed) return false;
    const dueDate = new Date(a.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime();
  });

  // 날짜별로 그룹화
  const groupByDate = (items: Assignment[]) => {
    const groups: { [key: string]: Assignment[] } = {};
    items.forEach(item => {
      const date = item.dueDate;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(item);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  };

  const allAssignmentsByDate = groupByDate(assignments);

  const filteredAssignments = viewMode === 'today' 
    ? todayAssignments
    : assignments;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return '높음';
      case 'medium': return '보통';
      case 'low': return '낮음';
      default: return priority;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = dayNames[date.getDay()];
    return `${month}월 ${day}일 (${dayName})`;
  };

  const renderAssignmentCard = (assignment: Assignment) => {
    return (
      <div
        key={assignment.id}
        className={`border rounded-lg p-4 transition-all ${
          assignment.addedToAI
            ? 'bg-indigo-50 border-indigo-300'
            : assignment.completed
            ? 'bg-gray-50 border-gray-200 opacity-60'
            : 'bg-white border-gray-200'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            {/* 제목 및 액션 버튼 */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <h4 className={`${assignment.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                  {assignment.title}
                </h4>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs ${
                  assignment.type === 'school' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-pink-100 text-pink-700'
                }`}>
                  {assignment.type === 'school' ? '학교' : '개인'}
                </span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => handleToggleComplete(assignment.id)}
                  className={`p-1 rounded hover:bg-gray-100 ${
                    assignment.completed ? 'text-green-600' : 'text-gray-400'
                  }`}
                  title={assignment.completed ? '완료 취소' : '완료'}
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(assignment.id)}
                  className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 정보 */}
            <div className="space-y-2 mb-2">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{formatDate(assignment.dueDate)}</span>
                </div>
                {assignment.addedToAI && assignment.estimatedTime > 0 && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{assignment.estimatedTime}분 (AI 예측)</span>
                  </div>
                )}
                <div className={`flex items-center gap-1 ${getPriorityColor(assignment.priority)}`}>
                  <AlertCircle className="w-4 h-4" />
                  <span>{getPriorityLabel(assignment.priority)}</span>
                </div>
                {assignment.addedToAI && (
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs">
                    스케줄에 반영됨
                  </span>
                )}
              </div>
              {assignment.memo && (
                <div className="flex items-start gap-1 text-sm text-gray-600">
                  <StickyNote className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{assignment.memo}</span>
                </div>
              )}
            </div>

            {/* 진도율 */}
            {assignment.progress !== undefined && assignment.progress > 0 && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>진도율</span>
                  <span>{assignment.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all"
                    style={{ width: `${assignment.progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* AI 적용 버튼 - addedToAI가 false인 경우만 표시 */}
            {!assignment.addedToAI && !assignment.completed && (
              <button
                onClick={() => handleApplyAIToExisting(assignment.id)}
                className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                AI 적용하기
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 p-4">
      {/* 뷰 모드 탭 */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setViewMode('today')}
          className={`flex-1 py-2 rounded-md text-sm transition-all ${
            viewMode === 'today'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600'
          }`}
        >
          오늘의 할일
        </button>
        <button
          onClick={() => setViewMode('all')}
          className={`flex-1 py-2 rounded-md text-sm transition-all ${
            viewMode === 'all'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600'
          }`}
        >
          전체 할일
        </button>
      </div>

      {/* URL 입력 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-200 rounded-lg p-4">
        <h3 className="text-indigo-900 mb-2 flex items-center gap-2">
          <LinkIcon className="w-5 h-5" />
          과제 URL로 추가 (AI 자동 분석)
        </h3>
        <p className="text-sm text-indigo-700 mb-3">
          학교 과제 스케줄 URL을 입력하면 AI가 자동으로 과제를 분석하고 예상 시간을 계산합니다.
        </p>
        <div className="flex gap-2">
          <input
            type="url"
            value={scheduleUrl}
            onChange={(e) => setScheduleUrl(e.target.value)}
            placeholder="https://..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleUrlAnalyze}
            disabled={isAnalyzing || !scheduleUrl.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                AI 분석 중...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                AI 분석
              </>
            )}
          </button>
        </div>
      </div>

      {/* 수동 추가 */}
      <div className="border border-gray-200 rounded-lg p-4">
        <button
          onClick={() => setShowManualForm(!showManualForm)}
          className="w-full flex items-center justify-between text-left"
        >
          <h3 className="text-gray-900 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            직접 추가 (AI 자동 시간 예측)
          </h3>
          <span className="text-gray-400">{showManualForm ? '−' : '+'}</span>
        </button>

        {showManualForm && (
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">카테고리</label>
              <select
                value={manualAssignment.type}
                onChange={(e) => setManualAssignment({ ...manualAssignment, type: e.target.value as 'school' | 'personal' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="school">학교 과제</option>
                <option value="personal">개인 일정</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">할 일 제목</label>
              <input
                type="text"
                value={manualAssignment.title}
                onChange={(e) => setManualAssignment({ ...manualAssignment, title: e.target.value })}
                placeholder="제목을 입력하세요 (AI가 내용을 분석해 시간을 예측합니다)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 예: "데이터구조 프로젝트", "알고리즘 시험 준비" 등
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">소요 시간 (분)</label>
                <input
                  type="number"
                  value={manualAssignment.estimatedTime}
                  onChange={(e) => setManualAssignment({ ...manualAssignment, estimatedTime: parseInt(e.target.value) || 60 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">기한</label>
                <input
                  type="date"
                  value={manualAssignment.dueDate}
                  onChange={(e) => setManualAssignment({ ...manualAssignment, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">간단한 메모 (선택)</label>
              <input
                type="text"
                value={manualAssignment.memo}
                onChange={(e) => setManualAssignment({ ...manualAssignment, memo: e.target.value })}
                placeholder="예: 도서관 3층, 카페 등"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">중요도</label>
                <select
                  value={manualAssignment.priority}
                  onChange={(e) => setManualAssignment({ ...manualAssignment, priority: e.target.value as 'high' | 'medium' | 'low' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="high">높음</option>
                  <option value="medium">보통</option>
                  <option value="low">낮음</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">반복</label>
                <select
                  value={manualAssignment.repeat}
                  onChange={(e) => setManualAssignment({ ...manualAssignment, repeat: e.target.value as 'none' | 'daily' | 'weekly' | 'monthly' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="none">없음</option>
                  <option value="daily">매일</option>
                  <option value="weekly">매주</option>
                  <option value="monthly">매월</option>
                </select>
              </div>
            </div>
            
            <button
              onClick={handleManualAddWithAI}
              disabled={!manualAssignment.title.trim() || !manualAssignment.dueDate}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              AI 적용하여 추가
            </button>
          </div>
        )}
      </div>

      {/* 할일 목록 */}
      <div className="space-y-3">
        {viewMode === 'today' ? (
          <>
            {filteredAssignments.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                오늘 할 일이 없습니다
              </div>
            ) : (
              filteredAssignments.map(renderAssignmentCard)
            )}
          </>
        ) : (
          <>
            {allAssignmentsByDate.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                할 일이 없습니다
              </div>
            ) : (
              allAssignmentsByDate.map(([date, items]) => (
                <div key={date} className="space-y-2">
                  <h3 className="text-sm text-gray-500 px-2">
                    {formatDate(date)}
                  </h3>
                  <div className="space-y-2">
                    {items.map(renderAssignmentCard)}
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
