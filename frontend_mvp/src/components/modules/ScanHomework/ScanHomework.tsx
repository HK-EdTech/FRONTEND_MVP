'use client';

import React, { useState, useRef } from 'react';

// Import from component file
import {
  HomeworkSheet,
  StudentHomework,
  glassStyle,
  processFiles,
  handleDrag,
  handleDrop,
  ErrorAlert,
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
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Mobile Detection
  const isMobile = useIsMobile();

  // Main File Handler
  const handleFiles = async (files: File[], homeworkId: string | null) => {
    setError('');
    const sheets = await processFiles(files, setError, setIsProcessing);

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
    }
  };

  // Selected homework for dialog
  const selectedHomework = homeworkList.find(hw => hw.id === selectedHomeworkId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent">
          Scan & Mark Homework
        </h1>
        <p className="text-gray-600 mt-1">Upload and scan student homework for AI-powered marking</p>
      </div>

      {/* Error Alert */}
      <ErrorAlert error={error} onDismiss={() => setError('')} />

      {/* Loading State */}
      <LoadingOverlay isProcessing={isProcessing} />

      {/* Main Content */}
      <div className="rounded-2xl p-6 shadow-xl" style={glassStyle}>
        {/* Initial Upload Area (when no homework exists) */}
        {homeworkList.length === 0 && (
          <InitialUploadArea
            dragActive={dragActive}
            onDragEnter={(e) => handleDrag(e, setDragActive)}
            onDragOver={(e) => handleDrag(e, setDragActive)}
            onDragLeave={(e) => handleDrag(e, setDragActive)}
            onDrop={(e) => handleDrop(e, setDragActive, (files) => handleFiles(files, null))}
            onUploadClick={() => fileInputRef.current?.click()}
            onCameraClick={() => cameraInputRef.current?.click()}
            fileInputRef={fileInputRef}
            cameraInputRef={cameraInputRef}
            onFileChange={(files) => handleFiles(files, null)}
            isMobile={isMobile}
          />
        )}

        {/* Homework List Display (when homework exists) */}
        {homeworkList.length > 0 && (
          <HomeworkListDisplay
            homeworkList={homeworkList}
            onHomeworkClick={(id) => setSelectedHomeworkId(id)}
            onUploadClick={() => fileInputRef.current?.click()}
            onCameraClick={() => cameraInputRef.current?.click()}
          />
        )}
      </div>

      {/* Dialog for Viewing and Adding Sheets */}
      <HomeworkDialog
        isOpen={!!selectedHomeworkId}
        homework={selectedHomework}
        onClose={() => setSelectedHomeworkId(null)}
        onAddSheets={(files) => handleFiles(files, selectedHomeworkId)}
      />
    </div>
  );
}
