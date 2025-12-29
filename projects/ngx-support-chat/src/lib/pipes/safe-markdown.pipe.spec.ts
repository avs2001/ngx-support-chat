import { AsyncPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

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

    const providers = [SafeMarkdownPipe, { provide: ChatConfigService, useValue: mockConfigService }];

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
    it('should return empty string for null', async () => {
      const pipe = createPipe({});
      const result = await firstValueFrom(pipe.transform(null));
      expect(result).toBe('');
    });

    it('should return empty string for undefined', async () => {
      const pipe = createPipe({});
      const result = await firstValueFrom(pipe.transform(undefined));
      expect(result).toBe('');
    });

    it('should return empty string for empty string', async () => {
      const pipe = createPipe({});
      const result = await firstValueFrom(pipe.transform(''));
      expect(result).toBe('');
    });
  });

  describe('markdown disabled', () => {
    it('should return plain text when markdown is disabled', async () => {
      const pipe = createPipe({ markdownEnabled: false });
      const result = await firstValueFrom(pipe.transform('**bold** text'));
      expect(result).toBe('**bold** text');
    });

    it('should return plain text when displayMode is disabled', async () => {
      const pipe = createPipe({ markdownEnabled: true, displayMode: false });
      const result = await firstValueFrom(pipe.transform('**bold** text'));
      expect(result).toBe('**bold** text');
    });
  });

  describe('markdown service not available', () => {
    it('should return plain text when service not installed', async () => {
      const pipe = createPipe({
        markdownEnabled: true,
        displayMode: true,
        markdownService: null
      });
      const result = await firstValueFrom(pipe.transform('**bold** text'));
      expect(result).toBe('**bold** text');
    });
  });

  describe('markdown rendering (sync)', () => {
    it('should render markdown when enabled and service available', async () => {
      const mockMarkdownService: MarkdownServiceLike = {
        parse: (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      };

      const pipe = createPipe({
        markdownEnabled: true,
        displayMode: true,
        markdownService: mockMarkdownService
      });

      const result = await firstValueFrom(pipe.transform('**bold** text'));
      // Result should be SafeHtml, check it's not plain string
      expect(typeof result).not.toBe('string');
      // The changingThisBreaksApplicationSecurity property contains the HTML
      expect((result as { changingThisBreaksApplicationSecurity: string }).changingThisBreaksApplicationSecurity).toBe(
        '<strong>bold</strong> text'
      );
    });

    it('should render multiple markdown elements', async () => {
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

      const result = await firstValueFrom(pipe.transform('**bold** and *italic* and `code`'));
      expect((result as { changingThisBreaksApplicationSecurity: string }).changingThisBreaksApplicationSecurity).toBe(
        '<strong>bold</strong> and <em>italic</em> and <code>code</code>'
      );
    });
  });

  describe('markdown rendering (async)', () => {
    it('should handle async markdown parsing (Promise return)', async () => {
      const mockMarkdownService: MarkdownServiceLike = {
        parse: (text: string) => Promise.resolve(text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'))
      };

      const pipe = createPipe({
        markdownEnabled: true,
        displayMode: true,
        markdownService: mockMarkdownService
      });

      const result = await firstValueFrom(pipe.transform('**bold** text'));
      expect(typeof result).not.toBe('string');
      expect((result as { changingThisBreaksApplicationSecurity: string }).changingThisBreaksApplicationSecurity).toBe(
        '<strong>bold</strong> text'
      );
    });

    it('should handle async parsing with multiple elements', async () => {
      const mockMarkdownService: MarkdownServiceLike = {
        parse: (text: string) =>
          Promise.resolve(
            text
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\*(.*?)\*/g, '<em>$1</em>')
          )
      };

      const pipe = createPipe({
        markdownEnabled: true,
        displayMode: true,
        markdownService: mockMarkdownService
      });

      const result = await firstValueFrom(pipe.transform('**bold** and *italic*'));
      expect((result as { changingThisBreaksApplicationSecurity: string }).changingThisBreaksApplicationSecurity).toBe(
        '<strong>bold</strong> and <em>italic</em>'
      );
    });

    it('should handle async parsing error gracefully', async () => {
      const mockMarkdownService: MarkdownServiceLike = {
        parse: () => Promise.reject(new Error('Async parsing failed'))
      };

      const pipe = createPipe({
        markdownEnabled: true,
        displayMode: true,
        markdownService: mockMarkdownService
      });

      const result = await firstValueFrom(pipe.transform('**bold** text'));
      // Should fall back to plain text on error
      expect(result).toBe('**bold** text');
    });
  });

  describe('caching', () => {
    it('should return cached result for same input', async () => {
      let parseCallCount = 0;
      const mockMarkdownService: MarkdownServiceLike = {
        parse: (text: string) => {
          parseCallCount++;
          return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        }
      };

      const pipe = createPipe({
        markdownEnabled: true,
        displayMode: true,
        markdownService: mockMarkdownService
      });

      // First call
      await firstValueFrom(pipe.transform('**bold**'));
      expect(parseCallCount).toBe(1);

      // Second call with same input - should use cache
      await firstValueFrom(pipe.transform('**bold**'));
      expect(parseCallCount).toBe(1);

      // Third call with different input
      await firstValueFrom(pipe.transform('**different**'));
      expect(parseCallCount).toBe(2);
    });
  });

  describe('error handling', () => {
    it('should return plain text when sync markdown parsing throws', async () => {
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

      const result = await firstValueFrom(pipe.transform('**bold** text'));
      expect(result).toBe('**bold** text');
    });
  });

  describe('plain text passthrough', () => {
    it('should pass through plain text unchanged', async () => {
      const pipe = createPipe({ markdownEnabled: false });
      const plainText = 'This is just plain text without any markdown';
      const result = await firstValueFrom(pipe.transform(plainText));
      expect(result).toBe(plainText);
    });

    it('should preserve whitespace in plain text', async () => {
      const pipe = createPipe({ markdownEnabled: false });
      const textWithWhitespace = 'Line 1\n  Line 2\n    Line 3';
      const result = await firstValueFrom(pipe.transform(textWithWhitespace));
      expect(result).toBe(textWithWhitespace);
    });
  });

  describe('XSS protection', () => {
    it('should handle HTML-like content in plain text mode', async () => {
      const pipe = createPipe({ markdownEnabled: false });
      const maliciousText = '<script>alert("xss")</script>';
      // In plain text mode, it's returned as-is (Angular's template binding handles escaping)
      const result = await firstValueFrom(pipe.transform(maliciousText));
      expect(result).toBe(maliciousText);
    });

    it('should sanitize when markdown service handles XSS', async () => {
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

      const result = await firstValueFrom(pipe.transform('<script>alert("xss")</script>'));
      expect((result as { changingThisBreaksApplicationSecurity: string }).changingThisBreaksApplicationSecurity).toBe(
        '&lt;script&gt;alert("xss")&lt;/script&gt;'
      );
    });
  });
});

// Integration test with actual component
@Component({
  selector: 'ngx-test-host',
  template: `<span>{{ text | safeMarkdown | async }}</span>`,
  imports: [SafeMarkdownPipe, AsyncPipe]
})
class TestHostComponent {
  text = '';
}

describe('SafeMarkdownPipe Integration', () => {
  it('should work in a component template', async () => {
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
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('Hello World');
  });

  it('should work with async markdown service', async () => {
    const mockConfigService = {
      markdown: signal({
        enabled: true,
        displayMode: true,
        inputMode: false
      })
    };

    const mockMarkdownService: MarkdownServiceLike = {
      parse: (text: string) => Promise.resolve(`<strong>${text}</strong>`)
    };

    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        { provide: ChatConfigService, useValue: mockConfigService },
        { provide: MARKDOWN_SERVICE, useValue: mockMarkdownService }
      ]
    });

    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.text = 'Hello';
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    // Note: The async pipe unwraps the SafeHtml, but in the text content
    // we'll see the rendered HTML as text since it's not in [innerHTML]
    expect(fixture.nativeElement.textContent).toContain('Hello');
  });
});
