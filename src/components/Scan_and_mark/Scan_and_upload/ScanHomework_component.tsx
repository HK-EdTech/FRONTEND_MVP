import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { addSubmission, deleteSubmission, addSheetsToSubmission, reorderSheets, deleteSheet, setStudentName, type UploadSubmission } from '@/store/slices/ScanAndMark_homeworksubmissions_slice';
import { selectGroupsWithCounts, setActiveGroup, groupForStatus } from '@/store/slices/scanAndMark_statusGroups_slice';
import { statusColors, chipColors } from '@/theme/statusColors';
import { RootState } from '@/store/store';
import { handleUploadFiles } from '@/common/utility/handleUploadFiles';
import { Loading } from '@/components/common/Loading';
import { Camera, Upload, Plus, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Glassmorphism Style
export const glassStyle = {
  backdropFilter: 'blur(16px)',
  background: 'rgba(255, 255, 255, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)'
};

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

// Poker Card Stacking Preview Component
export const StackedSheetsPreview = ({
  submission,
  studentNumber,
  isMobile,
}: {
  submission: { id: string; sheets: { id: string; file: File; thumbnail: string }[] };
  studentNumber?: number;
  isMobile?: boolean;
}) => {
  const dispatch = useDispatch();
  const { sheets } = submission;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Delete Student ${studentNumber}'s homework?`)) {
      dispatch(deleteSubmission(submission.id));
    }
  };

  if (sheets.length === 1) {
    return (
      <div className="relative w-full h-full rounded-lg overflow-hidden border-2 border-gray-300 group-hover:border-purple-400 transition-colors">
        <img
          src={sheets[0].thumbnail}
          alt="Homework Sheet"
          className="w-full h-full object-cover"
        />
        {/* Student number watermark */}
        {studentNumber !== undefined && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-8xl font-bold opacity-60" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.5)' }}>
              {studentNumber}
            </div>
          </div>
        )}
        {/* Sheet count badge */}
        <div className="absolute top-1 right-1 bg-purple-400 text-white rounded-lg w-7 h-7 flex items-center justify-center text-sm font-bold z-10">
          {sheets.length}
        </div>

        {/* Delete button */}
        <button
          onClick={handleDelete}
          className={`absolute bottom-1 right-1 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center shadow-lg transition-all z-20
            ${isMobile ? 'opacity-70' : 'opacity-0 group-hover:opacity-70 hover:!opacity-100'}`}
          aria-label="Delete homework"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // 2+ sheets: document stack effect (no rotation, full images)
  return (
    <div className="relative w-full h-full">
      {/* Third sheet (if exists) - most offset */}
      {sheets.length > 2 && (
        <div
          className="absolute rounded-lg overflow-hidden border-2 border-gray-300 group-hover:border-purple-400 shadow transition-colors"
          style={{
            width: 'calc(100% - 8px)',
            height: 'calc(100% - 8px)',
            top: '-8px',
            left: '-8px',
            zIndex: 0,
          }}
        >
          <img
            src={sheets[2].thumbnail}
            alt="Homework Sheet"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Second sheet - middle layer */}
      <div
        className="absolute rounded-lg overflow-hidden border-2 border-gray-300 group-hover:border-purple-400 shadow transition-colors"
        style={{
          width: 'calc(100% - 4px)',
          height: 'calc(100% - 4px)',
          top: '-4px',
          left: '-4px',
          zIndex: 1,
        }}
      >
        <img
          src={sheets[1].thumbnail}
          alt="Homework Sheet"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Front card (first sheet) */}
      <div
        className="absolute inset-0 rounded-lg overflow-hidden border-2 border-gray-400 group-hover:border-purple-500 shadow-lg transition-colors"
        style={{ zIndex: 2 }}
      >
        <img
          src={sheets[0].thumbnail}
          alt="Homework Sheet"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Student number watermark */}
      {studentNumber !== undefined && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 3 }}>
          <div className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-8xl font-bold opacity-60" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.5)' }}>
            {studentNumber}
          </div>
        </div>
      )}

      {/* Sheet count badge - always show */}
      <div className="absolute top-1 right-1 bg-purple-400 text-white rounded-lg w-7 h-7 flex items-center justify-center text-sm font-bold z-10">
        {sheets.length}
      </div>

      {/* Delete button */}
      <button
        onClick={handleDelete}
        className={`absolute bottom-1 right-1 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center shadow-lg transition-all z-20
          ${isMobile ? 'opacity-70' : 'opacity-0 group-hover:opacity-70 hover:!opacity-100'}`}
        aria-label="Delete homework"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

