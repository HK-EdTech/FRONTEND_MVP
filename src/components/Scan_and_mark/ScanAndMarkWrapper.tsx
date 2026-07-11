'use client';

import { ScanHomework } from '@/components/Scan_and_mark/Scan_and_upload/scanHomework';
import { HomeworkCriteria_OnetimeUpload } from '@/components/Scan_and_mark/Scan_and_upload/homeworkCriteria/HomeworkCriteria_OnetimeUpload';
import { HomeworkCriteria_Class } from '@/components/Scan_and_mark/Scan_and_upload/homeworkCriteria/HomeworkCriteria_Class';
import { UploadButton } from '@/components/Scan_and_mark/ScanAndWrapper_component';

interface ScanAndMarkWrapperProps {
  homework_type: 'onetime' | 'class';
}

export function ScanAndMarkWrapper({ homework_type }: ScanAndMarkWrapperProps) {
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
      <div>
        {renderScanHomework()}

        <div className="flex justify-end mt-4">
          <UploadButton homework_type={homework_type} />
        </div>
      </div>
    </div>
  );
}
