
import { describe, it, expect } from 'vitest';
import { getInitials, formatDate, formatTime, formatDueDate, getEffectiveDueDate } from '@/lib/utils';

describe('lib/utils', () => {
  describe('getInitials', () => {
    it('should return the initials of a name', () => {
      expect(getInitials('John Doe')).toBe('JD');
    });

    it('should return a single initial for a single name', () => {
      expect(getInitials('John')).toBe('J');
    });

    it('should handle multiple spaces between names', () => {
      expect(getInitials('John  Doe')).toBe('JD');
    });

    it('should return an empty string for an empty name', () => {
      expect(getInitials('')).toBe('');
    });
  });

  describe('formatDate', () => {
    it('should format a date string', () => {
      expect(formatDate('2024-01-01T12:00:00.000Z')).toBe('Jan 1, 2024');
    });

    it('should return an empty string for an empty date string', () => {
      expect(formatDate('')).toBe('');
    });
  });

  describe('formatTime', () => {
    it('should format a time string', () => {
      expect(formatTime('13:00')).toBe('1:00 PM');
    });

    it('should return an empty string for an empty time string', () => {
      expect(formatTime('')).toBe('');
    });
  });

  describe('formatDueDate', () => {
    it('should format a due date', () => {
        const today = new Date();
        const todayString = today.toISOString();
        const formatted = formatDueDate(todayString);
        expect(formatted?.text).toBe(`Due: ${formatDate(todayString)}`);
    });

    it('should return null for a null due date', () => {
        expect(formatDueDate(null)).toBeNull();
    });

    it('should identify a due date as urgent if it is today', () => {
        const today = new Date().toISOString();
        const formatted = formatDueDate(today);
        expect(formatted?.isUrgent).toBe(true);
        expect(formatted?.isToday).toBe(true);
    });

    it('should identify a due date as urgent if it is tomorrow', () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const formatted = formatDueDate(tomorrow.toISOString());
        expect(formatted?.isUrgent).toBe(true);
        expect(formatted?.isTomorrow).toBe(true);
    });
  });

  describe('getEffectiveDueDate', () => {
    it('should return endAt when it exists', () => {
        const task = { endAt: '2024-01-01', dueDate: '2024-01-02' };
        expect(getEffectiveDueDate(task)).toBe('2024-01-01');
    });

    it('should return dueDate when endAt does not exist', () => {
        const task = { dueDate: '2024-01-02' };
        expect(getEffectiveDueDate(task)).toBe('2024-01-02');
    });

    it('should return undefined when neither endAt nor dueDate exist', () => {
        const task = {};
        expect(getEffectiveDueDate(task)).toBeUndefined();
    });
  });
});
