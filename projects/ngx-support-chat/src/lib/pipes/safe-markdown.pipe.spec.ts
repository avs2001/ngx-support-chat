import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ChatConfigService } from '../services/chat-config.service';

import { MARKDOWN_SERVICE, MarkdownServiceLike, SafeMarkdownPipe } from './safe-markdown.pipe';

describe('SafeMarkdownPipe', () => {
  // Helper to create pipe with mocked dependencies
  function createPipe(options: {
    markdownEnabled?: boolean;
    displayMode?: boolean;
    markdownService?: MarkdownServiceLike | null;
  }) {
    const { markdownEnabled = false, displayMode = false, markdownService = null } = options;

    const mockConfigService = {
      markdown: signal({
        enabled: markdownEnabled,
        displayMode: displayMode,
        inputMode: false
      })
    };

    const providers = [
      SafeMarkdownPipe,
      { provide: ChatConfigService, useValue: mockConfigService }
    ];

    // Only provide markdown service if specified
    if (markdownService) {
      providers.push({ provide: MARKDOWN_SERVICE, useValue: markdownService } as never);
    }

    TestBed.configureTestingModule({ providers });

    return TestBed.inject(SafeMarkdownPipe);
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  describe('edge cases', () => {
    it('should return empty string for null', () => {
      const pipe = createPipe({});
      expect(pipe.transform(null)).toBe('');
    });

    it('should return empty string for undefined', () => {
      const pipe = createPipe({});
      expect(pipe.transform(undefined)).toBe('');
    });

    it('should return empty string for empty string', () => {
      const pipe = createPipe({});
      expect(pipe.transform('')).toBe('');
    });
  });

  describe('markdown disabled', () => {
    it('should return plain text when markdown is disabled', () => {
      const pipe = createPipe({ markdownEnabled: false });
      expect(pipe.transform('**bold** text')).toBe('**bold** text');
    });

    it('should return plain text when displayMode is disabled', () => {
      const pipe = createPipe({ markdownEnabled: true, displayMode: false });
      expect(pipe.transform('**bold** text')).toBe('**bold** text');
    });
  });

  describe('markdown service not available', () => {
    it('should return plain text when service not installed', () => {
      const pipe = createPipe({
        markdownEnabled: true,
        displayMode: true,
        markdownService: null
      });
      expect(pipe.transform('**bold** text')).toBe('**bold** text');
    });
  });

  describe('markdown rendering', () => {
    it('should render markdown when enabled and service available', () => {
      const mockMarkdownService: MarkdownServiceLike = {
        parse: (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      };

      const pipe = createPipe({
        markdownEnabled: true,
        displayMode: true,
        markdownService: mockMarkdownService
      });

      const result = pipe.transform('**bold** text');
      // Result should be SafeHtml, check it's not plain string
      expect(typeof result).not.toBe('string');
      // The changingThisBreaksApplicationSecurity property contains the HTML
      expect((result as { changingThisBreaksApplicationSecurity: string }).changingThisBreaksApplicationSecurity).toBe(
        '<strong>bold</strong> text'
      );
    });

    it('should render multiple markdown elements', () => {
      const mockMarkdownService: MarkdownServiceLike = {
        parse: (text: string) =>
          text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
      };

      const pipe = createPipe({
        markdownEnabled: true,
        displayMode: true,
        markdownService: mockMarkdownService
      });

      const result = pipe.transform('**bold** and *italic* and `code`');
      expect((result as { changingThisBreaksApplicationSecurity: string }).changingThisBreaksApplicationSecurity).toBe(
        '<strong>bold</strong> and <em>italic</em> and <code>code</code>'
      );
    });
  });

  describe('error handling', () => {
    it('should return plain text when markdown parsing throws', () => {
      const mockMarkdownService: MarkdownServiceLike = {
        parse: () => {
          throw new Error('Parsing failed');
        }
      };

      const pipe = createPipe({
        markdownEnabled: true,
        displayMode: true,
        markdownService: mockMarkdownService
      });

      expect(pipe.transform('**bold** text')).toBe('**bold** text');
    });
  });

  describe('plain text passthrough', () => {
    it('should pass through plain text unchanged', () => {
      const pipe = createPipe({ markdownEnabled: false });
      const plainText = 'This is just plain text without any markdown';
      expect(pipe.transform(plainText)).toBe(plainText);
    });

    it('should preserve whitespace in plain text', () => {
      const pipe = createPipe({ markdownEnabled: false });
      const textWithWhitespace = 'Line 1\n  Line 2\n    Line 3';
      expect(pipe.transform(textWithWhitespace)).toBe(textWithWhitespace);
    });
  });

  describe('XSS protection', () => {
    it('should handle HTML-like content in plain text mode', () => {
      const pipe = createPipe({ markdownEnabled: false });
      const maliciousText = '<script>alert("xss")</script>';
      // In plain text mode, it's returned as-is (Angular's template binding handles escaping)
      expect(pipe.transform(maliciousText)).toBe(maliciousText);
    });

    it('should sanitize when markdown service handles XSS', () => {
      // Mock a markdown service that sanitizes XSS
      const mockMarkdownService: MarkdownServiceLike = {
        parse: (text: string) => {
          // Simulate proper sanitization by escaping script tags
          return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }
      };

      const pipe = createPipe({
        markdownEnabled: true,
        displayMode: true,
        markdownService: mockMarkdownService
      });

      const result = pipe.transform('<script>alert("xss")</script>');
      expect((result as { changingThisBreaksApplicationSecurity: string }).changingThisBreaksApplicationSecurity).toBe(
        '&lt;script&gt;alert("xss")&lt;/script&gt;'
      );
    });
  });
});

// Integration test with actual component
@Component({
  selector: 'ngx-test-host',
  template: `<span>{{ text | safeMarkdown }}</span>`,
  imports: [SafeMarkdownPipe]
})
class TestHostComponent {
  text = '';
}

describe('SafeMarkdownPipe Integration', () => {
  it('should work in a component template', () => {
    const mockConfigService = {
      markdown: signal({
        enabled: false,
        displayMode: false,
        inputMode: false
      })
    };

    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [{ provide: ChatConfigService, useValue: mockConfigService }]
    });

    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.text = 'Hello World';
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('Hello World');
  });
});
