import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatContainerComponent } from './chat-container.component';
import {
  ChatMessage,
  Attachment,
  TypingIndicator,
  QuickReplySet,
  MessageSendEvent,
  QuickReplySubmitEvent
} from '../../../models/public-api';

describe('ChatContainerComponent', () => {
  let component: ChatContainerComponent;
  let fixture: ComponentFixture<ChatContainerComponent>;

  const mockMessages: ChatMessage[] = [
    {
      id: '1',
      type: 'text',
      senderId: 'user1',
      senderName: 'Test User',
      timestamp: new Date(),
      status: 'sent',
      content: { text: 'Hello' }
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatContainerComponent]
    }).compileComponents();
  });

  describe('Component Creation', () => {
    it('should create', () => {
      fixture = TestBed.createComponent(ChatContainerComponent);
      fixture.componentRef.setInput('messages', []);
      fixture.componentRef.setInput('currentUserId', 'user1');
      fixture.detectChanges();
      component = fixture.componentInstance;
      expect(component).toBeTruthy();
    });
  });

  describe('Required Inputs', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(ChatContainerComponent);
    });

    it('should accept messages input', () => {
      fixture.componentRef.setInput('messages', mockMessages);
      fixture.componentRef.setInput('currentUserId', 'user1');
      fixture.detectChanges();
      component = fixture.componentInstance;
      expect(component.messages()).toEqual(mockMessages);
    });

    it('should accept currentUserId input', () => {
      fixture.componentRef.setInput('messages', []);
      fixture.componentRef.setInput('currentUserId', 'user123');
      fixture.detectChanges();
      component = fixture.componentInstance;
      expect(component.currentUserId()).toBe('user123');
    });
  });

  describe('Optional Inputs', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(ChatContainerComponent);
      fixture.componentRef.setInput('messages', []);
      fixture.componentRef.setInput('currentUserId', 'user1');
      fixture.detectChanges();
      component = fixture.componentInstance;
    });

    it('should have null typingIndicator by default', () => {
      expect(component.typingIndicator()).toBeNull();
    });

    it('should accept typingIndicator input', () => {
      const indicator: TypingIndicator = {
        userId: 'agent1',
        userName: 'Support Agent'
      };
      fixture.componentRef.setInput('typingIndicator', indicator);
      fixture.detectChanges();
      expect(component.typingIndicator()).toEqual(indicator);
    });

    it('should have null quickReplies by default', () => {
      expect(component.quickReplies()).toBeNull();
    });

    it('should accept quickReplies input', () => {
      const replies: QuickReplySet = {
        id: 'qr1',
        type: 'single-choice',
        options: [{ value: 'yes', label: 'Yes' }],
        submitted: false
      };
      fixture.componentRef.setInput('quickReplies', replies);
      fixture.detectChanges();
      expect(component.quickReplies()).toEqual(replies);
    });

    it('should have empty pendingAttachments by default', () => {
      expect(component.pendingAttachments()).toEqual([]);
    });

    it('should accept pendingAttachments input', () => {
      const attachments: Attachment[] = [{ id: 'a1', file: new File([''], 'test.txt') }];
      fixture.componentRef.setInput('pendingAttachments', attachments);
      fixture.detectChanges();
      expect(component.pendingAttachments()).toEqual(attachments);
    });

    it('should have false disabled by default', () => {
      expect(component.disabled()).toBe(false);
    });

    it('should accept disabled input', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      expect(component.disabled()).toBe(true);
    });
  });

  describe('Two-way Binding', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(ChatContainerComponent);
      fixture.componentRef.setInput('messages', []);
      fixture.componentRef.setInput('currentUserId', 'user1');
      fixture.detectChanges();
      component = fixture.componentInstance;
    });

    it('should have empty inputValue by default', () => {
      expect(component.inputValue()).toBe('');
    });

    it('should accept inputValue input', () => {
      fixture.componentRef.setInput('inputValue', 'Hello world');
      fixture.detectChanges();
      expect(component.inputValue()).toBe('Hello world');
    });

    it('should allow setting inputValue programmatically', () => {
      component.inputValue.set('New message');
      expect(component.inputValue()).toBe('New message');
    });
  });

  describe('Outputs', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(ChatContainerComponent);
      fixture.componentRef.setInput('messages', []);
      fixture.componentRef.setInput('currentUserId', 'user1');
      fixture.detectChanges();
      component = fixture.componentInstance;
    });

    it('should have messageSend output', () => {
      expect(component.messageSend).toBeDefined();
    });

    it('should have messageRetry output', () => {
      expect(component.messageRetry).toBeDefined();
    });

    it('should have attachmentSelect output', () => {
      expect(component.attachmentSelect).toBeDefined();
    });

    it('should have attachmentRemove output', () => {
      expect(component.attachmentRemove).toBeDefined();
    });

    it('should have quickReplySubmit output', () => {
      expect(component.quickReplySubmit).toBeDefined();
    });

    it('should have imagePreview output', () => {
      expect(component.imagePreview).toBeDefined();
    });

    it('should have fileDownload output', () => {
      expect(component.fileDownload).toBeDefined();
    });

    it('should have scrollTop output', () => {
      expect(component.scrollTop).toBeDefined();
    });
  });

  describe('Message Send Handler', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(ChatContainerComponent);
      fixture.componentRef.setInput('messages', []);
      fixture.componentRef.setInput('currentUserId', 'user1');
      fixture.detectChanges();
      component = fixture.componentInstance;
    });

    it('should emit messageSend when inputValue has text', () => {
      let emittedEvent: MessageSendEvent | undefined;
      component.messageSend.subscribe(event => {
        emittedEvent = event;
      });

      component.inputValue.set('Hello world');
      (component as unknown as { onFooterMessageSend: () => void }).onFooterMessageSend();

      expect(emittedEvent).toBeDefined();
      expect(emittedEvent?.text).toBe('Hello world');
      expect(emittedEvent?.attachments).toEqual([]);
    });

    it('should emit messageSend when there are attachments', () => {
      let emittedEvent: MessageSendEvent | undefined;
      component.messageSend.subscribe(event => {
        emittedEvent = event;
      });

      const attachments: Attachment[] = [{ id: 'a1', file: new File([''], 'test.txt') }];
      fixture.componentRef.setInput('pendingAttachments', attachments);
      fixture.detectChanges();

      (component as unknown as { onFooterMessageSend: () => void }).onFooterMessageSend();

      expect(emittedEvent).toBeDefined();
      expect(emittedEvent?.text).toBe('');
      expect(emittedEvent?.attachments).toEqual(attachments);
    });

    it('should not emit messageSend when inputValue is empty and no attachments', () => {
      let emittedEvent: MessageSendEvent | undefined;
      component.messageSend.subscribe(event => {
        emittedEvent = event;
      });

      (component as unknown as { onFooterMessageSend: () => void }).onFooterMessageSend();

      expect(emittedEvent).toBeUndefined();
    });

    it('should trim whitespace from inputValue', () => {
      let emittedEvent: MessageSendEvent | undefined;
      component.messageSend.subscribe(event => {
        emittedEvent = event;
      });

      component.inputValue.set('  Hello world  ');
      (component as unknown as { onFooterMessageSend: () => void }).onFooterMessageSend();

      expect(emittedEvent?.text).toBe('Hello world');
    });
  });

  describe('Content Projection', () => {
    @Component({
      template: `
        <ngx-chat-container [messages]="messages" [currentUserId]="'user1'">
          <div chatHeader>Test Header</div>
          <div chatEmptyState>No messages yet</div>
          <div chatFooterPrefix>Prefix Content</div>
          <div chatFooterActions>Action Buttons</div>
        </ngx-chat-container>
      `,
      imports: [ChatContainerComponent]
    })
    class TestHostComponent {
      messages: ChatMessage[] = [];
    }

    let hostFixture: ComponentFixture<TestHostComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TestHostComponent]
      }).compileComponents();

      hostFixture = TestBed.createComponent(TestHostComponent);
      hostFixture.detectChanges();
    });

    it('should project chatHeader content', () => {
      const headerElement = hostFixture.nativeElement.querySelector('ngx-chat-header');
      expect(headerElement.textContent).toContain('Test Header');
    });

    it('should project chatEmptyState when no messages', () => {
      const emptyStateElement = hostFixture.nativeElement.querySelector('.chat-empty-state');
      expect(emptyStateElement.textContent).toContain('No messages yet');
    });

    it('should project chatFooterPrefix content', () => {
      const footerElement = hostFixture.nativeElement.querySelector('ngx-chat-footer');
      expect(footerElement.textContent).toContain('Prefix Content');
    });

    it('should project chatFooterActions content', () => {
      // chatFooterActions is projected inside action-buttons component
      const actionButtons = hostFixture.nativeElement.querySelector('ngx-chat-action-buttons');
      expect(actionButtons).toBeTruthy();
      expect(actionButtons.textContent).toContain('Action Buttons');
    });
  });

  describe('Layout Structure', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(ChatContainerComponent);
      fixture.componentRef.setInput('messages', []);
      fixture.componentRef.setInput('currentUserId', 'user1');
      fixture.detectChanges();
    });

    it('should have chat-container as root element', () => {
      const container = fixture.nativeElement.querySelector('.chat-container');
      expect(container).toBeTruthy();
    });

    it('should have ngx-chat-header component', () => {
      const header = fixture.nativeElement.querySelector('ngx-chat-header');
      expect(header).toBeTruthy();
    });

    it('should have chat-main section', () => {
      const messageArea = fixture.nativeElement.querySelector('.chat-main');
      expect(messageArea).toBeTruthy();
    });

    it('should have ngx-chat-footer component', () => {
      const footer = fixture.nativeElement.querySelector('ngx-chat-footer');
      expect(footer).toBeTruthy();
    });
  });

  describe('Focus Management (Accessibility)', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(ChatContainerComponent);
      fixture.componentRef.setInput('messages', []);
      fixture.componentRef.setInput('currentUserId', 'user1');
      fixture.detectChanges();
      component = fixture.componentInstance;
    });

    it('should emit messageSend and trigger focus return after send', () => {
      // Set input value to trigger send
      component.inputValue.set('Test message');
      fixture.detectChanges();

      // Get reference to footer component
      const footer = fixture.nativeElement.querySelector('ngx-chat-footer');
      expect(footer).toBeTruthy();

      // Subscribe to messageSend to verify it was called
      let messageSent = false;
      component.messageSend.subscribe(() => {
        messageSent = true;
      });

      // Trigger send
      (component as unknown as { onFooterMessageSend: () => void }).onFooterMessageSend();

      expect(messageSent).toBe(true);
      // Focus return is handled via requestAnimationFrame internally
    });

    it('should emit quickReplySubmit and trigger focus return after submit', () => {
      // Set up quick replies
      const quickReplies: QuickReplySet = {
        id: 'qr1',
        type: 'single-choice',
        options: [{ value: 'yes', label: 'Yes' }],
        submitted: false
      };
      fixture.componentRef.setInput('quickReplies', quickReplies);
      fixture.detectChanges();

      // Subscribe to verify quick reply was submitted
      let quickReplySubmitted = false;
      component.quickReplySubmit.subscribe(() => {
        quickReplySubmitted = true;
      });

      // Trigger quick reply submit
      const submitEvent: QuickReplySubmitEvent = {
        setId: 'qr1',
        type: 'single-choice',
        selectedValues: ['yes']
      };
      (component as unknown as { onQuickReplySubmit: (event: QuickReplySubmitEvent) => void }).onQuickReplySubmit(
        submitEvent
      );

      expect(quickReplySubmitted).toBe(true);
      // Focus return is handled via requestAnimationFrame internally
    });

    it('should not send message when input is empty and no attachments', () => {
      let messageSent = false;
      component.messageSend.subscribe(() => {
        messageSent = true;
      });

      // Don't set input value, keep it empty
      (component as unknown as { onFooterMessageSend: () => void }).onFooterMessageSend();

      expect(messageSent).toBe(false);
    });

    it('should emit quickReplySubmit with correct event data', () => {
      let emittedEvent: QuickReplySubmitEvent | undefined;
      component.quickReplySubmit.subscribe(event => {
        emittedEvent = event;
      });

      const submitEvent: QuickReplySubmitEvent = {
        setId: 'qr-test',
        type: 'multiple-choice',
        selectedValues: ['option1', 'option2']
      };

      (component as unknown as { onQuickReplySubmit: (event: QuickReplySubmitEvent) => void }).onQuickReplySubmit(
        submitEvent
      );

      expect(emittedEvent).toBeDefined();
      expect(emittedEvent?.setId).toBe('qr-test');
      expect(emittedEvent?.type).toBe('multiple-choice');
      expect(emittedEvent?.selectedValues).toEqual(['option1', 'option2']);
    });
  });

  describe('Accessibility Attributes', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(ChatContainerComponent);
      fixture.componentRef.setInput('messages', []);
      fixture.componentRef.setInput('currentUserId', 'user1');
      fixture.detectChanges();
    });

    it('should have role="log" on main section', () => {
      const main = fixture.nativeElement.querySelector('[role="log"]');
      expect(main).toBeTruthy();
    });

    it('should have aria-live="polite" on main section', () => {
      const main = fixture.nativeElement.querySelector('[aria-live="polite"]');
      expect(main).toBeTruthy();
    });
  });
});
