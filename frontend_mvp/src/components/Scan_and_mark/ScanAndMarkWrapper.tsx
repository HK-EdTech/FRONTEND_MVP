'use client';

import React, { useState } from 'react';
import { ScanHomework } from '@/components/Scan_and_mark/Scan_and_upload/scanHomework';
import { HomeworkCriteria_OnetimeUpload } from '@/components/Scan_and_mark/Scan_and_upload/homeworkCriteria/HomeworkCriteria_OnetimeUpload';
import { OcrAndAdjustDummy } from '@/components/Scan_and_mark/OCR_and_adjust/OcrAndAdjustDummy';
import { ResultDummy } from '@/components/Scan_and_mark/Result/ResultDummy';
import { glassStyle } from '@/components/Scan_and_mark/Scan_and_upload/ScanHomework_component';
import { motion } from 'framer-motion';
import { UploadButton } from '@/components/Scan_and_mark/ScanAndWrapper_component';

const STAGES = [
  { key: 'scan', label: 'Scan & Upload' },
  { key: 'adjust', label: 'OCR & Adjust' },
  { key: 'result', label: 'Result' },
] as const;

interface ScanAndMarkWrapperProps {
  homework_type: 'onetime' | 'class';
}

export function ScanAndMarkWrapper({ homework_type }: ScanAndMarkWrapperProps) {
  const [stageIndex, setStageIndex] = React.useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const CurrentStage = React.useMemo(() => {
    switch (stageIndex) {
      case 0:
        return () => <ScanHomework HomeworkCriteria={HomeworkCriteria_OnetimeUpload} />;
      case 1:
        return OcrAndAdjustDummy;
      default:
        return ResultDummy;
    }
  }, [stageIndex]);

  return (
    <div className="flex flex-col min-h-[calc(100vh-7rem)]">
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl px-8 py-6 flex flex-col items-center gap-3 shadow-xl">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-600 font-medium">Processing homework...</span>
          </div>
        </div>
      )}

      <div>
        <CurrentStage />
        <div className="flex justify-end mt-4 gap-4">
          {stageIndex > 0 && (
            <button
              onClick={() => setStageIndex(prev => prev - 1)}
              className="px-4 py-2 text-sm font-semibold rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Back
            </button>
          )}
          {stageIndex === 0 && (
            <UploadButton
              homework_type={homework_type}
              setStageIndex={setStageIndex}
              onProcessingChange={setIsProcessing}
            />
          )}
          {stageIndex === 1 && (
            <button
              onClick={() => setStageIndex(2)}
              className="px-4 py-2 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-purple-500 to-teal-500 hover:from-purple-600 hover:to-teal-600 transition-colors"
            >
              Submit
            </button>
          )}
        </div>
      </div>

      <div className="mt-auto pt-6">
        <div className="flex items-center justify-between w-full max-w-2xl mx-auto px-4">
          {STAGES.map((stage, idx) => (
            <React.Fragment key={stage.key}>
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  animate={{
                    scale: idx === stageIndex ? 1.1 : 1,
                    borderColor: idx === stageIndex ? 'rgba(255, 255, 255, 0.5)' : 'rgba(216, 180, 254, 0.5)',
                  }}
                  className="relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-500 z-10"
                  style={{
                    ...glassStyle,
                    background: idx === stageIndex
                      ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.8), rgba(20, 184, 166, 0.8))'
                      : 'rgba(255, 255, 255, 0.1)',
                    border: idx === stageIndex ? glassStyle.border : 'none',
                    boxShadow: idx === stageIndex ? glassStyle.boxShadow : '0 8px 32px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <span className={`text-sm font-bold ${idx === stageIndex ? 'text-white' : 'text-gray-400'}`}>
                    {idx + 1}
                  </span>

                  {idx === stageIndex && (
                    <motion.div
                      layoutId="glow"
                      className="absolute inset-0 rounded-full blur-md bg-teal-400/30 -z-10"
                    />
                  )}
                </motion.div>

                <span className={`text-[10px] uppercase tracking-wider font-semibold ${idx === stageIndex ? 'text-gray-900' : 'text-gray-400'}`}>
                  {stage.label}
                </span>
              </div>

              {idx < STAGES.length - 1 && (
                <div className="relative flex-1 h-[2px] bg-gray-300 self-center mb-6 -mx-7 overflow-hidden">
                  <motion.div
                    initial={false}
                    animate={{ width: idx < stageIndex ? '100%' : '0%' }}
                    transition={{ duration: 0.4 }}
                    className="h-full bg-gradient-to-r from-purple-600 to-teal-600"
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
