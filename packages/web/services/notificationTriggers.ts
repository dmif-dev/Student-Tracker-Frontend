// packages/web/services/notificationTriggers.ts

import { NotificationService } from '@student-tracker/shared/services/NotificationService';

// Trigger when new student registers
export const onStudentRegistered = async (student: any) => {
  await NotificationService.addNotification({
    userId: 'admin',
    type: 'info',
    category: 'student',
    title: 'New Student Registered',
    message: `${student.name} has registered for ${student.program}`,
    actionUrl: `/admin/students/${student.id}`,
    actionText: 'View Student',
    metadata: {
      entityId: student.id,
      entityType: 'student',
    },
  });
};

// Trigger when mentor session needs rescheduling
export const onSessionRescheduleNeeded = async (session: any) => {
  await NotificationService.addNotification({
    userId: 'admin',
    type: 'warning',
    category: 'session',
    title: 'Session Needs Rescheduling',
    message: `${session.studentName}'s session with ${session.mentorName} needs rescheduling`,
    actionUrl: `/admin/mentors/${session.mentorId}/schedule`,
    actionText: 'View Schedule',
    metadata: {
      entityId: session.id,
      entityType: 'session',
      priority: 'high',
    },
  });
};

// Trigger when student achieves outcome
export const onOutcomeAchieved = async (outcome: any) => {
  await NotificationService.addNotification({
    userId: 'admin',
    type: 'success',
    category: 'report',
    title: 'New Outcome Achieved',
    message: `${outcome.studentName} filed a ${outcome.type}`,
    actionUrl: `/admin/outcomes/${outcome.id}`,
    actionText: 'View Outcome',
    metadata: {
      entityId: outcome.id,
      entityType: 'outcome',
    },
  });
};

// Trigger for weekly report generation
export const onWeeklyReportGenerated = async (report: any) => {
  await NotificationService.addNotification({
    userId: 'admin',
    type: 'info',
    category: 'report',
    title: 'Weekly Report Ready',
    message: `Week ${report.week} report has been generated`,
    actionUrl: `/admin/reports/${report.id}`,
    actionText: 'View Report',
  });
};