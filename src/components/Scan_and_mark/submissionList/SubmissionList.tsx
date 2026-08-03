import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { addSubmission, setStudentName } from '@/store/slices/ScanAndMark_homeworksubmissions_slice';
import { groupForStatus } from '@/store/slices/scanAndMark_statusGroups_slice';
import { statusColors } from '@/theme/statusColors';
import { RootState } from '@/store/store';
import { handleUploadFiles } from '@/common/utility/handleUploadFiles';
import { Loading } from '@/components/common/Loading';
import { Camera, Upload } from 'lucide-react';
import { StackedSheetsPreview, TriageBar } from './submissionlist_component';

// Mobile Detection Hook
export const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // 1. Define the media query
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);

    // 2. Check User Agent (Optional: keep if you specifically need device detection)
    const uaCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    const handleUpdate = () => {
      setIsMobile(mediaQuery.matches || uaCheck);
    };

    // 3. Set initial value and listen for changes
    handleUpdate();

    // Modern browsers use addEventListener; older ones use addListener
    mediaQuery.addEventListener('change', handleUpdate);
    return () => mediaQuery.removeEventListener('change', handleUpdate);
  }, [breakpoint]);

  return isMobile;
};

// Submission List Display Component
interface SubmissionListDisplayProps {
  onSubmissionClick: (id: string) => void;
  isMobile: boolean;
}

export const SubmissionListDisplay = ({
  onSubmissionClick,
  isMobile,
}: SubmissionListDisplayProps) => {
  const dispatch = useDispatch();
  const submissionList = useSelector((state: RootState) => state.ScanAndMark_homeworksubmissions.submissionList);
  const activeGroup = useSelector((state: RootState) => state.scanAndMark_statusGroups.activeGroup);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter the grid to the active group; keep each submission's original index so its number is stable.
  const visibleSubmissions = submissionList
    .map((submission, index) => ({ submission, index }))
    .filter(({ submission }) => !activeGroup || groupForStatus(submission.status_frontend)?.key === activeGroup);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setIsProcessing(true);
    const sheets = await handleUploadFiles(Array.from(e.target.files));
    setIsProcessing(false);
    if (sheets.length === 0) return;
    dispatch(addSubmission({ submission_id: crypto.randomUUID(), studentName: `Student ${submissionList.length + 1}`, sheets }));
  };

  return (
    <>
      <Loading isProcessing={isProcessing} />
      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleInputChange} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={handleInputChange} />

      <div>
        {/* Triage bar — filter submissions by status group */}
        <TriageBar />

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {visibleSubmissions.map(({ submission, index }) => (
          <div key={submission.submission_id} className="flex flex-col gap-1">
            <div
              onClick={() => onSubmissionClick(submission.submission_id)}
              className="group rounded-xl text-left transition-all duration-300 hover:scale-105 hover:shadow-xl w-full aspect-[3/4] cursor-pointer"
            >
              <StackedSheetsPreview
                submission={submission}
                isMobile={isMobile}
              />
            </div>
            <input
              type="text"
              value={submission.studentName}
              placeholder={`Student ${index + 1}`}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => dispatch(setStudentName({ submission_id: submission.submission_id, studentName: e.target.value }))}
              className="w-full text-xs text-center rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:border-purple-400 bg-white/80 placeholder-gray-400"
            />
          </div>
        ))}

        {/* Add New Student Submission Box — only while the Draft group is the active filter */}
        {activeGroup === 'draft' && (
        <div className="rounded-xl p-2 border-2 border-dashed transition-colors w-full aspect-[3/4] add-submission-box">
          {isMobile ? (
            // Mobile: Two boxes stacked vertically
            <div className="flex flex-col gap-2 h-full">
              {/* Upload Box */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex flex-col items-center justify-center bg-black/10 rounded-lg hover:bg-black/[0.04] transition-colors"
              >
                <Upload className="w-8 h-8 mb-1" style={{ color: statusColors.draft }} />
                <p className="text-xs text-gray-700 font-medium">Tap to upload homework for </p>
                <p className="text-xs text-gray-700 font-medium">one more student</p>
              </button>

              {/* Scan Box */}
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="flex-1 flex flex-col items-center justify-center bg-black/10 rounded-lg hover:bg-black/[0.04] transition-colors"
              >
                <Camera className="w-8 h-8 mb-1" style={{ color: statusColors.draft }} />
                <p className="text-xs text-gray-700 font-medium">Tap to scan homework for</p>
                <p className="text-xs text-gray-700 font-medium">one more student</p>
              </button>
            </div>
          ) : (
            // Desktop: Single upload box
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-full flex flex-col items-center justify-center bg-black/10 rounded-lg hover:bg-black/[0.04] transition-colors"
            >
              <Upload className="w-12 h-12 mb-2" style={{ color: statusColors.draft }} />
              <p className="text-sm text-gray-700 font-medium">Click to upload</p>
            </button>
          )}
        </div>
        )}
        </div>
      </div>
    </>
  );
};
