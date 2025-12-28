import { Injectable, signal, WritableSignal } from '@angular/core';
import {
  ChatMessage,
  QuickReplySet,
  QuickReplySubmitEvent,
  TypingIndicator,
  Attachment,
  MessageSendEvent,
  FileContent,
  ImageContent
} from 'ngx-support-chat';
import { INITIAL_MESSAGES, AGENT_RESPONSES, QUICK_REPLY_SCENARIOS, generatePerformanceMessages } from '../data/mock-messages';

/**
 * Mock chat service for demo application.
 * Simulates realistic chat interactions without a backend.
 */
@Injectable({ providedIn: 'root' })
export class MockChatService {
  // Internal state
  private readonly _messages: WritableSignal<ChatMessage[]> = signal([]);
  private readonly _typing: WritableSignal<TypingIndicator | null> = signal(null);
  private readonly _quickReplies: WritableSignal<QuickReplySet | null> = signal(null);

  // Public readonly signals
  readonly messages = this._messages.asReadonly();
  readonly typing = this._typing.asReadonly();
  readonly quickReplies = this._quickReplies.asReadonly();

  // Agent info
  readonly agent = {
    id: 'agent-1',
    name: 'Support Agent',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=support-agent',
    status: 'Online'
  };

  // User info
  readonly currentUser = {
    id: 'user-1',
    name: 'You'
  };

  // Message counter for unique IDs
  private messageCounter = 0;
  private responseIndex = 0;

  /**
   * Initialize the service with default messages.
   */
  initialize(): void {
    this._messages.set([...INITIAL_MESSAGES]);
    this.messageCounter = INITIAL_MESSAGES.length;
  }

  /**
   * Clear all messages and reset state.
   */
  reset(): void {
    this._messages.set([]);
    this._typing.set(null);
    this._quickReplies.set(null);
    this.messageCounter = 0;
    this.responseIndex = 0;
  }

  /**
   * Load a specific demo scenario.
   */
  loadScenario(scenario: 'empty' | 'conversation' | 'performance' | 'all-types' | 'quick-replies' | 'failed'): void {
    this.reset();

    switch (scenario) {
      case 'empty':
        // Keep empty
        break;

      case 'conversation':
        this._messages.set([...INITIAL_MESSAGES]);
        this.messageCounter = INITIAL_MESSAGES.length;
        break;

      case 'performance':
        this._messages.set(generatePerformanceMessages(500));
        this.messageCounter = 500;
        break;

      case 'all-types':
        this.loadAllTypesScenario();
        break;

      case 'quick-replies':
        this._messages.set([...INITIAL_MESSAGES]);
        this.messageCounter = INITIAL_MESSAGES.length;
        this.showQuickReply('singleChoice');
        break;

      case 'failed':
        this.loadFailedScenario();
        break;
    }
  }

  /**
   * Send a message from the user.
   */
  async sendMessage(event: MessageSendEvent): Promise<void> {
    const { text, attachments } = event;

    // Create user message(s)
    if (text.trim()) {
      const userMessage = this.createUserMessage('text', { text });
      this.addMessage(userMessage);
    }

    // Add attachment messages
    for (const attachment of attachments) {
      const attachmentMessage = this.createAttachmentMessage(attachment);
      this.addMessage(attachmentMessage);
    }

    // Simulate message status updates
    await this.simulateStatusUpdates();

    // Simulate agent typing and response
    await this.simulateAgentResponse(text);
  }

  /**
   * Retry a failed message.
   */
  async retryMessage(message: ChatMessage): Promise<void> {
    // Update message status to sending
    this._messages.update(messages =>
      messages.map(m => (m.id === message.id ? { ...m, status: 'sending' as const } : m))
    );

    // Simulate network delay
    await this.delay(1000 + Math.random() * 1000);

    // Simulate success (80% chance) or failure (20% chance)
    const success = Math.random() > 0.2;

    this._messages.update(messages =>
      messages.map(m => (m.id === message.id ? { ...m, status: success ? 'sent' : 'failed' } : m))
    );

    if (success) {
      // Continue with status updates
      await this.delay(500);
      this.updateMessageStatus(message.id, 'delivered');
      await this.delay(500);
      this.updateMessageStatus(message.id, 'read');
    }
  }

