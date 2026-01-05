'use client';

import React from 'react';
import { FilePlus, Users, Calendar, Send } from 'lucide-react';

export function AssignHomework() {
  const glassStyle = {
    backdropFilter: 'blur(16px)',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent">
          Assign Homework
        </h1>
        <p className="text-gray-600 mt-1">Create and assign homework to students</p>
      </div>

      {/* Content */}
      <div className="rounded-2xl p-6 shadow-xl" style={glassStyle}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-teal-500 rounded-xl flex items-center justify-center">
            <FilePlus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl text-gray-800">Homework Assignment</h2>
            <p className="text-sm text-gray-600">Easily distribute homework to your classes</p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-sm text-yellow-800">
            This module is currently under development. Features coming soon:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-yellow-700">
            <li>• Create custom homework assignments</li>
            <li>• Assign to specific classes or students</li>
            <li>• Set deadlines and priorities</li>
            <li>• Track completion status</li>
          </ul>
        </div>

        {/* Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <Users className="w-8 h-8 text-purple-500 mb-2" />
            <h3 className="text-gray-800 font-medium">Students</h3>
            <p className="text-sm text-gray-600">Manage student lists</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <Calendar className="w-8 h-8 text-teal-500 mb-2" />
            <h3 className="text-gray-800 font-medium">Schedule</h3>
            <p className="text-sm text-gray-600">Set due dates</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <Send className="w-8 h-8 text-blue-500 mb-2" />
            <h3 className="text-gray-800 font-medium">Distribute</h3>
            <p className="text-sm text-gray-600">Send assignments</p>
          </div>
        </div>
      </div>
    </div>
  );
}
