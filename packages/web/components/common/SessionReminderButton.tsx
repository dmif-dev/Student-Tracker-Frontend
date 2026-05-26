'use client';

import React, { useState } from 'react';
import { Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import LoaderOne from '@/components/ui/loader-one';

export default function SessionReminderButton() {
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error' | ''>('');

  const handleSendReminder = async () => {
    setLoading(true);
    setStatusMessage('Sending session confirmation...');
    setStatusType('');

    // Mock session data
    const sessionData = {
      recipientEmail: 'sanganisathwik26@gmail.com', // Target address for tests
      studentName: 'Sathwik',
      mentorName: 'Dr. Smith',
      sessionTopic: 'React & Node.js Advanced Architecture',
      dateTime: 'Oct 24, 2026 at 04:00 PM'
    };

    try {
      const response = await fetch('http://localhost:4000/api/email/notify-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData),
      });

      const result = await response.json();

      if (result.success) {
        setStatusType('success');
        setStatusMessage('Notification Sent! Check your Student inbox.');
      } else {
        setStatusType('error');
        setStatusMessage('Session booked, but we had trouble sending email.');
      }
    } catch (error) {
      console.error('Session notify error:', error);
      setStatusType('error');
      setStatusMessage('Network Error. Is the Backend Server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 bg-white dark:bg-neutral-900 rounded-3xl shadow-xl border border-gray-100 dark:border-neutral-800 p-6 flex flex-col items-center">
      <div className="text-center mb-6">
        <p className="text-xs font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest mb-1">Upcoming Session Booking</p>
        <h2 className="text-xl font-bold font-montserrat text-gray-900 dark:text-white">React & Node.js</h2>
      </div>

      <button 
        onClick={handleSendReminder} 
        disabled={loading}
        className="w-full h-12 bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white font-bold rounded-xl shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:pointer-events-none mb-4 font-montserrat"
      >
        {loading ? (
          <>
            <span className="scale-75 mr-2"><LoaderOne /></span>
            <span>Configuring...</span>
          </>
        ) : (
          <>
            <Calendar className="w-4 h-4" />
            <span>Send Session Reminder</span>
          </>
        )}
      </button>

      {statusMessage && (
        <div className={`w-full p-3 rounded-xl flex items-center gap-2 text-sm ${
          statusType === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 
          statusType === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-gray-50 text-gray-600'
        }`}>
          {statusType === 'success' && <CheckCircle className="w-4 h-4 flex-shrink-0" />}
          {statusType === 'error' && <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          <span>{statusMessage}</span>
        </div>
      )}
    </div>
  );
}
