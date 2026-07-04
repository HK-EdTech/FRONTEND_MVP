'use client';

import { useState } from 'react';
import { ScanHomework } from '@/components/Scan_and_mark/Scan_and_upload/scanHomework';
import { HomeworkCriteria_OnetimeUpload } from '@/components/Scan_and_mark/Scan_and_upload/homeworkCriteria/HomeworkCriteria_OnetimeUpload';
import { HomeworkCriteria_Class } from '@/components/Scan_and_mark/Scan_and_upload/homeworkCriteria/HomeworkCriteria_Class';
import { UploadButton } from '@/components/Scan_and_mark/ScanAndWrapper_component';

interface ScanAndMarkWrapperProps {
  homework_type: 'onetime' | 'class';
}

export function ScanAndMarkWrapper({ homework_type }: ScanAndMarkWrapperProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const renderScanHomework = () => {
    switch (homework_type) {
      case 'onetime':
        return <ScanHomework HomeworkCriteria={HomeworkCriteria_OnetimeUpload} />;
      case 'class':
        // return <ScanHomework HomeworkCriteria={HomeworkCriteria_Class} />;
        return null;
    }
  };

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
        {renderScanHomework()}

        <div className="flex justify-end mt-4">
          <UploadButton homework_type={homework_type} onProcessingChange={setIsProcessing} />
        </div>
      </div>
    </div>
  );
}
