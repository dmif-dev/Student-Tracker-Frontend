import { useMemo } from 'react';
import { WeekService } from '../services/WeekService';

export function useWeekCalculation(date?: Date) {
    return useMemo(() => {
        return date ? WeekService.isDateInCurrentWeek(date) : WeekService.getCurrentWeek();
    }, [date]);
}
