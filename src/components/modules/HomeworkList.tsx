'use client';

import React from 'react';
import { BookOpen, Clock, CheckCircle, Upload } from 'lucide-react';

export function HomeworkList() {
  const glassStyle = {
    backdropFilter: 'blur(16px)',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)'
  };

  return (
    <div className="space-y-6">
      {/* Content */}
      <div className="rounded-2xl p-6 shadow-xl" style={glassStyle}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl text-gray-800">My Homework</h2>
            <p className="text-sm text-gray-600">View and submit your homework assignments</p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-sm text-yellow-800">
            This module is currently under development. Features coming soon:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-yellow-700">
            <li>• View assigned homework from your teachers</li>
            <li>• Track due dates and submission status</li>
            <li>• Upload completed homework</li>
            <li>• View feedback and marks</li>
          </ul>
        </div>

        {/* Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <Clock className="w-8 h-8 text-blue-500 mb-2" />
            <h3 className="text-gray-800 font-medium">Due Soon</h3>
            <p className="text-sm text-gray-600">Upcoming deadlines</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <Upload className="w-8 h-8 text-purple-500 mb-2" />
            <h3 className="text-gray-800 font-medium">Submit</h3>
            <p className="text-sm text-gray-600">Upload your work</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <CheckCircle className="w-8 h-8 text-teal-500 mb-2" />
            <h3 className="text-gray-800 font-medium">Completed</h3>
            <p className="text-sm text-gray-600">Past submissions</p>
          </div>
        </div>
      </div>
    </div>
  );
}
