'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { api, ClassResponse } from '@/lib/api';

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

  // Class and Subject Selection State
  const [classes, setClasses] = useState<ClassResponse[]>([]);
  const [selectedClassName, setSelectedClassName] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);

  // Mobile Detection
  const isMobile = useIsMobile();

  // Fetch teacher's classes on mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const teacherProfile = await api.getMyTeacherProfile();
        setClasses(teacherProfile.classes || []);
      } catch (err) {
        console.error('Failed to fetch teacher classes:', err);
        setClasses([]);
      } finally {
        setIsLoadingClasses(false);
      }
    };
    fetchClasses();
  }, []);

  // Get unique class names
  const classNames = useMemo(() => {
    const names = [...new Set(classes.map(c => c.name))];
    return names.sort();
  }, [classes]);

  // Get subjects for selected class name
  const availableSubjects = useMemo(() => {
    if (!selectedClassName) return [];
    const subjects = classes
      .filter(c => c.name === selectedClassName)
      .map(c => c.subject);
    return [...new Set(subjects)].sort();
  }, [classes, selectedClassName]);

  // Reset subject when class name changes
  useEffect(() => {
    setSelectedSubject('');
  }, [selectedClassName]);

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
      {/* Error Alert */}
      <ErrorAlert error={error} onDismiss={() => setError('')} />

      {/* Loading State */}
      <LoadingOverlay isProcessing={isProcessing} />

      {/* Hidden file inputs - always rendered so they work for both upload areas */}
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
      <div className="rounded-2xl p-6 shadow-xl" style={glassStyle}>
        {/* Class and Subject Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Class Name Select */}
          <select
            value={selectedClassName}
            onChange={(e) => setSelectedClassName(e.target.value)}
            disabled={isLoadingClasses}
            className="w-full px-4 py-2 rounded-xl border border-white/30 bg-white/10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            style={{ boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}
          >
            <option value="">Select a class...</option>
            {classNames.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>

          {/* Subject Select */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            disabled={!selectedClassName || availableSubjects.length === 0}
            className="w-full px-4 py-2 rounded-xl border border-white/30 bg-white/10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            style={{ boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}
          >
            <option value="">
              {!selectedClassName ? 'Subject(Select a class first...)' : 'Select a subject...'}
            </option>
            {availableSubjects.map((subject) => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>

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
      </div>

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
