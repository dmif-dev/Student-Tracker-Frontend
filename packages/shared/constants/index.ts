// ─── Date / Time ─────────────────────────────────────────────────────────────
export const DATE_FORMAT = 'YYYY-MM-DD' as const;
export const TIME_FORMAT = 'HH:mm' as const;

// ─── Roles ────────────────────────────────────────────────────────────────────
export const ROLES = {
    ADMIN: 'admin',
    TEACHER: 'teacher',
    PARENT: 'parent',
    STUDENT: 'student',
} as const;

// ─── Attendance ───────────────────────────────────────────────────────────────
export const ATTENDANCE_STATUS = {
    PRESENT: 'present',
    ABSENT: 'absent',
    LATE: 'late',
} as const;

// ─── Pagination ───────────────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 10;