  /**
   * Handle quick reply submission.
   */
  submitQuickReply(event: QuickReplySubmitEvent): void {
    // Mark quick replies as submitted
    this._quickReplies.update(qr => (qr ? { ...qr, submitted: true, selectedValues: [event.value] } : null));

    // Add user's response as a message
    const responseText = this.formatQuickReplyResponse(event);
    const userMessage = this.createUserMessage('text', { text: responseText });
    this.addMessage(userMessage);

    // Clear quick replies after a delay
    setTimeout(() => {
      this._quickReplies.set(null);
    }, 500);

    // Simulate agent response
    this.simulateAgentResponse(responseText);
  }

  /**
   * Load more messages (for infinite scroll).
   */
  loadMoreMessages(): void {
    const olderMessages = generatePerformanceMessages(20, this.messageCounter);
    const currentMessages = this._messages();

    // Prepend older messages
    this._messages.set([...olderMessages, ...currentMessages]);
    this.messageCounter += 20;
  }

  /**
   * Show a specific quick reply type.
   */
  showQuickReply(type: 'confirmation' | 'singleChoice' | 'multipleChoice'): void {
    this._quickReplies.set({ ...QUICK_REPLY_SCENARIOS[type] });
  }

  /**
   * Simulate a failed message.
   */
  simulateFailedMessage(): void {
    const failedMessage = this.createUserMessage('text', { text: 'This message will fail to send...' });
    failedMessage.status = 'failed';
    this.addMessage(failedMessage);
  }

  // Private helper methods

  private createUserMessage(type: 'text', content: { text: string }): ChatMessage {
    this.messageCounter++;
    return {
      id: `msg-${this.messageCounter}`,
      type,
      senderId: this.currentUser.id,
      senderName: this.currentUser.name,
      timestamp: new Date(),
      status: 'sending',
      content
    };
  }

  private createAgentMessage(type: 'text' | 'system', content: { text: string }): ChatMessage {
    this.messageCounter++;

    const baseMessage = {
      id: `msg-${this.messageCounter}`,
      timestamp: new Date(),
      status: 'read' as const,
      content
    };

    if (type === 'system') {
      return {
        ...baseMessage,
        type: 'system',
        senderId: 'system',
        senderName: 'System'
      };
    }

    return {
      ...baseMessage,
      type: 'text',
      senderId: this.agent.id,
      senderName: this.agent.name,
      senderAvatar: this.agent.avatar
    };
  }

  private createAttachmentMessage(attachment: Attachment): ChatMessage {
    this.messageCounter++;
    const isImage = attachment.file.type.startsWith('image/');

    if (isImage) {
      const content: ImageContent = {
        thumbnailUrl: attachment.previewUrl || 'https://via.placeholder.com/200x150',
        fullUrl: attachment.previewUrl || 'https://via.placeholder.com/800x600',
        altText: attachment.file.name,
        width: 200,
        height: 150
      };
      return {
        id: `msg-${this.messageCounter}`,
        type: 'image',
        senderId: this.currentUser.id,
        senderName: this.currentUser.name,
        timestamp: new Date(),
        status: 'sending',
        content
      };
    } else {
      const content: FileContent = {
        fileName: attachment.file.name,
        fileSize: attachment.file.size,
        fileType: attachment.file.type || 'application/octet-stream',
        downloadUrl: '#'
      };
      return {
        id: `msg-${this.messageCounter}`,
        type: 'file',
        senderId: this.currentUser.id,
        senderName: this.currentUser.name,
        timestamp: new Date(),
        status: 'sending',
        content
      };
    }
  }

  private addMessage(message: ChatMessage): void {
    this._messages.update(messages => [...messages, message]);
  }

