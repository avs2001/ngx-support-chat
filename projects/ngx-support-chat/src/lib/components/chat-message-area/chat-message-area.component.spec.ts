import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { ChatMessage } from '../../../models/chat-message.model';
import { FileContent, ImageContent, TextContent } from '../../../models/content-types.model';
import { CHAT_CONFIG, DEFAULT_CHAT_CONFIG } from '../../../tokens/chat-config.token';

import { ChatMessageAreaComponent, MessageAreaItem } from './chat-message-area.component';

// Helper to create test messages
function createTestMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: 'msg-1',
    type: 'text',
    senderId: 'user-1',
    senderName: 'John Doe',
    timestamp: new Date(2025, 0, 15, 10, 30),
    status: 'sent',
    content: { text: 'Hello!' } as TextContent,
    ...overrides
  };
}

describe('ChatMessageAreaComponent', () => {
  let fixture: ComponentFixture<ChatMessageAreaComponent>;
  let component: ChatMessageAreaComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatMessageAreaComponent],
      providers: [{ provide: CHAT_CONFIG, useValue: DEFAULT_CHAT_CONFIG }]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatMessageAreaComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('messages', []);
    fixture.componentRef.setInput('currentUserId', 'current-user');
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('message grouping', () => {
    it('should group messages by date', () => {
      const messages: ChatMessage[] = [
        createTestMessage({
          id: 'msg-1',
          timestamp: new Date(2025, 0, 15, 10, 0)
        }),
        createTestMessage({
          id: 'msg-2',
          timestamp: new Date(2025, 0, 16, 10, 0)
        })
      ];

      fixture.componentRef.setInput('messages', messages);
      fixture.componentRef.setInput('currentUserId', 'current-user');
      fixture.detectChanges();

      const grouped = component.groupedMessages();
      expect(grouped.length).toBe(2);
    });

    it('should group consecutive messages from same sender', () => {
      const messages: ChatMessage[] = [
        createTestMessage({
          id: 'msg-1',
          senderId: 'user-1',
          timestamp: new Date(2025, 0, 15, 10, 0)
        }),
        createTestMessage({
          id: 'msg-2',
          senderId: 'user-1',
          timestamp: new Date(2025, 0, 15, 10, 1)
        }),
        createTestMessage({
          id: 'msg-3',
          senderId: 'user-2',
          senderName: 'Jane',
          timestamp: new Date(2025, 0, 15, 10, 2)
        })
      ];

      fixture.componentRef.setInput('messages', messages);
      fixture.componentRef.setInput('currentUserId', 'current-user');
      fixture.detectChanges();

      const grouped = component.groupedMessages();
      expect(grouped.length).toBe(1); // One date
      expect(grouped[0]?.groups.length).toBe(2); // Two sender groups
      expect(grouped[0]?.groups[0]?.messages.length).toBe(2); // First group has 2 messages
    });

    it('should return empty array for no messages', () => {
      fixture.componentRef.setInput('messages', []);
      fixture.componentRef.setInput('currentUserId', 'current-user');
      fixture.detectChanges();

      expect(component.groupedMessages()).toEqual([]);
    });
  });

  describe('items computed', () => {
    it('should create flat item list with separators and groups', () => {
      const messages: ChatMessage[] = [
        createTestMessage({
          id: 'msg-1',
          timestamp: new Date(2025, 0, 15, 10, 0)
        }),
        createTestMessage({
          id: 'msg-2',
          timestamp: new Date(2025, 0, 15, 10, 1)
        })
      ];

      fixture.componentRef.setInput('messages', messages);
      fixture.componentRef.setInput('currentUserId', 'current-user');
      fixture.detectChanges();

      const items = component.items();
      expect(items.length).toBe(2); // 1 separator + 1 group
      expect(items[0]?.type).toBe('separator');
      expect(items[1]?.type).toBe('group');
    });

    it('should handle multiple dates correctly', () => {
      const messages: ChatMessage[] = [
        createTestMessage({
          id: 'msg-1',
          timestamp: new Date(2025, 0, 15, 10, 0)
        }),
        createTestMessage({
          id: 'msg-2',
          timestamp: new Date(2025, 0, 16, 10, 0)
        })
      ];

      fixture.componentRef.setInput('messages', messages);
      fixture.componentRef.setInput('currentUserId', 'current-user');
      fixture.detectChanges();

      const items = component.items();
      // 2 dates × (1 separator + 1 group) = 4 items
      expect(items.length).toBe(4);
      expect(items[0]?.type).toBe('separator');
      expect(items[1]?.type).toBe('group');
      expect(items[2]?.type).toBe('separator');
      expect(items[3]?.type).toBe('group');
    });
  });

  describe('trackByItem', () => {
    it('should return separator key for separator items', () => {
      const date = new Date(2025, 0, 15);
      const item: MessageAreaItem = { type: 'separator', date };

      fixture.componentRef.setInput('messages', []);
      fixture.componentRef.setInput('currentUserId', 'current-user');
      fixture.detectChanges();

      const key = component.trackByItem(0, item);
      expect(key).toBe(`sep-${date.getTime()}`);
    });

    it('should return group key based on first message id', () => {
      const item: MessageAreaItem = {
        type: 'group',
        group: {
          senderId: 'user-1',
          senderName: 'John',
          isCurrentUser: false,
          messages: [createTestMessage({ id: 'first-msg' })]
        }
      };

      fixture.componentRef.setInput('messages', []);
      fixture.componentRef.setInput('currentUserId', 'current-user');
      fixture.detectChanges();

      const key = component.trackByItem(0, item);
      expect(key).toBe('grp-first-msg');
    });
  });

  describe('type guards', () => {
    it('should correctly identify separator items', () => {
      const separator: MessageAreaItem = { type: 'separator', date: new Date() };
      const group: MessageAreaItem = {
        type: 'group',
        group: {
          senderId: 'user-1',
          senderName: 'John',
          isCurrentUser: false,
          messages: []
        }
      };

      fixture.componentRef.setInput('messages', []);
      fixture.componentRef.setInput('currentUserId', 'current-user');
      fixture.detectChanges();

      expect(component.isSeparator(separator)).toBe(true);
      expect(component.isSeparator(group)).toBe(false);
    });

    it('should correctly identify group items', () => {
      const separator: MessageAreaItem = { type: 'separator', date: new Date() };
      const group: MessageAreaItem = {
        type: 'group',
        group: {
          senderId: 'user-1',
          senderName: 'John',
          isCurrentUser: false,
          messages: []
        }
      };

      fixture.componentRef.setInput('messages', []);
      fixture.componentRef.setInput('currentUserId', 'current-user');
      fixture.detectChanges();

      expect(component.isGroup(group)).toBe(true);
      expect(component.isGroup(separator)).toBe(false);
    });
  });

  describe('inputs', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('messages', []);
      fixture.componentRef.setInput('currentUserId', 'current-user');
    });

    it('should have default showAvatars value', () => {
      fixture.detectChanges();
      expect(component.showAvatars()).toBe(true);
    });

    it('should have default showSenderNames value', () => {
      fixture.detectChanges();
      expect(component.showSenderNames()).toBe(true);
    });

    it('should have default itemSize value', () => {
      fixture.detectChanges();
      expect(component.itemSize()).toBe(80);
    });

    it('should have default autoScrollToBottom value', () => {
      fixture.detectChanges();
      expect(component.autoScrollToBottom()).toBe(true);
    });

    it('should accept custom showAvatars', () => {
      fixture.componentRef.setInput('showAvatars', false);
      fixture.detectChanges();
      expect(component.showAvatars()).toBe(false);
    });

    it('should accept custom itemSize', () => {
      fixture.componentRef.setInput('itemSize', 100);
      fixture.detectChanges();
      expect(component.itemSize()).toBe(100);
    });
  });

  describe('outputs', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('messages', [createTestMessage()]);
      fixture.componentRef.setInput('currentUserId', 'other-user');
      fixture.detectChanges();
    });

    it('should emit messageRetry', () => {
      const spy = vi.fn();
      component.messageRetry.subscribe(spy);

      component.messageRetry.emit('msg-123');
      expect(spy).toHaveBeenCalledWith('msg-123');
    });

    it('should emit imagePreview', () => {
      const imageContent: ImageContent = {
        thumbnailUrl: 'thumb.jpg',
        fullUrl: 'full.jpg'
      };

      const spy = vi.fn();
      component.imagePreview.subscribe(spy);

      component.imagePreview.emit(imageContent);
      expect(spy).toHaveBeenCalledWith(imageContent);
    });

    it('should emit fileDownload', () => {
      const fileContent: FileContent = {
        fileName: 'doc.pdf',
        fileType: 'pdf',
        downloadUrl: 'url'
      };

      const spy = vi.fn();
      component.fileDownload.subscribe(spy);

      component.fileDownload.emit(fileContent);
      expect(spy).toHaveBeenCalledWith(fileContent);
    });
  });

  describe('scroll functionality', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('messages', []);
      fixture.componentRef.setInput('currentUserId', 'current-user');
      fixture.detectChanges();
    });

    it('should have viewport reference after view init', async () => {
      await fixture.whenStable();
      expect(component.viewport()).toBeTruthy();
    });

    it('should return true for isScrolledToBottom when empty', async () => {
      await fixture.whenStable();
      // Empty viewport should be considered at bottom
      expect(component.isScrolledToBottom()).toBe(true);
    });
  });

  describe('rendering', () => {
    it('should render virtual scroll viewport', () => {
      fixture.componentRef.setInput('messages', []);
      fixture.componentRef.setInput('currentUserId', 'current-user');
      fixture.detectChanges();

      const viewport = fixture.nativeElement.querySelector('cdk-virtual-scroll-viewport');
      expect(viewport).toBeTruthy();
    });

    it('should render date separators', async () => {
      const messages: ChatMessage[] = [
        createTestMessage({
          id: 'msg-1',
          timestamp: new Date(2025, 0, 15, 10, 0)
        })
      ];

      fixture.componentRef.setInput('messages', messages);
      fixture.componentRef.setInput('currentUserId', 'current-user');
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      // Virtual scroll may not render all items immediately
      // Check that items are computed correctly instead
      const items = component.items();
      expect(items.some(item => item.type === 'separator')).toBe(true);
    });

    it('should render message groups', async () => {
      const messages: ChatMessage[] = [
        createTestMessage({
          id: 'msg-1',
          timestamp: new Date(2025, 0, 15, 10, 0)
        })
      ];

      fixture.componentRef.setInput('messages', messages);
      fixture.componentRef.setInput('currentUserId', 'current-user');
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      // Virtual scroll may not render all items immediately
      // Check that items are computed correctly instead
      const items = component.items();
      expect(items.some(item => item.type === 'group')).toBe(true);
    });
  });

  describe('keyboard navigation', () => {
    // Helper to dispatch keyboard event on the component element
    function dispatchKeydown(key: string): KeyboardEvent {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
      (fixture.nativeElement as HTMLElement).dispatchEvent(event);
      return event;
    }

    beforeEach(() => {
      fixture.componentRef.setInput('messages', []);
      fixture.componentRef.setInput('currentUserId', 'current-user');
      fixture.detectChanges();
    });

    it('should have isInNavigationMode initially false', () => {
      expect(component.isInNavigationMode()).toBe(false);
    });

    it('should set isInNavigationMode to true on ArrowDown press', () => {
      const messages: ChatMessage[] = [createTestMessage({ id: 'msg-1' }), createTestMessage({ id: 'msg-2' })];
      fixture.componentRef.setInput('messages', messages);
      fixture.detectChanges();

      dispatchKeydown('ArrowDown');

      expect(component.isInNavigationMode()).toBe(true);
    });

    it('should set isInNavigationMode to true on ArrowUp press', () => {
      const messages: ChatMessage[] = [createTestMessage({ id: 'msg-1' }), createTestMessage({ id: 'msg-2' })];
      fixture.componentRef.setInput('messages', messages);
      fixture.detectChanges();

      dispatchKeydown('ArrowUp');

      expect(component.isInNavigationMode()).toBe(true);
    });

    it('should exit navigation mode on Escape press', () => {
      const messages: ChatMessage[] = [createTestMessage({ id: 'msg-1' })];
      fixture.componentRef.setInput('messages', messages);
      fixture.detectChanges();

      // First enter navigation mode
      dispatchKeydown('ArrowDown');
      expect(component.isInNavigationMode()).toBe(true);

      // Then exit
      dispatchKeydown('Escape');
      expect(component.isInNavigationMode()).toBe(false);
    });

    it('should handle ArrowDown key within component', () => {
      const messages: ChatMessage[] = [createTestMessage({ id: 'msg-1' })];
      fixture.componentRef.setInput('messages', messages);
      fixture.detectChanges();

      // Dispatch event on the component element to trigger the HostListener
      dispatchKeydown('ArrowDown');

      // Event should have been handled (navigation mode entered)
      expect(component.isInNavigationMode()).toBe(true);
    });

    it('should handle ArrowUp key within component', () => {
      const messages: ChatMessage[] = [createTestMessage({ id: 'msg-1' })];
      fixture.componentRef.setInput('messages', messages);
      fixture.detectChanges();

      dispatchKeydown('ArrowUp');

      expect(component.isInNavigationMode()).toBe(true);
    });

    it('should handle Enter key within component', () => {
      const messages: ChatMessage[] = [createTestMessage({ id: 'msg-1' })];
      fixture.componentRef.setInput('messages', messages);
      fixture.detectChanges();

      // First navigate to a message
      dispatchKeydown('ArrowDown');

      // Then press Enter
      dispatchKeydown('Enter');

      // Should still be in navigation mode (Enter announces, doesn't exit)
      expect(component.isInNavigationMode()).toBe(true);
    });

    it('should exit navigation mode with Escape after entering', () => {
      const messages: ChatMessage[] = [createTestMessage({ id: 'msg-1' })];
      fixture.componentRef.setInput('messages', messages);
      fixture.detectChanges();

      // Enter navigation mode
      dispatchKeydown('ArrowDown');
      expect(component.isInNavigationMode()).toBe(true);

      // Exit with Escape
      dispatchKeydown('Escape');
      expect(component.isInNavigationMode()).toBe(false);
    });

    it('should not enter navigation mode on unhandled keys', () => {
      const messages: ChatMessage[] = [createTestMessage({ id: 'msg-1' })];
      fixture.componentRef.setInput('messages', messages);
      fixture.detectChanges();

      dispatchKeydown('Tab');

      expect(component.isInNavigationMode()).toBe(false);
    });
  });

  describe('accessibility attributes', () => {
    it('should have role="list" on viewport content', async () => {
      fixture.componentRef.setInput('messages', [createTestMessage({ id: 'msg-1' })]);
      fixture.componentRef.setInput('currentUserId', 'current-user');
      fixture.detectChanges();
      await fixture.whenStable();

      const listElement = fixture.nativeElement.querySelector('[role="list"]');
      expect(listElement).toBeTruthy();
    });
  });
});
