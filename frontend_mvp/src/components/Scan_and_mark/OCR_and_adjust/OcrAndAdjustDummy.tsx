'use client';

import React from 'react';
import { OCRAdjust } from '@/components/Scan_and_mark/OCR_and_adjust/OCRAdjust';

export function OcrAndAdjustDummy() {
  return (
    <div>
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white/60 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">OCR & Adjust (Dummy)</h2>
        <p className="mt-2 text-sm text-gray-600">
          This is a placeholder for the OCR and adjustment workflow.
        </p>
      </div>
      <OCRAdjust />
    </div>
  );
}
