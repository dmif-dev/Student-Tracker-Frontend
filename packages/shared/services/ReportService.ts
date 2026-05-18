import { DailyProgress } from '../models/DailyProgress';
import { WeeklyReport } from '../models/WeeklyReport';
import { generateWeeklySummary } from '../utils/reportUtils';

//export class ReportService {

const API_URL = 'http://localhost:3001/api';

export const reportService = {
  // Call to API GET /scheduled

  getSchedules: async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/reports/scheduled`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  // Call to API POST /schedule
  createSchedule: async (data: any) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/reports/schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Call DELETE /scheduled/:id
  deleteSchedule: async (id: string) => {
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/reports/scheduled/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }
};
//}