  private updateMessageStatus(messageId: string, status: ChatMessage['status']): void {
    this._messages.update(messages =>
      messages.map(m => (m.id === messageId ? { ...m, status } : m))
    );
  }

  private async simulateStatusUpdates(): Promise<void> {
    const messages = this._messages();
    const sendingMessages = messages.filter(m => m.status === 'sending');

    for (const msg of sendingMessages) {
      await this.delay(300);
      this.updateMessageStatus(msg.id, 'sent');
      await this.delay(300);
      this.updateMessageStatus(msg.id, 'delivered');
    }
  }

  private async simulateAgentResponse(userMessage: string): Promise<void> {
    // Start typing indicator
    await this.delay(500);
    this._typing.set({
      userId: this.agent.id,
      userName: this.agent.name,
      avatar: this.agent.avatar
    });

    // Simulate typing duration
    await this.delay(1500 + Math.random() * 2000);

    // Stop typing
    this._typing.set(null);

    // Add agent response
    const response = this.getAgentResponse(userMessage);
    const agentMessage = this.createAgentMessage('text', { text: response });
    this.addMessage(agentMessage);

    // Update user message to read
    const messages = this._messages();
    const userMessages = messages.filter(m => m.senderId === this.currentUser.id && m.status === 'delivered');
    for (const msg of userMessages) {
      this.updateMessageStatus(msg.id, 'read');
    }

    // Possibly show quick replies
    if (this.shouldShowQuickReplies(userMessage)) {
      await this.delay(500);
      this.showQuickReply(this.getQuickReplyType(userMessage));
    }
  }

  private getAgentResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();

