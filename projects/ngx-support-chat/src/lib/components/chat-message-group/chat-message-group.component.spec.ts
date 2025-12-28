import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { ChatMessage } from '../../../models/chat-message.model';
import { FileContent, ImageContent } from '../../../models/content-types.model';
import { CHAT_CONFIG, DEFAULT_CHAT_CONFIG } from '../../../tokens/chat-config.token';
import { MessageGroup } from '../../utils/message-grouping.util';

import { ChatMessageGroupComponent } from './chat-message-group.component';

// Helper to create test messages
function createTestMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: 'msg-1',
    type: 'text',
    senderId: 'user-1',
    senderName: 'John Doe',
    timestamp: new Date(2025, 0, 15, 10, 30),
    status: 'sent',
    content: { text: 'Hello!' },
    ...overrides
  };
}

// Helper to create test groups
function createTestGroup(overrides: Partial<MessageGroup> = {}): MessageGroup {
  return {
    senderId: 'user-1',
    senderName: 'John Doe',
    isCurrentUser: false,
    messages: [
      createTestMessage({ id: 'msg-1' }),
      createTestMessage({ id: 'msg-2', content: { text: 'Second message' } }),
      createTestMessage({ id: 'msg-3', content: { text: 'Third message' } })
    ],
    ...overrides
  };
}

describe('ChatMessageGroupComponent', () => {
  let fixture: ComponentFixture<ChatMessageGroupComponent>;
  let component: ChatMessageGroupComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatMessageGroupComponent],
      providers: [{ provide: CHAT_CONFIG, useValue: DEFAULT_CHAT_CONFIG }]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatMessageGroupComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('group', createTestGroup());
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('message rendering', () => {
    it('should render all messages in the group', () => {
      const group = createTestGroup();
      fixture.componentRef.setInput('group', group);
      fixture.detectChanges();

      const messageElements = fixture.nativeElement.querySelectorAll('ngx-chat-message');
      expect(messageElements.length).toBe(3);
    });

    it('should render single message group correctly', () => {
      const group = createTestGroup({
        messages: [createTestMessage({ id: 'only-msg' })]
      });
      fixture.componentRef.setInput('group', group);
      fixture.detectChanges();

      const messageElements = fixture.nativeElement.querySelectorAll('ngx-chat-message');
      expect(messageElements.length).toBe(1);
    });

    it('should apply user class for current user groups', () => {
      fixture.componentRef.setInput('group', createTestGroup({ isCurrentUser: true }));
      fixture.detectChanges();

      const groupEl = fixture.nativeElement.querySelector('.message-group--user');
      expect(groupEl).toBeTruthy();
    });

    it('should not apply user class for other user groups', () => {
      fixture.componentRef.setInput('group', createTestGroup({ isCurrentUser: false }));
      fixture.detectChanges();

      const groupEl = fixture.nativeElement.querySelector('.message-group--user');
      expect(groupEl).toBeFalsy();
    });
  });

  describe('isFirst and isLast', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('group', createTestGroup());
      fixture.detectChanges();
    });

    it('should identify first message', () => {
      expect(component.isFirst(0)).toBe(true);
      expect(component.isFirst(1)).toBe(false);
      expect(component.isFirst(2)).toBe(false);
    });

    it('should identify last message', () => {
      expect(component.isLast(0)).toBe(false);
      expect(component.isLast(1)).toBe(false);
      expect(component.isLast(2)).toBe(true);
    });

    it('should handle single message group', () => {
      fixture.componentRef.setInput(
        'group',
        createTestGroup({
          messages: [createTestMessage()]
        })
      );
      fixture.detectChanges();

      expect(component.isFirst(0)).toBe(true);
      expect(component.isLast(0)).toBe(true);
    });
  });

  describe('trackByMessageId', () => {
    it('should return message id for tracking', () => {
      fixture.componentRef.setInput('group', createTestGroup());
      fixture.detectChanges();

      const result = component.trackByMessageId(0, { id: 'test-id' });
      expect(result).toBe('test-id');
    });
  });

  describe('input forwarding', () => {
    it('should forward showAvatar input', () => {
      fixture.componentRef.setInput('group', createTestGroup());
      fixture.componentRef.setInput('showAvatar', false);
      fixture.detectChanges();

      expect(component.showAvatar()).toBe(false);
    });

    it('should forward showSenderName input', () => {
      fixture.componentRef.setInput('group', createTestGroup());
      fixture.componentRef.setInput('showSenderName', false);
      fixture.detectChanges();

      expect(component.showSenderName()).toBe(false);
    });

    it('should default showAvatar to true', () => {
      fixture.componentRef.setInput('group', createTestGroup());
      fixture.detectChanges();

      expect(component.showAvatar()).toBe(true);
    });

    it('should default showSenderName to true', () => {
      fixture.componentRef.setInput('group', createTestGroup());
      fixture.detectChanges();

      expect(component.showSenderName()).toBe(true);
    });
  });

  describe('event propagation', () => {
    it('should emit messageRetry when child emits', () => {
      fixture.componentRef.setInput('group', createTestGroup());
      fixture.detectChanges();

      const spy = vi.fn();
      component.messageRetry.subscribe(spy);

      // Simulate event from child
      const childComponent = fixture.debugElement.children[0].children[0].componentInstance;
      childComponent.messageRetry.emit('msg-1');

      expect(spy).toHaveBeenCalledWith('msg-1');
    });

    it('should emit imagePreview when child emits', () => {
      const imageContent: ImageContent = {
        thumbnailUrl: 'thumb.jpg',
        fullUrl: 'full.jpg'
      };

      fixture.componentRef.setInput('group', createTestGroup());
      fixture.detectChanges();

      const spy = vi.fn();
      component.imagePreview.subscribe(spy);

      const childComponent = fixture.debugElement.children[0].children[0].componentInstance;
      childComponent.imagePreview.emit(imageContent);

      expect(spy).toHaveBeenCalledWith(imageContent);
    });

    it('should emit fileDownload when child emits', () => {
      const fileContent: FileContent = {
        fileName: 'doc.pdf',
        fileType: 'pdf',
        downloadUrl: 'url'
      };

      fixture.componentRef.setInput('group', createTestGroup());
      fixture.detectChanges();

      const spy = vi.fn();
      component.fileDownload.subscribe(spy);

      const childComponent = fixture.debugElement.children[0].children[0].componentInstance;
      childComponent.fileDownload.emit(fileContent);

      expect(spy).toHaveBeenCalledWith(fileContent);
    });
  });

  describe('accessibility', () => {
    it('should render messages in a container element', () => {
      fixture.componentRef.setInput('group', createTestGroup());
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('.message-group');
      expect(container).toBeTruthy();
    });
  });
});
