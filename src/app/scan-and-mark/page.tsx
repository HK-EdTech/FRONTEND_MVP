'use client';

import { ScanAndMark } from '@/components/Scan_and_mark/ScanAndMark';
import { HomeworkCriteria_OnetimeUpload } from '@/components/Scan_and_mark/homeworkCriteria/HomeworkCriteria_OnetimeUpload';

export default function ScanAndMarkPage() {
  return <ScanAndMark HomeworkCriteria={HomeworkCriteria_OnetimeUpload} />;
}
