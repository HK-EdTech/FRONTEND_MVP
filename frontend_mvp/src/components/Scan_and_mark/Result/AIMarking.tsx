'use client';

import { useEffect, useMemo, useState } from 'react';
import { Brain, CheckCircle2, Loader2, Sparkles, Target } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/components/ui/utils';

const THINKING_STEPS = [
  "Reading student's workings...",
  'Forming question list...',
  'Classifying question concept and difficulty...',
  'Performing AI marking...',
  'Finalizing score and performance analyzer...',
];

const STRENGTH_TAGS = ['Algebra accuracy', 'Clean method setup', 'Stable calculations'];
const WEAKNESS_TAGS = ['Units consistency', 'Multi-step checking', 'Final answer validation'];

export interface AIMarkingStudent {
  studentId?: string;
  name: string;
  avatarUrl?: string | null;
  submissionDate?: string | null;
}

interface AIMarkingProps {
  student?: AIMarkingStudent | null;
  mode?: 'single' | 'all';
  totalStudents?: number;
}

const initialsFromName = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'AI';

const computeDemoMetrics = (studentName: string) => {
  const seed = studentName.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const score = 76 + (seed % 23);
  const confidence = 84 + (seed % 14);
  const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : 'D';
  return { score, confidence, grade };
};

export function AIMarking({ student, mode = 'single', totalStudents = 0 }: AIMarkingProps) {
  const [pageProgress, setPageProgress] = useState(0);
  const [visibleStepCount, setVisibleStepCount] = useState(1);
  const [isComplete, setIsComplete] = useState(false);

  const targetName = mode === 'all' ? 'All students in this class' : student?.name || 'Selected student';
  const metrics = useMemo(() => computeDemoMetrics(targetName), [targetName]);

  useEffect(() => {
    setPageProgress(0);
    setVisibleStepCount(1);
    setIsComplete(false);

    const pageInterval = window.setInterval(() => {
      setPageProgress((prev) => {
        const next = prev + 5;
        if (next >= 100) return 0;
        return next;
      });
    }, 100);

    const stepInterval = window.setInterval(() => {
      setVisibleStepCount((prev) => {
        if (prev >= THINKING_STEPS.length) return prev;
        return prev + 1;
      });
    }, 1200);

    const completeTimer = window.setTimeout(() => {
      setIsComplete(true);
      setPageProgress(100);
      window.clearInterval(pageInterval);
      window.clearInterval(stepInterval);
    }, THINKING_STEPS.length * 1300 + 1200);

    return () => {
      window.clearInterval(pageInterval);
      window.clearInterval(stepInterval);
      window.clearTimeout(completeTimer);
    };
  }, [targetName]);

  const overallProgress = useMemo(() => {
    if (isComplete) return 100;
    const stepProgress = (visibleStepCount / THINKING_STEPS.length) * 75;
    const perPageProgress = (pageProgress / 100) * 25;
    return Math.min(99, Math.round(stepProgress + perPageProgress));
  }, [isComplete, pageProgress, visibleStepCount]);

  const ringDashOffset = useMemo(() => {
    const radius = 44;
    const circumference = 2 * Math.PI * radius;
    return circumference - (overallProgress / 100) * circumference;
  }, [overallProgress]);

  return (
    <div className="flex h-full w-full gap-3">
      <div className="flex h-full flex-1 items-center justify-center rounded-xl bg-white shadow-lg">
        <img src="/doc/image.png" alt="Homework page" className="m-auto h-full object-contain p-2" />
      </div>

      <div className="min-h-0 w-[30%]">
        <div className="flex h-full flex-col gap-3 rounded-2xl border border-white/30 bg-white/35 p-3">
          <div className="flex items-center gap-3 rounded-xl border border-white/30 bg-white p-3 shadow-lg">
            <Avatar className="h-11 w-11 border border-white/50">
              <AvatarImage src={student?.avatarUrl || undefined} />
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-cyan-400 text-white">
                {initialsFromName(targetName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">{targetName}</p>
              <p className="text-xs text-gray-600">
                {mode === 'all'
                  ? `Batch mode • ${totalStudents || 0} submissions`
                  : `Submission ${student?.submissionDate ? new Date(student.submissionDate).toLocaleDateString('en-GB') : 'in progress'}`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-[auto_1fr] items-center gap-3 rounded-xl border border-white/30 bg-white p-3 shadow-lg">
            <div className="relative h-24 w-24">
              <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90">
                <circle cx="50" cy="50" r="44" stroke="rgba(148,163,184,0.25)" strokeWidth="8" fill="none" />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  stroke="url(#ai-marking-ring)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 44}
                  strokeDashoffset={ringDashOffset}
                  className="transition-all duration-500"
                />
                <defs>
                  <linearGradient id="ai-marking-ring" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#14b8a6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-gray-800">
                {overallProgress}%
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-900">Overall AI Marking Progress</p>
              <p className="text-xs text-gray-600">
                {isComplete ? 'Marking complete. Generating final insights.' : 'Running multi-step analysis...'}
              </p>
            </div>
          </div>

          <div className="min-h-0 rounded-xl border border-white/30 bg-white p-3 shadow-lg">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Brain className="h-4 w-4 text-purple-600" />
              AI Thinking
            </div>
            <div className="space-y-2">
              {THINKING_STEPS.map((step, index) => {
                const isActive = index === visibleStepCount - 1 && !isComplete;
                const isDone = isComplete || index < visibleStepCount - 1;
                return (
                  <div
                    key={step}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-2 py-1 text-xs transition-all',
                      isActive ? 'bg-cyan-100/80 text-cyan-900' : 'text-gray-700'
                    )}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    ) : isActive ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-700" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5 text-gray-400" />
                    )}
                    <span>{step}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            className={cn(
              'rounded-xl border border-white/35 bg-white p-3 shadow-lg transition-all duration-500',
              isComplete ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
            )}
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">Final Result</p>
              <Badge className="border-emerald-200 bg-emerald-100 text-emerald-700">Ready</Badge>
            </div>
            <div className="mb-2 flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{metrics.score}/100</p>
                <p className="text-xs text-gray-600">Grade {metrics.grade}</p>
              </div>
              <Badge className="border-cyan-200 bg-cyan-100 text-cyan-700">
                {metrics.confidence}% confidence
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-emerald-700" />
                {STRENGTH_TAGS.slice(0, 2).map((tag) => (
                  <Badge key={tag} className="border-emerald-200 bg-emerald-50 text-emerald-700">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <Brain className="h-3.5 w-3.5 text-amber-700" />
                {WEAKNESS_TAGS.slice(0, 2).map((tag) => (
                  <Badge key={tag} className="border-amber-200 bg-amber-50 text-amber-700">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
