'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

import {
  InitialUploadArea,
  HomeworkListDisplay,
  HomeworkDialog,
  useIsMobile,
} from './ScanHomework_component';
import { GlassPanel } from '@/components/common/GlassPanel';

interface ScanHomeworkProps {
  HomeworkCriteria: React.ComponentType;
}

export function ScanHomework({ HomeworkCriteria }: ScanHomeworkProps) {
  // State Management
  const homeworkListRoot = useSelector((state: RootState) => state.uploadHomework_ScanAndMark.homeworkList);
  const [selectedHomeworkId, setSelectedHomeworkId] = useState<string | null>(null);

  // Mobile Detection
  const isMobile = useIsMobile();

  // Selected homework for dialog
  const selectedHomework = homeworkListRoot.find(hw => hw.id === selectedHomeworkId);

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
          {/* Initial Upload Area (when no homework exists) */}
          {homeworkListRoot.length === 0 && (
            <InitialUploadArea
              isMobile={isMobile}
            />
          )}

          {/* Homework List Display (when homework exists) */}
          {homeworkListRoot.length > 0 && (
            <HomeworkListDisplay
              onHomeworkClick={(id) => setSelectedHomeworkId(id)}
              isMobile={isMobile}
            />
          )}
        </motion.div>
      </GlassPanel>

      {/* Dialog for Viewing and Adding Sheets */}
      <HomeworkDialog
        isOpen={!!selectedHomeworkId}
        homework={selectedHomework}
        onClose={() => setSelectedHomeworkId(null)}
        isMobile={isMobile}
      />
    </div>
  );
}
