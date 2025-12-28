import { TestBed } from '@angular/core/testing';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ChatAnnouncerService } from './chat-announcer.service';
import { ChatMessage, TypingIndicator, QuickReplyOption } from '../../models/public-api';

describe('ChatAnnouncerService', () => {
  let service: ChatAnnouncerService;
  let liveAnnouncerMock: { announce: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    liveAnnouncerMock = {
      announce: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [ChatAnnouncerService, { provide: LiveAnnouncer, useValue: liveAnnouncerMock }]
    });

    service = TestBed.inject(ChatAnnouncerService);
  });

  describe('announceMessage', () => {
    it('should announce text message with sender, time, and content', () => {
      const message: ChatMessage = {
        id: '1',
        type: 'text',
        senderId: 'user-1',
        senderName: 'John Doe',
        timestamp: new Date('2025-12-28T14:30:00'),
        status: 'sent',
        content: { text: 'Hello, world!' }
      };

      service.announceMessage(message);

      expect(liveAnnouncerMock.announce).toHaveBeenCalledTimes(1);
      const call = liveAnnouncerMock.announce.mock.calls[0];
      expect(call[0]).toContain('John Doe');
      expect(call[0]).toContain('Hello, world!');
      expect(call[1]).toBe('polite');
    });

    it('should truncate long text messages', () => {
      const longText = 'A'.repeat(150);
      const message: ChatMessage = {
        id: '1',
        type: 'text',
        senderId: 'user-1',
        senderName: 'Jane',
        timestamp: new Date(),
        status: 'sent',
        content: { text: longText }
      };

      service.announceMessage(message);

      expect(liveAnnouncerMock.announce).toHaveBeenCalledTimes(1);
      const call = liveAnnouncerMock.announce.mock.calls[0];
      expect(call[0]).toContain('...');
      expect(call[0].length).toBeLessThan(longText.length + 50); // Some overhead for name/time
    });

    it('should announce image message with alt text', () => {
      const message: ChatMessage = {
        id: '1',
        type: 'image',
        senderId: 'user-1',
        senderName: 'Support Agent',
        timestamp: new Date(),
        status: 'sent',
        content: {
          thumbnailUrl: 'thumb.jpg',
          fullUrl: 'full.jpg',
          altText: 'Product screenshot'
        }
      };

      service.announceMessage(message);

      expect(liveAnnouncerMock.announce).toHaveBeenCalledTimes(1);
      const call = liveAnnouncerMock.announce.mock.calls[0];
      expect(call[0]).toContain('Image: Product screenshot');
      expect(call[1]).toBe('polite');
    });

    it('should announce image message without alt text using sender name', () => {
      const message: ChatMessage = {
        id: '1',
        type: 'image',
        senderId: 'user-1',
        senderName: 'Support Agent',
        timestamp: new Date(),
        status: 'sent',
        content: {
          thumbnailUrl: 'thumb.jpg',
          fullUrl: 'full.jpg'
        }
      };

      service.announceMessage(message);

      expect(liveAnnouncerMock.announce).toHaveBeenCalledTimes(1);
      const call = liveAnnouncerMock.announce.mock.calls[0];
      expect(call[0]).toContain('Image from Support Agent');
      expect(call[1]).toBe('polite');
    });

    it('should announce file message with name and size', () => {
      const message: ChatMessage = {
        id: '1',
        type: 'file',
        senderId: 'user-1',
        senderName: 'User',
        timestamp: new Date(),
        status: 'sent',
        content: {
          fileName: 'report.pdf',
          fileSize: 2.5 * 1024 * 1024, // 2.5 MB
          fileType: 'application/pdf',
          downloadUrl: '/files/report.pdf'
        }
      };

      service.announceMessage(message);

      expect(liveAnnouncerMock.announce).toHaveBeenCalledTimes(1);
      const call = liveAnnouncerMock.announce.mock.calls[0];
      expect(call[0]).toContain('report.pdf');
      expect(call[0]).toContain('2.5 megabytes');
      expect(call[1]).toBe('polite');
    });

    it('should announce system message with full text', () => {
      const message: ChatMessage = {
        id: '1',
        type: 'system',
        senderId: 'system',
        senderName: 'System',
        timestamp: new Date(),
        status: 'sent',
        content: { text: 'Agent has joined the chat' }
      };

      service.announceMessage(message);

      expect(liveAnnouncerMock.announce).toHaveBeenCalledTimes(1);
      const call = liveAnnouncerMock.announce.mock.calls[0];
      expect(call[0]).toContain('Agent has joined the chat');
      expect(call[1]).toBe('polite');
    });
  });

  describe('announceTyping', () => {
    it('should announce when a user starts typing', () => {
      const indicator: TypingIndicator = {
        userId: 'user-1',
        userName: 'Support Agent'
      };

      service.announceTyping(indicator);

      expect(liveAnnouncerMock.announce).toHaveBeenCalledWith('Support Agent is typing', 'polite');
    });

    it('should not announce duplicate typing for the same user', () => {
      const indicator: TypingIndicator = {
        userId: 'user-1',
        userName: 'Support Agent'
      };

      service.announceTyping(indicator);
      service.announceTyping(indicator);

      expect(liveAnnouncerMock.announce).toHaveBeenCalledTimes(1);
    });

    it('should announce typing for different users', () => {
      const indicator1: TypingIndicator = {
        userId: 'user-1',
        userName: 'Agent 1'
      };
      const indicator2: TypingIndicator = {
        userId: 'user-2',
        userName: 'Agent 2'
      };

      service.announceTyping(indicator1);
      service.announceTyping(indicator2);

      expect(liveAnnouncerMock.announce).toHaveBeenCalledTimes(2);
    });

    it('should re-announce after clearing typing state', () => {
      const indicator: TypingIndicator = {
        userId: 'user-1',
        userName: 'Support Agent'
      };

      service.announceTyping(indicator);
      service.clearTypingState();
      service.announceTyping(indicator);

      expect(liveAnnouncerMock.announce).toHaveBeenCalledTimes(2);
    });
  });

  describe('announceStatusChange', () => {
    const createMessage = (status: ChatMessage['status']): ChatMessage => ({
      id: '1',
      type: 'text',
      senderId: 'user-1',
      senderName: 'User',
      timestamp: new Date(),
      status,
      content: { text: 'Test' }
    });

    it('should announce status change from sent to delivered', () => {
      const message = createMessage('delivered');

      service.announceStatusChange(message, 'sent');

      expect(liveAnnouncerMock.announce).toHaveBeenCalledWith('Message delivered', 'polite');
    });

    it('should announce status change to read', () => {
      const message = createMessage('read');

      service.announceStatusChange(message, 'delivered');

      expect(liveAnnouncerMock.announce).toHaveBeenCalledWith('Message read', 'polite');
    });

    it('should announce failed status', () => {
      const message = createMessage('failed');

      service.announceStatusChange(message, 'sending');

      expect(liveAnnouncerMock.announce).toHaveBeenCalledWith('Message failed to send', 'polite');
    });

    it('should not announce when status is unchanged', () => {
      const message = createMessage('sent');

      service.announceStatusChange(message, 'sent');

      expect(liveAnnouncerMock.announce).not.toHaveBeenCalled();
    });
  });

  describe('announceQuickReplySelection', () => {
    it('should announce selected option', () => {
      const option: QuickReplyOption = {
        value: 'yes',
        label: 'Yes, continue'
      };

      service.announceQuickReplySelection(option);

      expect(liveAnnouncerMock.announce).toHaveBeenCalledWith('Selected: Yes, continue', 'polite');
    });
  });

  describe('announceQuickReplySubmit', () => {
    it('should announce single option submission', () => {
      const options: QuickReplyOption[] = [{ value: 'yes', label: 'Yes' }];

      service.announceQuickReplySubmit(options);

      expect(liveAnnouncerMock.announce).toHaveBeenCalledWith('Submitted: Yes', 'assertive');
    });

    it('should announce multiple option submission', () => {
      const options: QuickReplyOption[] = [
        { value: 'email', label: 'Email' },
        { value: 'phone', label: 'Phone' }
      ];

      service.announceQuickReplySubmit(options);

      expect(liveAnnouncerMock.announce).toHaveBeenCalledWith('Submitted: Email, Phone', 'assertive');
    });

    it('should not announce empty submission', () => {
      service.announceQuickReplySubmit([]);

      expect(liveAnnouncerMock.announce).not.toHaveBeenCalled();
    });
  });

  describe('file size formatting', () => {
    it('should format bytes correctly', () => {
      const message: ChatMessage = {
        id: '1',
        type: 'file',
        senderId: 'user-1',
        senderName: 'User',
        timestamp: new Date(),
        status: 'sent',
        content: {
          fileName: 'small.txt',
          fileSize: 500,
          fileType: 'text/plain',
          downloadUrl: '/files/small.txt'
        }
      };

      service.announceMessage(message);

      const call = liveAnnouncerMock.announce.mock.calls[0];
      expect(call[0]).toContain('500 bytes');
    });

    it('should format kilobytes correctly', () => {
      const message: ChatMessage = {
        id: '1',
        type: 'file',
        senderId: 'user-1',
        senderName: 'User',
        timestamp: new Date(),
        status: 'sent',
        content: {
          fileName: 'medium.doc',
          fileSize: 50 * 1024, // 50 KB
          fileType: 'application/doc',
          downloadUrl: '/files/medium.doc'
        }
      };

      service.announceMessage(message);

      const call = liveAnnouncerMock.announce.mock.calls[0];
      expect(call[0]).toContain('50.0 kilobytes');
    });
  });
});