    // Check for keyword-based responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return AGENT_RESPONSES.greeting;
    }
    if (lowerMessage.includes('help')) {
      return AGENT_RESPONSES.help;
    }
    if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return AGENT_RESPONSES.pricing;
    }
    if (lowerMessage.includes('thank')) {
      return AGENT_RESPONSES.thanks;
    }
    if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
      return AGENT_RESPONSES.goodbye;
    }

    // Cycle through generic responses
    const genericResponses = AGENT_RESPONSES.generic;
    const response = genericResponses[this.responseIndex % genericResponses.length] ?? 'How can I help you?';
    this.responseIndex++;
    return response;
  }

  private shouldShowQuickReplies(userMessage: string): boolean {
    const lowerMessage = userMessage.toLowerCase();
    return (
      lowerMessage.includes('help') ||
      lowerMessage.includes('option') ||
      lowerMessage.includes('choose') ||
      lowerMessage.includes('prefer')
    );
  }

  private getQuickReplyType(userMessage: string): 'confirmation' | 'singleChoice' | 'multipleChoice' {
    const lowerMessage = userMessage.toLowerCase();
    if (lowerMessage.includes('confirm') || lowerMessage.includes('yes or no')) {
      return 'confirmation';
    }
    if (lowerMessage.includes('multiple') || lowerMessage.includes('several')) {
      return 'multipleChoice';
    }
    return 'singleChoice';
  }

  private formatQuickReplyResponse(event: QuickReplySubmitEvent): string {
    if (event.type === 'confirmation') {
      return event.value ? 'Yes' : 'No';
    }
    if (Array.isArray(event.value)) {
      return event.value.join(', ');
    }
    return String(event.value);
  }

  private loadAllTypesScenario(): void {
    const messages: ChatMessage[] = [
      // System message
      {
        id: 'demo-1',
        type: 'system',
        senderId: 'system',
        senderName: 'System',
        timestamp: new Date(Date.now() - 3600000),
        status: 'read',
        content: { text: 'Chat session started' }
      },
      // Agent greeting
      {
        id: 'demo-2',
        type: 'text',
        senderId: this.agent.id,
        senderName: this.agent.name,
        senderAvatar: this.agent.avatar,
        timestamp: new Date(Date.now() - 3500000),
        status: 'read',
        content: { text: 'Hello! Welcome to our support chat. How can I help you today?' }
      },
      // User text message
      {
        id: 'demo-3',
        type: 'text',
        senderId: this.currentUser.id,
        senderName: this.currentUser.name,
        timestamp: new Date(Date.now() - 3400000),
        status: 'read',
        content: { text: 'Hi! I need help with my order.' }
      },
      // Agent with markdown
      {
        id: 'demo-4',
        type: 'text',
        senderId: this.agent.id,
        senderName: this.agent.name,
        senderAvatar: this.agent.avatar,
        timestamp: new Date(Date.now() - 3300000),
        status: 'read',
        content: { text: 'Of course! I can help with:\n\n- **Order status**\n- **Returns & refunds**\n- **Shipping questions**\n\nWhat would you like to know?' }
      },
      // User image message
      {
        id: 'demo-5',
        type: 'image',
        senderId: this.currentUser.id,
        senderName: this.currentUser.name,
        timestamp: new Date(Date.now() - 3200000),
        status: 'read',
        content: {
          thumbnailUrl: 'https://picsum.photos/200/150?random=1',
          fullUrl: 'https://picsum.photos/800/600?random=1',
          altText: 'Screenshot of the issue',
          width: 200,
          height: 150
        }
      },
      // User file message
      {
        id: 'demo-6',
        type: 'file',
        senderId: this.currentUser.id,
        senderName: this.currentUser.name,
        timestamp: new Date(Date.now() - 3100000),
        status: 'read',
        content: {
          fileName: 'order-receipt.pdf',
          fileSize: 245760,
          fileType: 'application/pdf',
          downloadUrl: '#'
        }
      },
      // Agent response
      {
        id: 'demo-7',
        type: 'text',
        senderId: this.agent.id,
        senderName: this.agent.name,
        senderAvatar: this.agent.avatar,
        timestamp: new Date(Date.now() - 3000000),
        status: 'read',
        content: { text: 'Thank you for sharing those. I can see the issue now. Let me check what we can do.' }
      },
      // Failed message
      {
        id: 'demo-8',
        type: 'text',
        senderId: this.currentUser.id,
        senderName: this.currentUser.name,
        timestamp: new Date(Date.now() - 2900000),
        status: 'failed',
        content: { text: 'This message failed to send - click retry!' }
      },
      // Sending message
      {
        id: 'demo-9',
        type: 'text',
        senderId: this.currentUser.id,
        senderName: this.currentUser.name,
        timestamp: new Date(Date.now() - 100000),
        status: 'sending',
        content: { text: 'This message is still sending...' }
      },
      // Delivered message
      {
        id: 'demo-10',
        type: 'text',
        senderId: this.currentUser.id,
        senderName: this.currentUser.name,
        timestamp: new Date(Date.now() - 50000),
        status: 'delivered',
        content: { text: 'This message has been delivered!' }
      }
    ];

    this._messages.set(messages);
    this.messageCounter = messages.length;
  }

  private loadFailedScenario(): void {
    const messages: ChatMessage[] = [
      {
        id: 'fail-1',
        type: 'system',
        senderId: 'system',
        senderName: 'System',
        timestamp: new Date(Date.now() - 60000),
        status: 'read',
        content: { text: 'Network connection unstable' }
      },
      {
        id: 'fail-2',
        type: 'text',
        senderId: this.currentUser.id,
        senderName: this.currentUser.name,
        timestamp: new Date(Date.now() - 50000),
        status: 'failed',
        content: { text: 'First failed message - click retry' }
      },
      {
        id: 'fail-3',
        type: 'text',
        senderId: this.currentUser.id,
        senderName: this.currentUser.name,
        timestamp: new Date(Date.now() - 40000),
        status: 'failed',
        content: { text: 'Second failed message - click retry' }
      },
      {
        id: 'fail-4',
        type: 'text',
        senderId: this.currentUser.id,
        senderName: this.currentUser.name,
        timestamp: new Date(Date.now() - 30000),
        status: 'sending',
        content: { text: 'This one is still trying to send...' }
      }
    ];

    this._messages.set(messages);
    this.messageCounter = messages.length;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
