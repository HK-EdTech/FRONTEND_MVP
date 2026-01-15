'use client';

import React from 'react';
import { Calendar as CalendarIcon, Clock, Bell, List } from 'lucide-react';

export function CalendarModule() {
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
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-teal-500 rounded-xl flex items-center justify-center">
            <CalendarIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl text-gray-800">Class Calendar</h2>
            <p className="text-sm text-gray-600">Stay organized with your teaching schedule</p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-sm text-yellow-800">
            This module is currently under development. Features coming soon:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-yellow-700">
            <li>• View monthly and weekly schedules</li>
            <li>• Track homework deadlines</li>
            <li>• Schedule class events</li>
            <li>• Set reminders and notifications</li>
          </ul>
        </div>

        {/* Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <CalendarIcon className="w-8 h-8 text-purple-500 mb-2" />
            <h3 className="text-gray-800 font-medium">Schedule</h3>
            <p className="text-sm text-gray-600">View class timetable</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <Clock className="w-8 h-8 text-teal-500 mb-2" />
            <h3 className="text-gray-800 font-medium">Deadlines</h3>
            <p className="text-sm text-gray-600">Track due dates</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <Bell className="w-8 h-8 text-blue-500 mb-2" />
            <h3 className="text-gray-800 font-medium">Reminders</h3>
            <p className="text-sm text-gray-600">Get notifications</p>
          </div>
        </div>
      </div>
    </div>
  );
}
