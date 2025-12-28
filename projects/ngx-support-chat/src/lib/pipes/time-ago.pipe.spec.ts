import { TimeAgoPipe } from './time-ago.pipe';

describe('TimeAgoPipe', () => {
  let pipe: TimeAgoPipe;

  beforeEach(() => {
    pipe = new TimeAgoPipe();
    // Reset time mocking before each test
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('edge cases', () => {
    it('should return empty string for null', () => {
      expect(pipe.transform(null)).toBe('');
    });

    it('should return empty string for undefined', () => {
      expect(pipe.transform(undefined)).toBe('');
    });

    it('should return empty string for invalid date string', () => {
      expect(pipe.transform('not-a-date')).toBe('');
    });

    it('should return empty string for empty string', () => {
      expect(pipe.transform('')).toBe('');
    });
  });

  describe('relative time display', () => {
    beforeEach(() => {
      // Fix the current time for consistent testing
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-12-28T14:00:00Z'));
    });

    it('should display "Just now" for times within 60 seconds', () => {
      const date = new Date('2025-12-28T13:59:30Z'); // 30 seconds ago
      expect(pipe.transform(date)).toBe('Just now');
    });

    it('should display "1 minute ago" for 1 minute', () => {
      const date = new Date('2025-12-28T13:59:00Z'); // 1 minute ago
      expect(pipe.transform(date)).toBe('1 minute ago');
    });

    it('should display "X minutes ago" for multiple minutes', () => {
      const date = new Date('2025-12-28T13:45:00Z'); // 15 minutes ago
      expect(pipe.transform(date)).toBe('15 minutes ago');
    });

    it('should display "1 hour ago" for 1 hour', () => {
      const date = new Date('2025-12-28T13:00:00Z'); // 1 hour ago
      expect(pipe.transform(date)).toBe('1 hour ago');
    });

    it('should display "X hours ago" for multiple hours', () => {
      const date = new Date('2025-12-28T11:00:00Z'); // 3 hours ago
      expect(pipe.transform(date)).toBe('3 hours ago');
    });

    it('should display formatted time for dates older than 24 hours', () => {
      const date = new Date('2025-12-27T10:00:00Z'); // Yesterday
      // getRelativeTime falls back to HH:mm format in local timezone
      // We can't predict the exact time due to timezone differences
      // So we just verify it's a time format (not a relative format)
      const result = pipe.transform(date);
      expect(result).toMatch(/^\d{1,2}:\d{2}$/);
    });
  });

  describe('date string parsing', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-12-28T14:00:00Z'));
    });

    it('should parse ISO date strings', () => {
      const result = pipe.transform('2025-12-28T13:59:00Z');
      expect(result).toBe('1 minute ago');
    });

    it('should parse date strings with timezone', () => {
      const result = pipe.transform('2025-12-28T13:55:00.000Z');
      expect(result).toBe('5 minutes ago');
    });
  });

  describe('Date object handling', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-12-28T14:00:00Z'));
    });

    it('should accept Date objects', () => {
      const date = new Date('2025-12-28T13:50:00Z');
      expect(pipe.transform(date)).toBe('10 minutes ago');
    });
  });

  describe('caching behavior', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-12-28T14:00:00Z'));
    });

    it('should cache results for the same date', () => {
      const date = new Date('2025-12-28T13:55:00Z');

      const result1 = pipe.transform(date);
      const result2 = pipe.transform(date);

      expect(result1).toBe(result2);
      expect(result1).toBe('5 minutes ago');
    });

    it('should update results when date changes', () => {
      const date1 = new Date('2025-12-28T13:55:00Z');
      const date2 = new Date('2025-12-28T13:50:00Z');

      expect(pipe.transform(date1)).toBe('5 minutes ago');
      expect(pipe.transform(date2)).toBe('10 minutes ago');
    });

    it('should update after threshold time passes', () => {
      // Start with a date 55 seconds in the past
      const date = new Date('2025-12-28T13:59:05Z');

      // First call - 55 seconds ago = "Just now"
      expect(pipe.transform(date)).toBe('Just now');

      // Advance system time by 10 seconds (now 65 seconds ago)
      vi.setSystemTime(new Date('2025-12-28T14:00:10Z'));

      // Force cache invalidation by advancing past threshold
      // The pipe should now return "1 minute ago"
      expect(pipe.transform(date)).toBe('1 minute ago');
    });
  });

  describe('impure pipe behavior', () => {
    it('should be marked as impure', () => {
      // The pipe decorator sets pure: false
      // We verify by checking the pipe works with changing time values
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-12-28T14:00:00Z'));

      // Date 55 seconds in the past
      const date = new Date('2025-12-28T13:59:05Z');
      expect(pipe.transform(date)).toBe('Just now');

      // Advance system time by 10 seconds (now 65 seconds ago)
      vi.setSystemTime(new Date('2025-12-28T14:00:10Z'));

      // The pipe should now return "1 minute ago"
      expect(pipe.transform(date)).toBe('1 minute ago');
    });
  });

  describe('boundary conditions', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-12-28T14:00:00Z'));
    });

    it('should handle exactly 59 seconds as "Just now"', () => {
      const date = new Date('2025-12-28T13:59:01Z'); // 59 seconds ago
      expect(pipe.transform(date)).toBe('Just now');
    });

    it('should handle exactly 60 seconds as "1 minute ago"', () => {
      const date = new Date('2025-12-28T13:59:00Z'); // 60 seconds ago
      expect(pipe.transform(date)).toBe('1 minute ago');
    });

    it('should handle exactly 59 minutes as "59 minutes ago"', () => {
      const date = new Date('2025-12-28T13:01:00Z'); // 59 minutes ago
      expect(pipe.transform(date)).toBe('59 minutes ago');
    });

    it('should handle exactly 60 minutes as "1 hour ago"', () => {
      const date = new Date('2025-12-28T13:00:00Z'); // 60 minutes ago
      expect(pipe.transform(date)).toBe('1 hour ago');
    });

    it('should handle exactly 23 hours as "23 hours ago"', () => {
      const date = new Date('2025-12-27T15:00:00Z'); // 23 hours ago
      expect(pipe.transform(date)).toBe('23 hours ago');
    });
  });
});
