'use client';

import React from 'react';
import { AIMarking } from '@/components/Scan_and_mark/Result/AIMarking';

export function ResultDummy() {
  return (
    <div className="space-y-6 h-[80vh]">
      <AIMarking />
    </div>
  );
}
