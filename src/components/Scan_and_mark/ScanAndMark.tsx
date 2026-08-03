'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { addSubmission } from '@/store/slices/ScanAndMark_homeworksubmissions_slice';
import { handleUploadFiles } from '@/common/utility/handleUploadFiles';

import {
  SubmissionListDisplay,
  useIsMobile,
} from './submissionList/SubmissionList';
import { SubmissionDialog } from './submissionList/submissionlist_component';
import { GlassPanel } from '@/components/common/GlassPanel';
import { Loading } from '@/components/common/Loading';
import { Button } from '@/components/ui/button';
import { Upload, Camera } from 'lucide-react';

interface ScanAndMarkProps {
  HomeworkCriteria: React.ComponentType;
}

export function ScanAndMark({ HomeworkCriteria }: ScanAndMarkProps) {
  // State Management
  const submissionListRoot = useSelector((state: RootState) => state.ScanAndMark_homeworksubmissions.submissionList);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);

  // Mobile Detection
  const isMobile = useIsMobile();

  // Selected submission for dialog
  const selectedSubmission = submissionListRoot.find(s => s.submission_id === selectedSubmissionId);

  return (
    <div className="space-y-6">
      {/* Main Content */}
      <GlassPanel className="relative group/upload">
        {/* Homework Criteria Panel */}
        <HomeworkCriteria />

        {/* Separator */}
        <div className="my-4" style={{ height: '1px', background: 'rgba(0,0,0,0.08)' }} />

        <motion.div
          layout
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {/* Initial Upload Area (when no submission exists) */}
          {submissionListRoot.length === 0 && (
            <InitialUploadArea
              isMobile={isMobile}
            />
          )}

          {/* Submission List Display (when submissions exist) */}
          {submissionListRoot.length > 0 && (
            <SubmissionListDisplay
              onSubmissionClick={(id) => setSelectedSubmissionId(id)}
              isMobile={isMobile}
            />
          )}
        </motion.div>
      </GlassPanel>

      {/* Dialog for Viewing and Adding Sheets */}
      <SubmissionDialog
        isOpen={!!selectedSubmissionId}
        submission={selectedSubmission}
        onClose={() => setSelectedSubmissionId(null)}
        isMobile={isMobile}
      />
    </div>
  );
}

// Initial Upload Area Component (shown when no submission exists yet)
interface InitialUploadAreaProps {
  isMobile: boolean;
}

const InitialUploadArea = ({
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
    dispatch(addSubmission({ submission_id: crypto.randomUUID(), studentName: `Student ${submissionList.length + 1}`, sheets }));
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
    dispatch(addSubmission({ submission_id: crypto.randomUUID(), studentName: `Student ${submissionList.length + 1}`, sheets }));
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