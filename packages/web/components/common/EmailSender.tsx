'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Send, CheckCircle, AlertCircle, BookOpen, Clock, Video, AlertTriangle } from 'lucide-react';
import LoaderOne from '@/components/ui/loader-one';

type TemplateType = 'ASSIGNMENT' | 'TEST' | 'MEETING' | 'WARNING';

export default function EmailSender() {
  const [template, setTemplate] = useState<TemplateType>('ASSIGNMENT');
  const [emailData, setEmailData] = useState({
    recipient: '',
    subject: '',
    studentName: '',
    courseName: '',
    link: '', // Used for meeting links or submission links
    remarks: '',
  });

  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [messageText, setMessageText] = useState('');

  // Update default subjects when template changes
  useEffect(() => {
    const subjects: Record<TemplateType, string> = {
      ASSIGNMENT: 'Assignment Submission Confirmation',
      TEST: 'Upcoming Test Details',
      MEETING: 'Daily Progress Meeting Link',
      WARNING: 'Urgent: Academic Performance Warning'
    };
    setEmailData(prev => ({ ...prev, subject: subjects[template] }));
  }, [template]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEmailData({ ...emailData, [e.target.name]: e.target.value });
  };

  const sendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    try {
      const response = await fetch('http://localhost:4000/api/email/send-academic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailData.recipient,
          templateType: template,
          payload: emailData // Send the whole object to be handled by EJS
        }),
      });

      const result = await response.json();
      if (result.success) {
        setStatus('success');
        setMessageText(`${template} email sent successfully!`);
        setEmailData(prev => ({ ...prev, recipient: '', remarks: '', link: '' }));
      } else {
        setStatus('error');
        setMessageText(result.message || 'Failed to send.');
      }
    } catch (error) {
      setStatus('error');
      setMessageText('Backend connection failed.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-8 bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-neutral-800">
      {/* Header with Dynamic Icon */}
      <div className="bg-slate-900 p-8 text-white relative">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white m-0">Academic Dispatcher</h2>
            <p className="text-slate-400 text-sm mt-1 mb-0">Automated Student Communication via SMTP2GO</p>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
            {template === 'ASSIGNMENT' && <BookOpen className="w-6 h-6 text-blue-400" />}
            {template === 'TEST' && <Clock className="w-6 h-6 text-purple-400" />}
            {template === 'MEETING' && <Video className="w-6 h-6 text-green-400" />}
            {template === 'WARNING' && <AlertTriangle className="w-6 h-6 text-red-400" />}
          </div>
        </div>

        {/* Template Selector Tabs */}
        <div className="flex gap-2 mt-8 overflow-x-auto pb-2">
          {(['ASSIGNMENT', 'TEST', 'MEETING', 'WARNING'] as TemplateType[]).map((t) => (
            <button
              key={t}
              onClick={() => setTemplate(t)}
              type="button"
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                template === t ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={sendEmail} className="p-8 space-y-5">
        {status === 'success' && (
          <div className="p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{messageText}</span>
          </div>
        )}

        {status === 'error' && (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{messageText}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500">Student Name</label>
            <input name="studentName" value={emailData.studentName} onChange={handleChange} className="modern-input" placeholder="Student Name" required />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500">Recipient Email</label>
            <input type="email" name="recipient" value={emailData.recipient} onChange={handleChange} className="modern-input" placeholder="student@university.com" required />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500">Subject</label>
          <input name="subject" value={emailData.subject} onChange={handleChange} className="modern-input" required />
        </div>

        {/* Optional fields for layouts */}
        {(template === 'MEETING' || template === 'ASSIGNMENT') && (
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500">
              {template === 'MEETING' ? 'Google Meet / Zoom Link' : 'Course Name / Subject'}
            </label>
            <input name="link" value={emailData.link} onChange={handleChange} className="modern-input" placeholder="https://..." required />
          </div>
        )}

        {template === 'WARNING' && (
           <div className="space-y-1">
             <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500">Course / Subject Name</label>
             <input name="courseName" value={emailData.courseName} onChange={handleChange} className="modern-input" placeholder="Course title" required />
           </div>
        )}

        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500">Remarks / Attendance Percentage</label>
          <textarea
            name="remarks"
            value={emailData.remarks}
            onChange={handleChange}
            rows={3}
            className="modern-input py-3 resize-none"
            placeholder={template === 'WARNING' ? 'Set approximate attendance e.g. 64' : 'Enter additional notes...'}
            required
          />
        </div>

        <button
          type="submit"
          disabled={status === 'sending'}
          className={`w-full h-14 rounded-2xl text-white font-bold flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-black/10 ${
            template === 'WARNING' ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-900 hover:bg-black'
          }`}
        >
          {status === 'sending' ? (
            <span className="scale-75"><LoaderOne /></span>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Send {template.toLowerCase()} Mail</span>
            </>
          )}
        </button>
      </form>

      <style jsx>{`
        .modern-input {
          width: 100%;
          height: 3rem;
          padding: 0 1rem;
          border-radius: 0.75rem;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        .modern-input:focus {
          outline: none;
          border-color: #f97316;
          background: white;
          box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.1);
        }
      `}</style>
    </div>
  );
}
