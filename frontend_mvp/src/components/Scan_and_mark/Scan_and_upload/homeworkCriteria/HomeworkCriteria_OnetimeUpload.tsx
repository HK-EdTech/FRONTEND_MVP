'use client';

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import {
  setSelectedLevel,
  setSelectedOneTimeSubject,
} from '@/store/slices/homeworkCriteria_OnetimeUpload_slice';
import { glassStyle } from '@/components/modules/Scan_and_mark/Scan_and_upload/ScanHomework_component';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const LEVELS = ['Secondary 1', 'Secondary 2', 'Secondary 3', 'Secondary 4', 'Secondary 5', 'Secondary 6'];
const ONE_TIME_SUBJECTS = ['Mathematics', 'English'];

interface HomeworkCriteria_OnetimeUploadProps {
  isUploadDisabled: boolean;
  setIsUploadDisabled: (disabled: boolean) => void;
}

export function HomeworkCriteria_OnetimeUpload({
  isUploadDisabled,
  setIsUploadDisabled,
}: HomeworkCriteria_OnetimeUploadProps) {
  const dispatch = useDispatch();
  const { selectedLevel, selectedOneTimeSubject } = useSelector(
    (state: RootState) => state.Homeworkcriteria_onetimeUpload
  );

  // Update isUploadDisabled whenever level or subject changes
  useEffect(() => {
    setIsUploadDisabled(!selectedLevel || !selectedOneTimeSubject);
  }, [selectedLevel, selectedOneTimeSubject, setIsUploadDisabled]);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Level Selection */}
        <div>
          <p className="text-sm text-gray-600 mb-2">Level</p>
          <Select
            value={selectedLevel}
            onValueChange={(value) => dispatch(setSelectedLevel(value))}
          >
            <SelectTrigger className="w-full rounded-xl border-white/30 bg-white/10 shadow-[0_8px_32px_rgba(31,38,135,0.15)] focus:outline-none focus:ring-2 focus:ring-purple-500 focus-visible:ring-purple-500 focus-visible:border-purple-500">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              {LEVELS.map(level => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Subject Selection */}
        <div>
          <p className="text-sm text-gray-600 mb-2">Subject</p>
          <div className="flex flex-wrap gap-2">
            {ONE_TIME_SUBJECTS.map(subject => (
              <button
                key={subject}
                onClick={() =>
                  dispatch(setSelectedOneTimeSubject(subject === selectedOneTimeSubject ? '' : subject))
                }
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
                  subject === selectedOneTimeSubject
                    ? 'text-white bg-gradient-to-r from-purple-500 to-teal-500'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                style={subject === selectedOneTimeSubject ? undefined : glassStyle}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
