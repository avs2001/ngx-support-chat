import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

import {
  isToday,
  isYesterday,
  isSameDay,
  formatDate,
  formatTime,
  getRelativeTime,
  startOfDay,
  getTimeDifferenceMs
} from './date-helpers.util';

describe('date-helpers.util', () => {
  describe('isToday', () => {
    it('should return true for today', () => {
      const today = new Date();
      expect(isToday(today)).toBe(true);
    });

    it('should return true for earlier today', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      expect(isToday(today)).toBe(true);
    });

    it('should return true for later today', () => {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      expect(isToday(today)).toBe(true);
    });

    it('should return false for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(yesterday)).toBe(false);
    });

    it('should return false for tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isToday(tomorrow)).toBe(false);
    });
  });

  describe('isYesterday', () => {
    it('should return true for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isYesterday(yesterday)).toBe(true);
    });

    it('should return false for today', () => {
      const today = new Date();
      expect(isYesterday(today)).toBe(false);
    });

    it('should return false for two days ago', () => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      expect(isYesterday(twoDaysAgo)).toBe(false);
    });
  });

  describe('isSameDay', () => {
    it('should return true for same day different times', () => {
      const date1 = new Date(2025, 5, 15, 10, 30);
      const date2 = new Date(2025, 5, 15, 22, 45);
      expect(isSameDay(date1, date2)).toBe(true);
    });

    it('should return false for different days', () => {
      const date1 = new Date(2025, 5, 15);
      const date2 = new Date(2025, 5, 16);
      expect(isSameDay(date1, date2)).toBe(false);
    });

    it('should return false for same day different months', () => {
      const date1 = new Date(2025, 5, 15);
      const date2 = new Date(2025, 6, 15);
      expect(isSameDay(date1, date2)).toBe(false);
    });

    it('should return false for same day different years', () => {
      const date1 = new Date(2025, 5, 15);
      const date2 = new Date(2024, 5, 15);
      expect(isSameDay(date1, date2)).toBe(false);
    });
  });

  describe('formatDate', () => {
    const testDate = new Date(2025, 11, 28); // December 28, 2025 (Sunday)

    it('should format yyyy', () => {
      expect(formatDate(testDate, 'yyyy')).toBe('2025');
    });

    it('should format MM with leading zero', () => {
      const jan = new Date(2025, 0, 15);
      expect(formatDate(jan, 'MM')).toBe('01');
      expect(formatDate(testDate, 'MM')).toBe('12');
    });

    it('should format M without leading zero', () => {
      const jan = new Date(2025, 0, 15);
      expect(formatDate(jan, 'M')).toBe('1');
    });

    it('should format dd with leading zero', () => {
      const fifth = new Date(2025, 5, 5);
      expect(formatDate(fifth, 'dd')).toBe('05');
      expect(formatDate(testDate, 'dd')).toBe('28');
    });

    it('should format d without leading zero', () => {
      const fifth = new Date(2025, 5, 5);
      expect(formatDate(fifth, 'd')).toBe('5');
    });

    it('should format MMMM full month name', () => {
      expect(formatDate(testDate, 'MMMM')).toBe('December');
    });

    it('should format MMM short month name', () => {
      expect(formatDate(testDate, 'MMM')).toBe('Dec');
    });

    it('should format EEEE full day name', () => {
      expect(formatDate(testDate, 'EEEE')).toBe('Sunday');
    });

    it('should format EEE short day name', () => {
      expect(formatDate(testDate, 'EEE')).toBe('Sun');
    });

    it('should format complex patterns', () => {
      expect(formatDate(testDate, 'MMMM d, yyyy')).toBe('December 28, 2025');
      expect(formatDate(testDate, 'EEE, MMM d')).toBe('Sun, Dec 28');
    });
  });

  describe('formatTime', () => {
    const morningTime = new Date(2025, 5, 15, 9, 5, 3);
    const afternoonTime = new Date(2025, 5, 15, 14, 30, 45);
    const midnight = new Date(2025, 5, 15, 0, 0, 0);
    const noon = new Date(2025, 5, 15, 12, 0, 0);

    it('should format HH 24-hour with leading zero', () => {
      expect(formatTime(morningTime, 'HH')).toBe('09');
      expect(formatTime(afternoonTime, 'HH')).toBe('14');
    });

    it('should format H 24-hour without leading zero', () => {
      expect(formatTime(morningTime, 'H')).toBe('9');
      expect(formatTime(afternoonTime, 'H')).toBe('14');
    });

    it('should format hh 12-hour with leading zero', () => {
      expect(formatTime(morningTime, 'hh')).toBe('09');
      expect(formatTime(afternoonTime, 'hh')).toBe('02');
    });

    it('should format h 12-hour without leading zero', () => {
      expect(formatTime(afternoonTime, 'h')).toBe('2');
    });

    it('should format mm minutes with leading zero', () => {
      expect(formatTime(morningTime, 'mm')).toBe('05');
      expect(formatTime(afternoonTime, 'mm')).toBe('30');
    });

    it('should format m minutes without leading zero', () => {
      expect(formatTime(morningTime, 'm')).toBe('5');
    });

    it('should format ss seconds with leading zero', () => {
      expect(formatTime(morningTime, 'ss')).toBe('03');
    });

    it('should format a AM/PM', () => {
      expect(formatTime(morningTime, 'a')).toBe('AM');
      expect(formatTime(afternoonTime, 'a')).toBe('PM');
    });

    it('should handle midnight as 12 AM', () => {
      expect(formatTime(midnight, 'h:mm a')).toBe('12:00 AM');
    });

    it('should handle noon as 12 PM', () => {
      expect(formatTime(noon, 'h:mm a')).toBe('12:00 PM');
    });

    it('should format complex patterns', () => {
      expect(formatTime(afternoonTime, 'HH:mm')).toBe('14:30');
      expect(formatTime(afternoonTime, 'h:mm a')).toBe('2:30 PM');
    });
  });

  describe('getRelativeTime', () => {
    const now = new Date(2025, 5, 15, 12, 0, 0);

    it('should return "Just now" for less than 60 seconds', () => {
      const date = new Date(now.getTime() - 30 * 1000);
      expect(getRelativeTime(date, now)).toBe('Just now');
    });

    it('should return "1 minute ago" for 60 seconds', () => {
      const date = new Date(now.getTime() - 60 * 1000);
      expect(getRelativeTime(date, now)).toBe('1 minute ago');
    });

    it('should return plural minutes for multiple minutes', () => {
      const date = new Date(now.getTime() - 5 * 60 * 1000);
      expect(getRelativeTime(date, now)).toBe('5 minutes ago');
    });

    it('should return "1 hour ago" for 60 minutes', () => {
      const date = new Date(now.getTime() - 60 * 60 * 1000);
      expect(getRelativeTime(date, now)).toBe('1 hour ago');
    });

    it('should return plural hours for multiple hours', () => {
      const date = new Date(now.getTime() - 3 * 60 * 60 * 1000);
      expect(getRelativeTime(date, now)).toBe('3 hours ago');
    });

    it('should return formatted time for 24+ hours', () => {
      const date = new Date(now.getTime() - 25 * 60 * 60 * 1000);
      expect(getRelativeTime(date, now)).toBe('11:00');
    });
  });

  describe('startOfDay', () => {
    it('should return midnight of the same day', () => {
      const date = new Date(2025, 5, 15, 14, 30, 45, 123);
      const result = startOfDay(date);

      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(5);
      expect(result.getDate()).toBe(15);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });

    it('should not mutate the original date', () => {
      const original = new Date(2025, 5, 15, 14, 30);
      startOfDay(original);
      expect(original.getHours()).toBe(14);
    });
  });

  describe('getTimeDifferenceMs', () => {
    it('should return positive difference', () => {
      const date1 = new Date(2025, 5, 15, 12, 0);
      const date2 = new Date(2025, 5, 15, 12, 5);
      expect(getTimeDifferenceMs(date1, date2)).toBe(5 * 60 * 1000);
    });

    it('should return absolute value regardless of order', () => {
      const date1 = new Date(2025, 5, 15, 12, 0);
      const date2 = new Date(2025, 5, 15, 12, 5);
      expect(getTimeDifferenceMs(date1, date2)).toBe(getTimeDifferenceMs(date2, date1));
    });

    it('should return 0 for same time', () => {
      const date = new Date(2025, 5, 15, 12, 0);
      expect(getTimeDifferenceMs(date, new Date(date))).toBe(0);
    });
  });
});
