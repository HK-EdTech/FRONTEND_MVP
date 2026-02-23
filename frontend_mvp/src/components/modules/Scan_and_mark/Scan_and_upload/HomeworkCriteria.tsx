'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClassWithHomeworkResponse } from '@/lib/api';
import { glassStyle } from './ScanHomework_component';

interface HomeworkCriteriaProps {
  classes: ClassWithHomeworkResponse[];
  isLoadingClasses: boolean;
  isOneTimeUpload: boolean;
  onToggleOneTimeUpload: (value: boolean) => void;
  selectedClassName: string;
  onSelectClassName: (name: string) => void;
  selectedSubject: string;
  onSelectSubject: (subject: string) => void;
  selectedDbHomeworkId: string | null;
  onSelectDbHomeworkId: (id: string | null) => void;
  isMobile: boolean;
}

const fadeSlide = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.5 },
};

export function HomeworkCriteria({
  classes,
  isLoadingClasses,
  isOneTimeUpload,
  onToggleOneTimeUpload,
  selectedClassName,
  onSelectClassName,
  selectedSubject,
  onSelectSubject,
  selectedDbHomeworkId,
  onSelectDbHomeworkId,
  isMobile,
}: HomeworkCriteriaProps) {
  // Derive unique class names
  const classNames = useMemo(() => {
    const names = [...new Set(classes.map(c => c.name))];
    return names.sort();
  }, [classes]);

  // Derive subjects for selected class name
  const availableSubjects = useMemo(() => {
    if (!selectedClassName) return [];
    const subjects = classes
      .filter(c => c.name === selectedClassName)
      .map(c => c.subject);
    return [...new Set(subjects)].sort();
  }, [classes, selectedClassName]);

  // Derive homework for selected class + subject (from already-fetched data)
  const availableHomework = useMemo(() => {
    if (!selectedClassName || !selectedSubject) return [];
    const matchingClass = classes.find(
      c => c.name === selectedClassName && c.subject === selectedSubject
    );
    return matchingClass?.homework ?? [];
  }, [classes, selectedClassName, selectedSubject]);

  return (
    <div>
      {/* Row 1: Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-800 font-medium">
            {isMobile ? 'One-time upload or scan' : 'One-time upload'}
          </h3>
          <p className="text-sm text-gray-500">
            {isOneTimeUpload
              ? 'Upload without assigning to an existing homework'
              : 'Select a class, subject, and homework'}
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isOneTimeUpload}
            onChange={(e) => onToggleOneTimeUpload(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
        </label>
      </div>

      {/* Criteria Selection (visible when toggle OFF) */}
      <AnimatePresence>
        {!isOneTimeUpload && (
          <motion.div {...fadeSlide}>
            {/* Row 2: Class + Subject */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Class Selection */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Class</p>
                <div className="flex flex-wrap gap-2">
                  {isLoadingClasses ? (
                    <span className="text-sm text-gray-400">Loading...</span>
                  ) : classNames.length === 0 ? (
                    <span className="text-sm text-gray-400">No classes found.</span>
                  ) : (
                    classNames.map(name => (
                      <button
                        key={name}
                        onClick={() => {
                          onSelectClassName(name === selectedClassName ? '' : name);
                          onSelectSubject('');
                          onSelectDbHomeworkId(null);
                        }}
                        className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
                          name === selectedClassName
                            ? 'text-white bg-gradient-to-r from-purple-500 to-teal-500'
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                        style={name === selectedClassName ? undefined : glassStyle}
                      >
                        {name}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Subject Selection */}
              <AnimatePresence>
                {selectedClassName && (
                  <motion.div {...fadeSlide}>
                    <p className="text-sm text-gray-600 mb-2">Subject</p>
                    <div className="flex flex-wrap gap-2">
                      {availableSubjects.map(subject => (
                        <button
                          key={subject}
                          onClick={() => {
                            onSelectSubject(subject === selectedSubject ? '' : subject);
                            onSelectDbHomeworkId(null);
                          }}
                          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
                            subject === selectedSubject
                              ? 'text-white bg-gradient-to-r from-purple-500 to-teal-500'
                              : 'text-gray-600 hover:text-gray-800'
                          }`}
                          style={subject === selectedSubject ? undefined : glassStyle}
                        >
                          {subject}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Row 3: Homework Selection */}
            <AnimatePresence>
              {selectedClassName && selectedSubject && (
                <motion.div {...fadeSlide} className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Homework</p>
                  {availableHomework.length === 0 ? (
                    <span className="text-sm text-gray-400">No homework found for this class and subject.</span>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {availableHomework.map(hw => (
                        <button
                          key={hw.id}
                          onClick={() =>
                            onSelectDbHomeworkId(hw.id === selectedDbHomeworkId ? null : hw.id)
                          }
                          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
                            hw.id === selectedDbHomeworkId
                              ? 'text-white bg-gradient-to-r from-purple-500 to-teal-500'
                              : 'text-gray-600 hover:text-gray-800'
                          }`}
                          style={hw.id === selectedDbHomeworkId ? undefined : glassStyle}
                        >
                          {hw.title || 'Untitled'}
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
