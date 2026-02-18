import { getWeekRange } from '../utils/dateUtils';

export class WeekService {
    static getCurrentWeek() {
        return getWeekRange(new Date());
    }

    static getNextWeek() {
        const nextWeekDate = new Date();
        nextWeekDate.setDate(nextWeekDate.getDate() + 7);
        return getWeekRange(nextWeekDate);
    }

    static isDateInCurrentWeek(date: Date): boolean {
        const { start, end } = this.getCurrentWeek();
        return date >= start && date <= end;
    }
}
