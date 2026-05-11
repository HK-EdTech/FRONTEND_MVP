'use client';

import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import {
  setHomeworkTitle,
  setSelectedLevel,
  setSelectedOneTimeSubject,
  setMarkingSchemePdf_and_metadata,
  clearMarkingSchemePdf_and_metadata,
} from '@/store/slices/homeworkCriteria_OnetimeUpload_slice';
import { computeSha256 } from '@/common/utility/computeChecksum';
import { glassStyle } from '@/components/Scan_and_mark/Scan_and_upload/ScanHomework_component';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X } from 'lucide-react';

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
  const { homeworkTitle, selectedLevel, selectedOneTimeSubject, markingSchemePdf_and_metadata } = useSelector(
    (state: RootState) => state.Homeworkcriteria_onetimeUpload
  );
  const markingSchemeFileName = markingSchemePdf_and_metadata.file_name;
  const markingSchemeInputRef = useRef<HTMLInputElement>(null);

  const handleMarkingSchemeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const checksum = await computeSha256(file);
    dispatch(setMarkingSchemePdf_and_metadata({
      file,
      file_name: file.name,
      file_size: file.size,
      content_type: file.type || 'application/pdf',
      checksum,
    }));
  };

  // Update isUploadDisabled whenever level or subject changes
  useEffect(() => {
    setIsUploadDisabled(!homeworkTitle || !selectedLevel || !selectedOneTimeSubject);
  }, [homeworkTitle, selectedLevel, selectedOneTimeSubject, setIsUploadDisabled]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Row 1: Homework Title + Subject */}
        <div>
          <label className="block text-sm text-gray-600 mb-2">Homework Title</label>
          <input
            type="text"
            value={homeworkTitle}
            onChange={(e) => dispatch(setHomeworkTitle(e.target.value))}
            placeholder="Enter homework title"
            className="w-full px-4 py-2 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

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
                    ? 'text-white bg-gradient-to-r from-[#5BDCE5] to-[#0552B0]'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                style={subject === selectedOneTimeSubject ? undefined : glassStyle}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Level + Marking Scheme */}
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

        {/* Marking Scheme Upload */}
        <div>
          <p className="text-sm text-gray-600 mb-2">Marking Scheme</p>
          <input
            ref={markingSchemeInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleMarkingSchemeChange}
          />
          <div
            onClick={() => markingSchemeInputRef.current?.click()}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl cursor-pointer transition-all"
            style={markingSchemeFileName
              ? { ...glassStyle, border: '2px solid rgba(91, 220, 229, 1)' }
              : glassStyle
            }
          >
            <Upload className="w-4 h-4 text-purple-500 shrink-0" />
            <span className={`text-sm truncate flex-1 ${markingSchemeFileName ? 'text-gray-800' : 'text-gray-400'}`}>
              {markingSchemeFileName || 'Upload marking scheme (PDF)'}
            </span>
            {markingSchemeFileName && (
              <button
                onClick={(e) => { e.stopPropagation(); dispatch(clearMarkingSchemePdf_and_metadata()); }}
                className="shrink-0 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
  );
}
