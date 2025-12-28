import { FileSizePipe } from './file-size.pipe';

describe('FileSizePipe', () => {
  let pipe: FileSizePipe;

  beforeEach(() => {
    pipe = new FileSizePipe();
  });

  describe('edge cases', () => {
    it('should return "0 B" for null', () => {
      expect(pipe.transform(null)).toBe('0 B');
    });

    it('should return "0 B" for undefined', () => {
      expect(pipe.transform(undefined)).toBe('0 B');
    });

    it('should return "0 B" for zero', () => {
      expect(pipe.transform(0)).toBe('0 B');
    });

    it('should return "0 B" for negative values', () => {
      expect(pipe.transform(-1024)).toBe('0 B');
    });
  });

  describe('bytes (B)', () => {
    it('should format 1 byte', () => {
      expect(pipe.transform(1)).toBe('1 B');
    });

    it('should format 500 bytes', () => {
      expect(pipe.transform(500)).toBe('500 B');
    });

    it('should format 1023 bytes', () => {
      expect(pipe.transform(1023)).toBe('1023 B');
    });
  });

  describe('kilobytes (KB)', () => {
    it('should format exactly 1 KB', () => {
      expect(pipe.transform(1024)).toBe('1 KB');
    });

    it('should format 1.5 KB', () => {
      expect(pipe.transform(1536)).toBe('1.5 KB');
    });

    it('should format 10 KB', () => {
      expect(pipe.transform(10240)).toBe('10 KB');
    });

    it('should format 1023 KB', () => {
      expect(pipe.transform(1047552)).toBe('1023 KB');
    });
  });

  describe('megabytes (MB)', () => {
    it('should format exactly 1 MB', () => {
      expect(pipe.transform(1048576)).toBe('1 MB');
    });

    it('should format 1.5 MB', () => {
      expect(pipe.transform(1572864)).toBe('1.5 MB');
    });

    it('should format 100 MB', () => {
      expect(pipe.transform(104857600)).toBe('100 MB');
    });
  });

  describe('gigabytes (GB)', () => {
    it('should format exactly 1 GB', () => {
      expect(pipe.transform(1073741824)).toBe('1 GB');
    });

    it('should format 2.5 GB', () => {
      expect(pipe.transform(2684354560)).toBe('2.5 GB');
    });
  });

  describe('terabytes (TB)', () => {
    it('should format exactly 1 TB', () => {
      expect(pipe.transform(1099511627776)).toBe('1 TB');
    });

    it('should format large TB values', () => {
      // 10 TB
      expect(pipe.transform(10995116277760)).toBe('10 TB');
    });
  });

  describe('decimal precision', () => {
    it('should use default 1 decimal place', () => {
      expect(pipe.transform(1536)).toBe('1.5 KB');
    });

    it('should respect 0 decimal places', () => {
      expect(pipe.transform(1536, 0)).toBe('2 KB');
    });

    it('should respect 2 decimal places', () => {
      expect(pipe.transform(1536, 2)).toBe('1.50 KB');
    });

    it('should respect 3 decimal places', () => {
      expect(pipe.transform(1234567, 3)).toBe('1.177 MB');
    });

    it('should handle negative decimals as 0', () => {
      expect(pipe.transform(1536, -1)).toBe('2 KB');
    });

    it('should handle float decimals by flooring', () => {
      expect(pipe.transform(1536, 2.9)).toBe('1.50 KB');
    });
  });

  describe('real-world file sizes', () => {
    it('should format a typical image (3.5 MB)', () => {
      expect(pipe.transform(3670016)).toBe('3.5 MB');
    });

    it('should format a typical document (256 KB)', () => {
      expect(pipe.transform(262144)).toBe('256 KB');
    });

    it('should format a typical video (1.2 GB)', () => {
      expect(pipe.transform(1288490189)).toBe('1.2 GB');
    });
  });
});
