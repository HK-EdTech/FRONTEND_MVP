'use client';

import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  setClassName,
  setSubject,
  setDbHomeworkId,
} from '@/store/slices/homeworkCriteria_Class_slice';

interface HomeworkCriteria_ClassProps {
  className: string;
  subject: string;
  DbHomeworkId: string | null;
}

export function HomeworkCriteria_Class({
  className,
  subject,
  DbHomeworkId,
}: HomeworkCriteria_ClassProps) {
  const dispatch = useDispatch();

  // Sync props into Redux store
  useEffect(() => {
    dispatch(setClassName(className));
    dispatch(setSubject(subject));
    dispatch(setDbHomeworkId(DbHomeworkId));
  }, [className, subject, DbHomeworkId, dispatch]);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Class */}
        <div>
          <p className="text-sm text-gray-600 mb-2">Class</p>
          <input
            type="text"
            value={className}
            readOnly
            className="w-full px-4 py-2 text-sm rounded-xl border border-white/30 bg-white/10 text-gray-800 cursor-default focus:outline-none"
          />
        </div>

        {/* Subject */}
        <div>
          <p className="text-sm text-gray-600 mb-2">Subject</p>
          <input
            type="text"
            value={subject}
            readOnly
            className="w-full px-4 py-2 text-sm rounded-xl border border-white/30 bg-white/10 text-gray-800 cursor-default focus:outline-none"
          />
        </div>

        {/* Homework */}
        <div>
          <p className="text-sm text-gray-600 mb-2">Homework</p>
          <input
            type="text"
            value={DbHomeworkId ?? ''}
            readOnly
            className="w-full px-4 py-2 text-sm rounded-xl border border-white/30 bg-white/10 text-gray-800 cursor-default focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
