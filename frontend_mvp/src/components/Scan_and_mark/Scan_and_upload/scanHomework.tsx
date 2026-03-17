'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  HomeworkCriteria: React.ComponentType<{
    isUploadDisabled: boolean;
    setIsUploadDisabled: (disabled: boolean) => void;
  }>;
}

export function ScanHomework({ HomeworkCriteria }: ScanHomeworkProps) {
  // State Management
  const homeworkListRoot = useSelector((state: RootState) => state.uploadHomework_ScanAndMark.homeworkList);
  const [selectedHomeworkId, setSelectedHomeworkId] = useState<string | null>(null);

  const [isUploadDisabled, setIsUploadDisabled] = useState(true);

  // Mobile Detection
  const isMobile = useIsMobile();

  // Selected homework for dialog
  const selectedHomework = homeworkListRoot.find(hw => hw.id === selectedHomeworkId);

  return (
    <div className="space-y-6">
      {/* Main Content */}
      <GlassPanel className="relative group/upload">
        {/* Homework Criteria Panel */}
        <HomeworkCriteria
          isUploadDisabled={isUploadDisabled}
          setIsUploadDisabled={setIsUploadDisabled}
        />

        {/* Separator */}
        <div className="my-4" style={{ height: '1px', background: 'rgba(0,0,0,0.08)' }} />

        {/* Disabled overlay: dims upload area and blocks clicks */}
        <div className="relative group/upload-area">
          <AnimatePresence>
            {isUploadDisabled && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 z-10 rounded-2xl bg-black/40 hover:bg-black/55 cursor-not-allowed flex items-center justify-center"
                style={{ transition: 'background-color 0.3s ease' }}
              >
                <span className="text-gray-300 group-hover/upload-area:text-white text-sm font-medium" style={{ transition: 'color 0.3s ease' }}>
                  Please select the homework conditions above.
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            layout
            className={isUploadDisabled ? 'pointer-events-none' : ''}
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
        </div>
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
