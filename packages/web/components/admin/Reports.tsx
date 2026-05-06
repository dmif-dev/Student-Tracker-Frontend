'use client';
import { useState, useEffect } from 'react';
import { ReportService, ScheduledReport } from '@/services/reportApiService';
import { toast } from 'react-hot-toast';

export default function ScheduledReportsList() {
  const [schedules, setSchedules] = useState<ScheduledReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const data = await ReportService.getScheduledReports();
      setSchedules(data);
    } catch (error) {
      toast.error("Failed to load scheduled reports");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return;
    
    try {
      await ReportService.deleteScheduledReport(id);
      setSchedules(schedules.filter(s => s.id !== id));
      toast.success("Schedule deleted successfully");
    } catch (error) {
      toast.error("Failed to delete schedule");
    }
  };

  const toggleStatus = async (report: ScheduledReport) => {
    try {
      const updated = await ReportService.updateScheduledReport(report.id, {
        isActive: !report.isActive 
      });
      setSchedules(schedules.map(s => s.id === report.id ? updated : s));
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  if (loading) return <div>Loading schedules...</div>;

  return (
    <div className="bg-white rounded-lg shadow">
      {schedules.map((schedule) => (
        <div key={schedule.id} className="p-4 border-b flex justify-between items-center">
          <div>
            <h4 className="font-medium">{schedule.title}</h4>
            <p className="text-sm text-gray-500">Frequency: {schedule.schedule}</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => toggleStatus(schedule)}
              className={`px-3 py-1 rounded ${schedule.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}
            >
              {schedule.isActive ? 'Active' : 'Paused'}
            </button>
            <button 
              onClick={() => handleDelete(schedule.id)}
              className="text-red-600 hover:bg-red-50 p-2 rounded"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}