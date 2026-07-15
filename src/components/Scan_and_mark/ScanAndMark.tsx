'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

import {
  InitialUploadArea,
  SubmissionListDisplay,
  SubmissionDialog,
  useIsMobile,
} from './submissionList/SubmissionList';
import { GlassPanel } from '@/components/common/GlassPanel';

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
  const selectedSubmission = submissionListRoot.find(s => s.id === selectedSubmissionId);

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
