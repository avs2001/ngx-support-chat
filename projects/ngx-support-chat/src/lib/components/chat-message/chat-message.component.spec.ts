import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { ChatMessage, MessageStatus, MessageType } from '../../../models/chat-message.model';
import { FileContent, ImageContent, TextContent, SystemContent } from '../../../models/content-types.model';
import { CHAT_CONFIG, DEFAULT_CHAT_CONFIG } from '../../../tokens/chat-config.token';

import { ChatMessageComponent } from './chat-message.component';

// Helper function to create test messages
function createTestMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: 'msg-1',
    type: 'text' as MessageType,
    senderId: 'user-1',
    senderName: 'John Doe',
    senderAvatar: undefined,
    timestamp: new Date(2025, 0, 15, 10, 30),
    status: 'sent' as MessageStatus,
    content: { text: 'Hello, world!' } as TextContent,
    ...overrides
  };
}

describe('ChatMessageComponent', () => {
  let fixture: ComponentFixture<ChatMessageComponent>;
  let component: ChatMessageComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatMessageComponent],
      providers: [{ provide: CHAT_CONFIG, useValue: DEFAULT_CHAT_CONFIG }]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatMessageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('message', createTestMessage());
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('message type detection', () => {
    it('should detect text messages', () => {
      fixture.componentRef.setInput('message', createTestMessage({ type: 'text' }));
      fixture.detectChanges();
      expect(component.isText()).toBe(true);
      expect(component.isImage()).toBe(false);
      expect(component.isFile()).toBe(false);
      expect(component.isSystem()).toBe(false);
    });

    it('should detect image messages', () => {
      fixture.componentRef.setInput(
        'message',
        createTestMessage({
          type: 'image',
          content: { thumbnailUrl: 'thumb.jpg', fullUrl: 'full.jpg' } as ImageContent
        })
      );
      fixture.detectChanges();
      expect(component.isImage()).toBe(true);
      expect(component.isText()).toBe(false);
    });

    it('should detect file messages', () => {
      fixture.componentRef.setInput(
        'message',
        createTestMessage({
          type: 'file',
          content: { fileName: 'doc.pdf', fileType: 'pdf', downloadUrl: 'url' } as FileContent
        })
      );
      fixture.detectChanges();
      expect(component.isFile()).toBe(true);
      expect(component.isText()).toBe(false);
    });

    it('should detect system messages', () => {
      fixture.componentRef.setInput(
        'message',
        createTestMessage({
          type: 'system',
          content: { text: 'Chat started' } as SystemContent
        })
      );
      fixture.detectChanges();
      expect(component.isSystem()).toBe(true);
      expect(component.isText()).toBe(false);
    });
  });

  describe('content extraction', () => {
    it('should extract text content', () => {
      fixture.componentRef.setInput(
        'message',
        createTestMessage({
          type: 'text',
          content: { text: 'Test message' }
        })
      );
      fixture.detectChanges();
      expect(component.textContent()).toBe('Test message');
    });

    it('should extract image content', () => {
      const imageContent: ImageContent = {
        thumbnailUrl: 'thumb.jpg',
        fullUrl: 'full.jpg',
        altText: 'Test image'
      };
      fixture.componentRef.setInput(
        'message',
        createTestMessage({
          type: 'image',
          content: imageContent
        })
      );
      fixture.detectChanges();
      expect(component.imageContent()).toEqual(imageContent);
    });

    it('should extract file content', () => {
      const fileContent: FileContent = {
        fileName: 'doc.pdf',
        fileSize: 1024,
        fileType: 'application/pdf',
        downloadUrl: 'download.pdf'
      };
      fixture.componentRef.setInput(
        'message',
        createTestMessage({
          type: 'file',
          content: fileContent
        })
      );
      fixture.detectChanges();
      expect(component.fileContent()).toEqual(fileContent);
    });

    it('should extract system content', () => {
      fixture.componentRef.setInput(
        'message',
        createTestMessage({
          type: 'system',
          content: { text: 'Agent joined' }
        })
      );
      fixture.detectChanges();
      expect(component.systemContent()).toBe('Agent joined');
    });

    it('should return empty string for text content on non-text message', () => {
      fixture.componentRef.setInput(
        'message',
        createTestMessage({
          type: 'system',
          content: { text: 'System' }
        })
      );
      fixture.detectChanges();
      expect(component.textContent()).toBe('');
    });
  });

  describe('formatted time', () => {
    it('should format timestamp according to config', () => {
      fixture.componentRef.setInput('message', createTestMessage({ timestamp: new Date(2025, 0, 15, 14, 30) }));
      fixture.detectChanges();
      // Default format is 'HH:mm'
      expect(component.formattedTime()).toBe('14:30');
    });
  });

  describe('bubble classes', () => {
    it('should apply user classes for current user messages', () => {
      fixture.componentRef.setInput('message', createTestMessage());
      fixture.componentRef.setInput('isCurrentUser', true);
      fixture.detectChanges();

      const classes = component.bubbleClasses();
      expect(classes['message-bubble--user']).toBe(true);
      expect(classes['message-bubble--other']).toBe(false);
    });

    it('should apply other classes for non-user messages', () => {
      fixture.componentRef.setInput('message', createTestMessage());
      fixture.componentRef.setInput('isCurrentUser', false);
      fixture.detectChanges();

      const classes = component.bubbleClasses();
      expect(classes['message-bubble--other']).toBe(true);
      expect(classes['message-bubble--user']).toBe(false);
    });

    it('should apply system class for system messages', () => {
      fixture.componentRef.setInput('message', createTestMessage({ type: 'system', content: { text: 'System' } }));
      fixture.detectChanges();

      const classes = component.bubbleClasses();
      expect(classes['message-bubble--system']).toBe(true);
    });

    it('should apply first and last group classes', () => {
      fixture.componentRef.setInput('message', createTestMessage());
      fixture.componentRef.setInput('isFirstInGroup', true);
      fixture.componentRef.setInput('isLastInGroup', true);
      fixture.detectChanges();

      const classes = component.bubbleClasses();
      expect(classes['message-bubble--first']).toBe(true);
      expect(classes['message-bubble--last']).toBe(true);
    });

    it('should apply message type class', () => {
      fixture.componentRef.setInput('message', createTestMessage({ type: 'text' }));
      fixture.detectChanges();

      const classes = component.bubbleClasses();
      expect(classes['message-bubble--text']).toBe(true);
    });

    it('should apply status class', () => {
      fixture.componentRef.setInput('message', createTestMessage({ status: 'delivered' }));
      fixture.detectChanges();

      const classes = component.bubbleClasses();
      expect(classes['message-bubble--delivered']).toBe(true);
    });
  });

  describe('container classes', () => {
    it('should apply user class for current user', () => {
      fixture.componentRef.setInput('message', createTestMessage());
      fixture.componentRef.setInput('isCurrentUser', true);
      fixture.detectChanges();

      const classes = component.containerClasses();
      expect(classes['message-container--user']).toBe(true);
      expect(classes['message-container--other']).toBe(false);
    });

    it('should apply other class for non-current user', () => {
      fixture.componentRef.setInput('message', createTestMessage());
      fixture.componentRef.setInput('isCurrentUser', false);
      fixture.detectChanges();

      const classes = component.containerClasses();
      expect(classes['message-container--other']).toBe(true);
    });

    it('should apply system class for system messages', () => {
      fixture.componentRef.setInput('message', createTestMessage({ type: 'system', content: { text: 'System' } }));
      fixture.detectChanges();

      const classes = component.containerClasses();
      expect(classes['message-container--system']).toBe(true);
    });
  });

  describe('status icons', () => {
    it.each([
      ['sending', 'clock'],
      ['sent', 'check'],
      ['delivered', 'check-double'],
      ['read', 'check-double-filled'],
      ['failed', 'x']
    ] as const)('should return %s icon for %s status', (status, expectedIcon) => {
      fixture.componentRef.setInput('message', createTestMessage({ status }));
      fixture.detectChanges();
      expect(component.statusIcon()).toBe(expectedIcon);
    });
  });

  describe('retry functionality', () => {
    it('should show retry for failed user messages', () => {
      fixture.componentRef.setInput('message', createTestMessage({ status: 'failed' }));
      fixture.componentRef.setInput('isCurrentUser', true);
      fixture.detectChanges();
      expect(component.showRetry()).toBe(true);
    });

    it('should not show retry for failed non-user messages', () => {
      fixture.componentRef.setInput('message', createTestMessage({ status: 'failed' }));
      fixture.componentRef.setInput('isCurrentUser', false);
      fixture.detectChanges();
      expect(component.showRetry()).toBe(false);
    });

    it('should not show retry for non-failed messages', () => {
      fixture.componentRef.setInput('message', createTestMessage({ status: 'sent' }));
      fixture.componentRef.setInput('isCurrentUser', true);
      fixture.detectChanges();
      expect(component.showRetry()).toBe(false);
    });

    it('should emit messageRetry on retry click', () => {
      fixture.componentRef.setInput('message', createTestMessage({ id: 'msg-123', status: 'failed' }));
      fixture.componentRef.setInput('isCurrentUser', true);
      fixture.detectChanges();

      const spy = vi.fn();
      component.messageRetry.subscribe(spy);

      component.onRetryClick();
      expect(spy).toHaveBeenCalledWith('msg-123');
    });

    it('should not emit messageRetry if message is not failed', () => {
      fixture.componentRef.setInput('message', createTestMessage({ status: 'sent' }));
      fixture.detectChanges();

      const spy = vi.fn();
      component.messageRetry.subscribe(spy);

      component.onRetryClick();
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('image preview', () => {
    it('should emit imagePreview on image click', () => {
      const imageContent: ImageContent = {
        thumbnailUrl: 'thumb.jpg',
        fullUrl: 'full.jpg'
      };
      fixture.componentRef.setInput('message', createTestMessage({ type: 'image', content: imageContent }));
      fixture.detectChanges();

      const spy = vi.fn();
      component.imagePreview.subscribe(spy);

      component.onImageClick();
      expect(spy).toHaveBeenCalledWith(imageContent);
    });

    it('should not emit if image content is null', () => {
      fixture.componentRef.setInput('message', createTestMessage({ type: 'text' }));
      fixture.detectChanges();

      const spy = vi.fn();
      component.imagePreview.subscribe(spy);

      component.onImageClick();
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('file download', () => {
    it('should emit fileDownload on file click', () => {
      const fileContent: FileContent = {
        fileName: 'doc.pdf',
        fileType: 'pdf',
        downloadUrl: 'url'
      };
      fixture.componentRef.setInput('message', createTestMessage({ type: 'file', content: fileContent }));
      fixture.detectChanges();

      const spy = vi.fn();
      component.fileDownload.subscribe(spy);

      component.onFileDownloadClick();
      expect(spy).toHaveBeenCalledWith(fileContent);
    });
  });

  describe('file size formatting', () => {
    it.each([
      [0, '0 B'],
      [500, '500 B'],
      [1024, '1.0 KB'],
      [1536, '1.5 KB'],
      [1048576, '1.0 MB'],
      [1572864, '1.5 MB'],
      [1073741824, '1.0 GB']
    ])('should format %d bytes as %s', (bytes, expected) => {
      fixture.componentRef.setInput('message', createTestMessage());
      fixture.detectChanges();
      expect(component.formatFileSize(bytes)).toBe(expected);
    });

    it('should return empty string for undefined', () => {
      fixture.componentRef.setInput('message', createTestMessage());
      fixture.detectChanges();
      expect(component.formatFileSize(undefined)).toBe('');
    });
  });

  describe('image max width', () => {
    it('should return 280 when image has no width', () => {
      fixture.componentRef.setInput(
        'message',
        createTestMessage({
          type: 'image',
          content: { thumbnailUrl: 'thumb.jpg', fullUrl: 'full.jpg' }
        })
      );
      fixture.detectChanges();
      expect(component.imageMaxWidth()).toBe(280);
    });

    it('should return image width if less than 280', () => {
      fixture.componentRef.setInput(
        'message',
        createTestMessage({
          type: 'image',
          content: { thumbnailUrl: 'thumb.jpg', fullUrl: 'full.jpg', width: 200 }
        })
      );
      fixture.detectChanges();
      expect(component.imageMaxWidth()).toBe(200);
    });

    it('should cap width at 280', () => {
      fixture.componentRef.setInput(
        'message',
        createTestMessage({
          type: 'image',
          content: { thumbnailUrl: 'thumb.jpg', fullUrl: 'full.jpg', width: 500 }
        })
      );
      fixture.detectChanges();
      expect(component.imageMaxWidth()).toBe(280);
    });
  });

  describe('rendering', () => {
    it('should render text message content', () => {
      fixture.componentRef.setInput('message', createTestMessage({ type: 'text', content: { text: 'Hello World' } }));
      fixture.detectChanges();

      const textEl = fixture.nativeElement.querySelector('.message-text');
      expect(textEl).toBeTruthy();
      expect(textEl.textContent).toBe('Hello World');
    });

    it('should render avatar for non-user messages when showAvatar is true', () => {
      fixture.componentRef.setInput('message', createTestMessage({ senderAvatar: 'avatar.jpg' }));
      fixture.componentRef.setInput('isCurrentUser', false);
      fixture.componentRef.setInput('showAvatar', true);
      fixture.componentRef.setInput('isLastInGroup', true);
      fixture.detectChanges();

      const avatarImg = fixture.nativeElement.querySelector('.message-avatar__image');
      expect(avatarImg).toBeTruthy();
      expect(avatarImg.getAttribute('src')).toBe('avatar.jpg');
    });

    it('should render avatar placeholder when no avatar URL', () => {
      fixture.componentRef.setInput('message', createTestMessage({ senderName: 'Alice' }));
      fixture.componentRef.setInput('isCurrentUser', false);
      fixture.componentRef.setInput('showAvatar', true);
      fixture.componentRef.setInput('isLastInGroup', true);
      fixture.detectChanges();

      const placeholder = fixture.nativeElement.querySelector('.message-avatar__placeholder');
      expect(placeholder).toBeTruthy();
      expect(placeholder.textContent.trim()).toBe('A');
    });

    it('should render sender name for first message in group', () => {
      fixture.componentRef.setInput('message', createTestMessage({ senderName: 'Bob' }));
      fixture.componentRef.setInput('isCurrentUser', false);
      fixture.componentRef.setInput('showSenderName', true);
      fixture.componentRef.setInput('isFirstInGroup', true);
      fixture.detectChanges();

      const senderEl = fixture.nativeElement.querySelector('.message-sender');
      expect(senderEl).toBeTruthy();
      expect(senderEl.textContent.trim()).toBe('Bob');
    });

    it('should not render sender name for user messages', () => {
      fixture.componentRef.setInput('message', createTestMessage());
      fixture.componentRef.setInput('isCurrentUser', true);
      fixture.componentRef.setInput('isFirstInGroup', true);
      fixture.detectChanges();

      const senderEl = fixture.nativeElement.querySelector('.message-sender');
      expect(senderEl).toBeFalsy();
    });

    it('should render timestamp for last message in group', () => {
      fixture.componentRef.setInput('message', createTestMessage({ timestamp: new Date(2025, 0, 15, 14, 30) }));
      fixture.componentRef.setInput('isLastInGroup', true);
      fixture.detectChanges();

      const timeEl = fixture.nativeElement.querySelector('.message-meta__time');
      expect(timeEl).toBeTruthy();
      expect(timeEl.textContent.trim()).toBe('14:30');
    });

    it('should render status indicator for user messages', () => {
      fixture.componentRef.setInput('message', createTestMessage({ status: 'delivered' }));
      fixture.componentRef.setInput('isCurrentUser', true);
      fixture.componentRef.setInput('isLastInGroup', true);
      fixture.detectChanges();

      const statusEl = fixture.nativeElement.querySelector('.message-meta__status--delivered');
      expect(statusEl).toBeTruthy();
    });

    it('should render retry button for failed user messages', () => {
      fixture.componentRef.setInput('message', createTestMessage({ status: 'failed' }));
      fixture.componentRef.setInput('isCurrentUser', true);
      fixture.componentRef.setInput('isLastInGroup', true);
      fixture.detectChanges();

      const retryBtn = fixture.nativeElement.querySelector('.message-meta__retry');
      expect(retryBtn).toBeTruthy();
      expect(retryBtn.textContent.trim()).toBe('Retry');
    });

    it('should render system message centered', () => {
      fixture.componentRef.setInput(
        'message',
        createTestMessage({ type: 'system', content: { text: 'Chat started' } })
      );
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('.message-container--system');
      expect(container).toBeTruthy();

      const systemText = fixture.nativeElement.querySelector('.message-system-text');
      expect(systemText).toBeTruthy();
      expect(systemText.textContent.trim()).toBe('Chat started');
    });
  });

  describe('accessibility', () => {
    it('should have aria-label for image button', () => {
      fixture.componentRef.setInput(
        'message',
        createTestMessage({
          type: 'image',
          content: { thumbnailUrl: 'thumb.jpg', fullUrl: 'full.jpg', altText: 'Test photo' }
        })
      );
      fixture.detectChanges();

      const imgBtn = fixture.nativeElement.querySelector('.message-image');
      expect(imgBtn.getAttribute('aria-label')).toBe('View image: Test photo');
    });

    it('should have aria-label for file button', () => {
      fixture.componentRef.setInput(
        'message',
        createTestMessage({
          type: 'file',
          content: { fileName: 'doc.pdf', fileType: 'pdf', downloadUrl: 'url' }
        })
      );
      fixture.detectChanges();

      const fileBtn = fixture.nativeElement.querySelector('.message-file');
      expect(fileBtn.getAttribute('aria-label')).toBe('Download file: doc.pdf');
    });

    it('should have aria-label for retry button', () => {
      fixture.componentRef.setInput('message', createTestMessage({ status: 'failed' }));
      fixture.componentRef.setInput('isCurrentUser', true);
      fixture.componentRef.setInput('isLastInGroup', true);
      fixture.detectChanges();

      const retryBtn = fixture.nativeElement.querySelector('.message-meta__retry');
      expect(retryBtn.getAttribute('aria-label')).toBe('Retry sending message');
    });

    it('should have role="listitem" on container', () => {
      fixture.componentRef.setInput('message', createTestMessage());
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('[role="listitem"]');
      expect(container).toBeTruthy();
    });

    it('should have tabindex="0" for keyboard focus', () => {
      fixture.componentRef.setInput('message', createTestMessage());
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('[tabindex="0"]');
      expect(container).toBeTruthy();
    });

    describe('ariaLabel computed signal', () => {
      it('should include sender name, time, and text content for text messages', () => {
        fixture.componentRef.setInput(
          'message',
          createTestMessage({
            senderName: 'Alice',
            timestamp: new Date(2025, 0, 15, 14, 30),
            type: 'text',
            content: { text: 'Hello there!' }
          })
        );
        fixture.detectChanges();

        const ariaLabel = component.ariaLabel();
        expect(ariaLabel).toBe('Alice at 14:30: Hello there!');
      });

      it('should truncate long text content to 100 characters', () => {
        const longText = 'A'.repeat(150);
        fixture.componentRef.setInput(
          'message',
          createTestMessage({
            senderName: 'Bob',
            timestamp: new Date(2025, 0, 15, 10, 0),
            type: 'text',
            content: { text: longText }
          })
        );
        fixture.detectChanges();

        const ariaLabel = component.ariaLabel();
        expect(ariaLabel).toContain('Bob at 10:00: ');
        expect(ariaLabel).toContain('...');
        expect(ariaLabel.length).toBeLessThan(longText.length + 20);
      });

      it('should describe image messages with alt text', () => {
        fixture.componentRef.setInput(
          'message',
          createTestMessage({
            senderName: 'Charlie',
            timestamp: new Date(2025, 0, 15, 12, 0),
            type: 'image',
            content: { thumbnailUrl: 'thumb.jpg', fullUrl: 'full.jpg', altText: 'A sunset photo' }
          })
        );
        fixture.detectChanges();

        expect(component.ariaLabel()).toBe('Charlie at 12:00: Image: A sunset photo');
      });

      it('should describe image messages without alt text', () => {
        fixture.componentRef.setInput(
          'message',
          createTestMessage({
            senderName: 'Dana',
            timestamp: new Date(2025, 0, 15, 13, 0),
            type: 'image',
            content: { thumbnailUrl: 'thumb.jpg', fullUrl: 'full.jpg' }
          })
        );
        fixture.detectChanges();

        expect(component.ariaLabel()).toBe('Dana at 13:00: Image');
      });

      it('should describe file messages with file name', () => {
        fixture.componentRef.setInput(
          'message',
          createTestMessage({
            senderName: 'Eve',
            timestamp: new Date(2025, 0, 15, 15, 30),
            type: 'file',
            content: { fileName: 'report.pdf', fileType: 'pdf', downloadUrl: 'url' }
          })
        );
        fixture.detectChanges();

        expect(component.ariaLabel()).toBe('Eve at 15:30: File: report.pdf');
      });

      it('should describe system messages with content text', () => {
        fixture.componentRef.setInput(
          'message',
          createTestMessage({
            senderName: 'System',
            timestamp: new Date(2025, 0, 15, 16, 0),
            type: 'system',
            content: { text: 'Agent joined the chat' }
          })
        );
        fixture.detectChanges();

        expect(component.ariaLabel()).toBe('System at 16:00: Agent joined the chat');
      });
    });

    it('should render aria-label attribute on container element', () => {
      fixture.componentRef.setInput(
        'message',
        createTestMessage({
          senderName: 'Frank',
          timestamp: new Date(2025, 0, 15, 17, 0),
          type: 'text',
          content: { text: 'Test message' }
        })
      );
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('.message-container');
      expect(container.getAttribute('aria-label')).toBe('Frank at 17:00: Test message');
    });
  });
});

describe('ChatMessageComponent with custom config', () => {
  it('should use custom time format', async () => {
    const customConfig = {
      ...DEFAULT_CHAT_CONFIG,
      timeFormat: 'h:mm a'
    };

    await TestBed.configureTestingModule({
      imports: [ChatMessageComponent],
      providers: [{ provide: CHAT_CONFIG, useValue: customConfig }]
    }).compileComponents();

    const fixture = TestBed.createComponent(ChatMessageComponent);
    fixture.componentRef.setInput('message', createTestMessage({ timestamp: new Date(2025, 0, 15, 14, 30) }));
    fixture.detectChanges();

    expect(fixture.componentInstance.formattedTime()).toBe('2:30 PM');
  });
});
