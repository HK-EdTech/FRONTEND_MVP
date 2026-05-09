'use client';

import React from 'react';
import { AIMarking } from '@/components/Scan_and_mark/Result/AIMarking';

export function ResultDummy() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white/60 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Result (Dummy)</h2>
        <p className="mt-2 text-sm text-gray-600">
          This is a placeholder for the final result view.
        </p>
      </div>
      <div className='h-[80vh]'>
        <AIMarking />
      </div>
    </div>
  );
}