// Loading Overlay Component
interface LoadingOverlayProps {
  isProcessing: boolean;
}

export const LoadingOverlay = ({ isProcessing }: LoadingOverlayProps) => {
  if (!isProcessing) return null;

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <div className="rounded-xl p-6" style={glassStyle}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
        <p className="mt-4 text-gray-700">Processing images...</p>
      </div>
    </div>
  );
};

// Initial Upload Area Component
interface InitialUploadAreaProps {
  isMobile: boolean;
}

export const InitialUploadArea = ({
  isMobile,
}: InitialUploadAreaProps) => {
  const dispatch = useDispatch();
  const submissionList = useSelector((state: RootState) => state.ScanAndMark_homeworksubmissions.submissionList);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setIsProcessing(true);
    const sheets = await handleUploadFiles(Array.from(e.target.files));
    setIsProcessing(false);
    if (sheets.length === 0) return;
    dispatch(addSubmission({ id: `submission-${crypto.randomUUID()}`, studentName: `Student ${submissionList.length + 1}`, sheets }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
    setIsProcessing(true);
    const sheets = await handleUploadFiles(Array.from(e.dataTransfer.files));
    setIsProcessing(false);
    if (sheets.length === 0) return;
    dispatch(addSubmission({ id: `submission-${crypto.randomUUID()}`, studentName: `Student ${submissionList.length + 1}`, sheets }));
  };

  return (
    <>
      <Loading isProcessing={isProcessing} />
      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleInputChange} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={handleInputChange} />

      <div
        onDragEnter={!isMobile ? handleDrag : undefined}
        onDragOver={!isMobile ? handleDrag : undefined}
        onDragLeave={!isMobile ? handleDrag : undefined}
        onDrop={!isMobile ? handleDrop : undefined}
        className="rounded-2xl p-8 text-center transition-all duration-300"
        style={{
          background: dragActive && !isMobile
            ? 'linear-gradient(145deg, rgba(139, 92, 246, 0.15), rgba(20, 184, 166, 0.15))'
            : 'linear-gradient(145deg, rgba(139, 92, 246, 0.1), rgba(20, 184, 166, 0.1))',
          border: `2px dashed ${dragActive && !isMobile ? 'rgba(139, 92, 246, 0.6)' : 'rgba(139, 92, 246, 0.3)'}`,
          transform: dragActive && !isMobile ? 'scale(1.02)' : 'scale(1)',
        }}
      >
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Upload className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg text-gray-800 mb-2">Scan or upload photos for one or more students&apos; homework</h3>
        <div className="mb-6">
          {!isMobile && (
            <p className="text-sm text-gray-600">Drag and drop or click to browse</p>
          )}
        </div>

        <div className="flex gap-3 justify-center">
          {isMobile && (
            <Button
              onClick={() => cameraInputRef.current?.click()}
              variant="outline"
              size="lg"
              className="px-8 py-6 text-lg rounded-xl"
            >
              <Camera className="w-7 h-7 mr-3" />
              Take Picture
            </Button>
          )}
          {!isMobile ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-teal-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 hover:-translate-y-1 flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Upload Picture
            </button>
          ) : (
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              size="lg"
              className="px-8 py-6 text-lg rounded-xl"
            >
              <Upload className="w-7 h-7 mr-3" />
              Upload Picture
            </Button>
          )}
        </div>
      </div>
    </>
  );
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
  const groupsWithCounts = useSelector(selectGroupsWithCounts);
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
    dispatch(addSubmission({ id: `submission-${crypto.randomUUID()}`, studentName: `Student ${submissionList.length + 1}`, sheets }));
  };

  return (
    <>
      <Loading isProcessing={isProcessing} />
      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleInputChange} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={handleInputChange} />

      <div>
        {/* Triage bar — filter submissions by status group */}
        <div className="flex flex-wrap gap-2 mb-4">
          {groupsWithCounts.map((g) => {
            const empty = g.count === 0;
            const active = activeGroup === g.key;
            const dotColor = empty ? statusColors.disabled : g.color;
            return (
              <button
                key={g.key}
                disabled={empty}
                onClick={() => dispatch(setActiveGroup(active ? null : g.key))}
                style={{
                  background: active ? g.color : 'transparent',
                  color: active ? chipColors.onColorText : empty ? statusColors.disabled : chipColors.inactiveText,
                  borderColor: active ? g.color : empty ? statusColors.disabled : chipColors.inactiveBorder,
                  opacity: empty ? 0.55 : 1,
                  cursor: empty ? 'not-allowed' : 'pointer',
                }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 text-xs font-semibold transition-all"
              >
                <span style={{ background: dotColor }} className="w-2 h-2 rounded-full" />
                <span>{g.label}</span>
                <span
                  style={{ background: active ? chipColors.activeCountBg : dotColor, color: chipColors.onColorText }}
                  className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[11px] font-bold"
                >
                  {g.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {visibleSubmissions.map(({ submission, index }) => (
          <div key={submission.id} className="flex flex-col gap-1">
            <div
              onClick={() => onSubmissionClick(submission.id)}
              className="group rounded-xl text-left transition-all duration-300 hover:scale-105 hover:shadow-xl w-full aspect-[3/4] cursor-pointer"
            >
              <StackedSheetsPreview
                submission={submission}
                studentNumber={index + 1}
                isMobile={isMobile}
              />
            </div>
            <input
              type="text"
              value={submission.studentName}
              placeholder={`Student ${index + 1}`}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => dispatch(setStudentName({ id: submission.id, studentName: e.target.value }))}
              className="w-full text-xs text-center rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:border-purple-400 bg-white/80 placeholder-gray-400"
            />
          </div>
        ))}

        {/* Add New Student Submission Box */}
        <div
          className="rounded-xl p-2 border-2 border-dashed border-purple-300 hover:border-purple-500 transition-colors w-full aspect-[3/4]"
          style={{
            background: 'rgba(139, 92, 246, 0.05)',
          }}
        >
          {isMobile ? (
            // Mobile: Two boxes stacked vertically
            <div className="flex flex-col gap-2 h-full">
              {/* Upload Box */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex flex-col items-center justify-center bg-black/10 rounded-lg hover:bg-black/[0.04] transition-colors"
              >
                <Upload className="w-8 h-8 text-purple-500 mb-1" />
                <p className="text-xs text-gray-700 font-medium">Tap to upload homework for </p>
                <p className="text-xs text-gray-700 font-medium">one more student</p>
              </button>

              {/* Scan Box */}
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="flex-1 flex flex-col items-center justify-center bg-black/10 rounded-lg hover:bg-black/[0.04] transition-colors"
              >
                <Camera className="w-8 h-8 text-purple-500 mb-1" />
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
              <Upload className="w-12 h-12 text-purple-500 mb-2" />
              <p className="text-sm text-gray-700 font-medium">Click to upload</p>
            </button>
          )}
        </div>
        </div>
      </div>
    </>
  );
};

// Submission Dialog Component
interface SubmissionDialogProps {
  isOpen: boolean;
  submission: UploadSubmission | undefined;
  onClose: () => void;
  isMobile: boolean;
}

export const SubmissionDialog = ({
  isOpen,
  submission,
  onClose,
  isMobile,
}: SubmissionDialogProps) => {
  const dispatch = useDispatch();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !submission) return null;

  const moveSheet = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= submission.sheets.length) return;

    const newSheets = [...submission.sheets];
    const [movedSheet] = newSheets.splice(fromIndex, 1);
    newSheets.splice(toIndex, 0, movedSheet);
    dispatch(reorderSheets({ id: submission.id, sheets: newSheets }));
  };

  const handleDeleteSheet = (sheetId: string) => {
    if (submission.sheets.length === 1) {
      dispatch(deleteSubmission(submission.id));
      onClose();
      return;
    }
    dispatch(deleteSheet({ id: submission.id, sheetId }));
  };

  const handleAddSheets = async (files: File[]) => {
    setIsProcessing(true);
    const sheets = await handleUploadFiles(files);
    setIsProcessing(false);
    if (sheets.length === 0) return;
    dispatch(addSheetsToSubmission({ id: submission.id, sheets }));
  };

  return (
    <>
    <Loading isProcessing={isProcessing} />
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[85vh] overflow-y-auto dialog-glass-white"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent">
            Uploaded Homework
          </DialogTitle>
        </DialogHeader>

        {/* Sheets Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {submission.sheets.map((sheet, index) => (
            <motion.div
              key={sheet.id}
              layoutId={sheet.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                layout: { type: "spring", stiffness: 350, damping: 30 },
                opacity: { duration: 0.2 },
                scale: { duration: 0.2 }
              }}
              className="relative aspect-[3/4] rounded-lg overflow-hidden border-2 border-gray-300 hover:border-purple-400 transition-colors group"
            >
              <img
                src={sheet.thumbnail}
                alt="Homework Sheet"
                className="w-full h-full object-cover"
              />

              {/* Sheet number watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold opacity-60" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.5)' }}>
                  {index + 1}
                </div>
              </div>

              {/* Delete button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteSheet(sheet.id);
                }}
                className={`absolute bottom-1 right-1 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center shadow-lg transition-all z-20
                  ${isMobile ? 'opacity-70' : 'opacity-0 group-hover:opacity-70 hover:!opacity-100'}`}
                aria-label="Delete sheet"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Left Arrow - Only show if not first sheet */}
              {index > 0 && (
                <button
                  onClick={() => moveSheet(index, index - 1)}
                  className={`absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/70 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all z-20
                    ${isMobile ? 'opacity-50' : 'opacity-0 group-hover:opacity-50 hover:!opacity-100'}`}
                  aria-label="Move left"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
              )}

              {/* Right Arrow - Only show if not last sheet */}
              {index < submission.sheets.length - 1 && (
                <button
                  onClick={() => moveSheet(index, index + 1)}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/70 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all z-20
                    ${isMobile ? 'opacity-50' : 'opacity-0 group-hover:opacity-50 hover:!opacity-100'}`}
                  aria-label="Move right"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
              )}
            </motion.div>
          ))}

          {/* Add More Sheets Box */}
          <div
            className="rounded-xl p-2 border-2 border-dashed border-purple-300 hover:border-purple-500 transition-colors aspect-[3/4]"
            style={{ background: 'rgba(139, 92, 246, 0.05)' }}
          >
            {isMobile ? (
              // Mobile: Two boxes stacked vertically
              <div className="flex flex-col gap-2 h-full">
                {/* Upload Box */}
                <button
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.multiple = true;
                    input.onchange = (e) => {
                      const files = (e.target as HTMLInputElement).files;
                      if (files) handleAddSheets(Array.from(files));
                    };
                    input.click();
                  }}
                  className="flex-1 flex flex-col items-center justify-center bg-black/10 rounded-lg hover:bg-black/[0.04] transition-colors"
                >
                  <Upload className="w-8 h-8 text-purple-500 mb-1" />
                  <p className="text-xs text-gray-700 font-medium">Tap to upload</p>
                  <p className="text-xs text-gray-700 font-medium">more homework sheets</p>
                </button>

                {/* Scan Box */}
                <button
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.capture = 'environment';
                    input.multiple = true;
                    input.onchange = (e) => {
                      const files = (e.target as HTMLInputElement).files;
                      if (files) handleAddSheets(Array.from(files));
                    };
                    input.click();
                  }}
                  className="flex-1 flex flex-col items-center justify-center bg-black/10 rounded-lg hover:bg-black/[0.04] transition-colors"
                >
                  <Camera className="w-8 h-8 text-purple-500 mb-1" />
                  <p className="text-xs text-gray-700 font-medium">Tap to scan</p>
                </button>
              </div>
            ) : (
              // Desktop: Single upload box
              <button
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.multiple = true;
                  input.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files;
                    if (files) handleAddSheets(Array.from(files));
                  };
                  input.click();
                }}
                className="w-full h-full flex flex-col items-center justify-center bg-black/10 rounded-lg hover:bg-black/[0.04] transition-colors"
              >
                <Upload className="w-12 h-12 text-purple-500 mb-2" />
                <p className="text-sm text-gray-700 font-medium">Click to upload</p>
                <p className="text-xs text-gray-700 font-medium">more homework sheets</p>
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};
