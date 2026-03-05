'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { api, ClassWithHomeworkResponse } from '@/lib/api';
import { HomeworkCriteria } from './HomeworkCriteria';

// Import from component file
import {
  HomeworkSheet,
  StudentHomework,
  glassStyle,
  LoadingOverlay,
  InitialUploadArea,
  HomeworkListDisplay,
  HomeworkDialog,
  useIsMobile,
} from './ScanHomework_component';

export function ScanHomework() {
  // State Management
  const [homeworkList, setHomeworkList] = useState<StudentHomework[]>([]);
  const [selectedHomeworkId, setSelectedHomeworkId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Class and Subject Selection State
  const [classes, setClasses] = useState<ClassWithHomeworkResponse[]>([]);
  const [selectedClassName, setSelectedClassName] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);

  // Homework Criteria State
  const [isOneTimeUpload, setIsOneTimeUpload] = useState(true);
  const [selectedDbHomeworkId, setSelectedDbHomeworkId] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedOneTimeSubject, setSelectedOneTimeSubject] = useState<string>('');

  // Mobile Detection
  const isMobile = useIsMobile();

  // Upload disabled until criteria are filled for the active mode
  const isUploadDisabled = isOneTimeUpload
    ? !selectedLevel || !selectedOneTimeSubject
    : !selectedDbHomeworkId;

  // Fetch teacher's classes with homework on mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await api.getClassesSubjectHomework();
        setClasses(data);
      } catch (err) {
        console.error('Failed to fetch classes:', err);
        setClasses([]);
      } finally {
        setIsLoadingClasses(false);
      }
    };
    fetchClasses();
  }, []);

  // Main File Handler
  const handleFiles = async (files: File[], homeworkId: string | null) => {
    if (isUploadDisabled) return;

    // Constants for file validation
    const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp', 'image/jpg'];
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    setIsProcessing(true);
    const sheets: HomeworkSheet[] = [];

    try {
      for (const file of files) {
        // File Validation
        if (!ACCEPTED_TYPES.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|heic|heif|webp)$/i)) {
          toast.error(`${file.name} is not a supported image format. Please use JPG, PNG, HEIC, or WebP.`);
          continue;
        }
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`${file.name} exceeds 10MB limit.`);
          continue;
        }

        // Thumbnail Generation
        const thumbnail = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              const maxWidth = 400;
              const scaleFactor = maxWidth / img.width;
              canvas.width = maxWidth;
              canvas.height = img.height * scaleFactor;
              ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
              resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.onerror = reject;
            img.src = e.target?.result as string;
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        sheets.push({
          id: `sheet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file,
          thumbnail
        });
      }
    } catch (error) {
      toast.error('Failed to process images. Please try again.');
    } finally {
      setIsProcessing(false);
    }

    if (sheets.length === 0) return;

    if (homeworkId) {
      // Add to existing student homework
      setHomeworkList(prev => prev.map(hw =>
        hw.id === homeworkId
          ? { ...hw, sheets: [...hw.sheets, ...sheets] }
          : hw
      ));
    } else {
      // Create new student homework
      const newHomework: StudentHomework = {
        id: `homework-${Date.now()}`,
        sheets,
        createdAt: new Date()
      };
      setHomeworkList(prev => [...prev, newHomework]);
      // Auto-open dialog for newly created homework
      setSelectedHomeworkId(newHomework.id);
    }
  };

  // Handle sheet reordering
  const handleSheetsReorder = (homeworkId: string, newSheets: HomeworkSheet[]) => {
    setHomeworkList(prev => prev.map(hw =>
      hw.id === homeworkId
        ? { ...hw, sheets: newSheets }
        : hw
    ));
  };

  // Handle deleting entire homework
  const handleHomeworkDelete = (homeworkId: string) => {
    setHomeworkList(prev => prev.filter(hw => hw.id !== homeworkId));
    // Close dialog if the deleted homework was open
    if (selectedHomeworkId === homeworkId) {
      setSelectedHomeworkId(null);
    }
  };

  // Handle deleting individual sheet
  const handleSheetDelete = (homeworkId: string, sheetId: string) => {
    setHomeworkList(prev => prev.map(hw =>
      hw.id === homeworkId
        ? { ...hw, sheets: hw.sheets.filter(sheet => sheet.id !== sheetId) }
        : hw
    ));
  };

  // Selected homework for dialog
  const selectedHomework = homeworkList.find(hw => hw.id === selectedHomeworkId);

  return (
    <div className="space-y-6">
      {/* Loading State */}
      <LoadingOverlay isProcessing={isProcessing} />

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files), null)}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files), null)}
      />

      {/* Main Content */}
      <motion.div layout transition={{ duration: 0.3, ease: 'easeInOut' }} className="rounded-2xl p-6 shadow-xl relative group/upload" style={glassStyle}>
        {/* Homework Criteria Panel */}
        <HomeworkCriteria
          classes={classes}
          isLoadingClasses={isLoadingClasses}
          isOneTimeUpload={isOneTimeUpload}
          onToggleOneTimeUpload={setIsOneTimeUpload}
          selectedClassName={selectedClassName}
          onSelectClassName={setSelectedClassName}
          selectedSubject={selectedSubject}
          onSelectSubject={setSelectedSubject}
          selectedDbHomeworkId={selectedDbHomeworkId}
          onSelectDbHomeworkId={setSelectedDbHomeworkId}
          selectedLevel={selectedLevel}
          onSelectLevel={setSelectedLevel}
          selectedOneTimeSubject={selectedOneTimeSubject}
          onSelectOneTimeSubject={setSelectedOneTimeSubject}
          isMobile={isMobile}
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
            {homeworkList.length === 0 && (
              <InitialUploadArea
                onFilesDropped={(files) => handleFiles(files, null)}
                onUploadClick={() => fileInputRef.current?.click()}
                onCameraClick={() => cameraInputRef.current?.click()}
                isMobile={isMobile}
              />
            )}

            {/* Homework List Display (when homework exists) */}
            {homeworkList.length > 0 && (
              <HomeworkListDisplay
                homeworkList={homeworkList}
                onHomeworkClick={(id) => setSelectedHomeworkId(id)}
                onHomeworkDelete={handleHomeworkDelete}
                onUploadClick={() => fileInputRef.current?.click()}
                onCameraClick={() => cameraInputRef.current?.click()}
                isMobile={isMobile}
              />
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Dialog for Viewing and Adding Sheets */}
      <HomeworkDialog
        isOpen={!!selectedHomeworkId}
        homework={selectedHomework}
        onClose={() => setSelectedHomeworkId(null)}
        onAddSheets={(files) => handleFiles(files, selectedHomeworkId)}
        onSheetsReorder={handleSheetsReorder}
        onSheetDelete={handleSheetDelete}
        isMobile={isMobile}
      />
    </div>
  );
}
