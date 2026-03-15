'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import { ClassHomeworkSubmissionResponse } from '@/lib/api';
import { StatusMessage } from '@/components/common/StatusMessage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchHomeworkSubmissions } from '@/store/slices/homeworkSubmissionsSlice';

type SubmissionStatusFilter = 'all' | 'submitted' | 'not_submitted';
type MarkedStatusFilter = 'all' | 'marked' | 'not_marked';
type SortKey = 'name' | 'score' | 'submission_date' | 'isMarked';

interface HomeworkSubmissionsTableProps {
  classId: string;
  homeworkId: string;
}

const formatDate = (value: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const normalizeScore = (score: number | null) => (score === null || Number.isNaN(score) ? null : score);

const compareNullableNumber = (a: number | null, b: number | null) => {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return a - b;
};

const compareNullableDate = (a: string | null, b: string | null) => {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return new Date(a).getTime() - new Date(b).getTime();
};

const columns = [
  {
    header: 'Student Name',
    width: '40%',
    sortableKey: 'name' as SortKey,
    cell: (row: ClassHomeworkSubmissionResponse) => row.full_name,
  },
  {
    header: 'Score',
    width: '15%',
    sortableKey: 'score' as SortKey,
    cell: (row: ClassHomeworkSubmissionResponse) => {
      const score = normalizeScore(row.score);
      return score === null ? '-' : score;
    },
  },
  {
    header: 'Submission Status',
    width: '20%',
    sortableKey: null,
    cell: (row: ClassHomeworkSubmissionResponse) => (
      row.has_submission ? (
        <Badge className="border border-emerald-200 bg-emerald-100 text-emerald-700">
          Submitted
        </Badge>
      ) : (
        <Badge className="border border-gray-200 bg-gray-100 text-gray-600">
          Not submitted
        </Badge>
      )
    ),
  },
  {
    header: 'Submission Date',
    width: '25%',
    sortableKey: 'submission_date' as SortKey,
    cell: (row: ClassHomeworkSubmissionResponse) => formatDate(row.submission_datetime),
  },
  {
    header: 'Marked',
    width: '20%',
    sortableKey: 'isMarked' as SortKey,
    cell: (row: ClassHomeworkSubmissionResponse) => (
      row.is_marked ? (
        <Badge className="border border-emerald-200 bg-emerald-100 text-emerald-700">
          Marked
        </Badge>
      ) : (
        <Badge className="border border-gray-200 bg-gray-100 text-gray-600">
          Not marked
        </Badge>
      )
    ),
  },
  {
    header: 'Actions',
    width: '20%',
    sortableKey: null,
    cell: () => (
      <Button
        size="sm"
        className="bg-gradient-to-r from-purple-500 to-teal-500 text-white hover:shadow-lg"
      >
        AI Analyze
      </Button>
    ),
  },
];

export function HomeworkSubmissionsTable({ classId, homeworkId }: HomeworkSubmissionsTableProps) {
  const dispatch = useAppDispatch();
  const key = `${classId}:${homeworkId}`;
  const rows = useAppSelector((state) => state.homeworkSubmissions.rowsByKey[key] || []);
  const status = useAppSelector((state) => state.homeworkSubmissions.statusByKey[key] || 'idle');
  const errorMessage = useAppSelector((state) => state.homeworkSubmissions.errorByKey[key] || '');
  const isLoading = status === 'loading' || status === 'idle';
  const [searchQuery, setSearchQuery] = useState('');
  const [submissionFilter, setSubmissionFilter] = useState<SubmissionStatusFilter>('all');
  const [markedFilter, setMarkedFilter] = useState<MarkedStatusFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchHomeworkSubmissions({ classId, homeworkId }));
    }
  }, [classId, dispatch, homeworkId, status]);

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const submissionFilterValue = submissionFilter;
    const markedFilterValue = markedFilter;
    const direction = sortDirection === 'asc' ? 1 : -1;

    const filtered = rows.filter((row) => {
      const matchesQuery = !query || row.full_name.toLowerCase().includes(query);
      if (!matchesQuery) return false;

      if (submissionFilterValue === 'submitted' && !row.has_submission) return false;
      if (submissionFilterValue === 'not_submitted' && row.has_submission) return false;

      const isMarked = Boolean(row.is_marked);
      if (markedFilterValue === 'marked' && !isMarked) return false;
      if (markedFilterValue === 'not_marked' && isMarked) return false;

      return true;
    });

    filtered.sort((a, b) => {
      if (sortKey === 'name') {
        return a.full_name.localeCompare(b.full_name) * direction;
      }

      if (sortKey === 'score') {
        return compareNullableNumber(normalizeScore(a.score), normalizeScore(b.score)) * direction;
      }

      return compareNullableDate(a.submission_datetime, b.submission_datetime) * direction;
    });

    return filtered;
  }, [rows, searchQuery, submissionFilter, markedFilter, sortDirection, sortKey]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search student name..."
            className="h-9 sm:max-w-xs"
          />
          <div className="w-full sm:w-44">
            <Select value={submissionFilter} onValueChange={(value) => setSubmissionFilter(value as SubmissionStatusFilter)}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Submission" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Submissions</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="not_submitted">Not submitted</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-40">
            <Select value={markedFilter} onValueChange={(value) => setMarkedFilter(value as MarkedStatusFilter)}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Marked" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Marked</SelectItem>
                <SelectItem value="marked">Marked</SelectItem>
                <SelectItem value="not_marked">Not marked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="rounded-xl border border-white/20 bg-white shadow-lg p-2">
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow>
                {columns.map((col, i) => (
                  <TableHead key={i} style={{ width: col.width }}>
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((col, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-3/4" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {!isLoading && rows.length === 0 && (
        <StatusMessage variant="empty" text="No students enrolled yet." />
      )}

      {!isLoading && rows.length > 0 && (
        <div className="rounded-xl border border-white/20 bg-white shadow-lg p-2">
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow>
                {columns.map((col, i) => {
                  const sortKeyForCol = col.sortableKey;
                  return (
                    <TableHead key={i} style={{ width: col.width }}>
                      {sortKeyForCol ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-0 text-gray-800"
                          onClick={() => toggleSort(sortKeyForCol)}
                        >
                          {col.header}
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        </Button>
                      ) : (
                        col.header
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.map((row) => (
                <TableRow key={row.student_id}>
                  {columns.map((col, i) => (
                    <TableCell key={i} style={{ width: col.width }}>
                      {col.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {errorMessage && (
        <StatusMessage variant="error" text={errorMessage} />
      )}
    </div>
  );
}
