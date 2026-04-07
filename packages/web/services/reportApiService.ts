import { ApiService } from './api';

export interface ScheduledReport {
  id: string;
  title: string;
  reportType: 'weekly' | 'monthly' | 'custom';
  schedule: string; // Cron expression or frequency
  recipients: string[];
  lastRun?: string;
  nextRun?: string;
  isActive: boolean;
}

export const ReportService = {
  // POST /api/reports/schedule
  scheduleReport: async (reportData: Partial<ScheduledReport>): Promise<ScheduledReport> => {
    try {
      const response = await ApiService.post('/reports/schedule', reportData);
      return response.data;
    } catch (error) {
      console.error("Error scheduling report:", error);
      throw error;
    }
  },

  // GET /api/reports/scheduled
  getScheduledReports: async (): Promise<ScheduledReport[]> => {
    try {
      const response = await ApiService.get('/reports/scheduled');
      // The backend often returns an array or an object { reports: [] }
      // Ensure you return the actual data array
      return response.data;
    } catch (error) {
      console.error("Error fetching scheduled reports:", error);
      return []; // Return empty array on error to prevent UI crashes
    }
  },

  // PUT /api/reports/scheduled/:id
  updateScheduledReport: async (id: string, updates: Partial<ScheduledReport>): Promise<ScheduledReport> => {
    try {
      const response = await ApiService.put(`/reports/scheduled/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error(`Error updating report ${id}:`, error);
      throw error;
    }
  },

  // DELETE /api/reports/scheduled/:id
  deleteScheduledReport: async (id: string): Promise<{ success: boolean }> => {
    try {
      const response = await ApiService.delete(`/reports/scheduled/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting report ${id}:`, error);
      throw error;
    }
  }
};