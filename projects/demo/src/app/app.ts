import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Attachment,
  ChatContainerComponent,
  ChatMessage,
  FileContent,
  ImageContent,
  MessageSendEvent,
  QuickReplySubmitEvent
} from 'ngx-support-chat';
import { MockChatService } from './services/mock-chat.service';

type DemoScenario = 'empty' | 'conversation' | 'performance' | 'all-types' | 'quick-replies' | 'failed';

/**
 * Demo application component showcasing ngx-support-chat features.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, ChatContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App implements OnInit {
  private readonly mockChat = inject(MockChatService);

  // Chat state from service
  readonly messages = this.mockChat.messages;
  readonly typing = this.mockChat.typing;
  readonly quickReplies = this.mockChat.quickReplies;

  // Local state
  readonly attachments = signal<Attachment[]>([]);
  readonly inputValue = signal('');
  readonly currentUserId = 'user-1';

  // Agent info
  readonly agent = signal({
    name: 'Support Agent',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=support-agent',
    status: 'Online' as 'Online' | 'Away' | 'Offline'
  });

  // Configuration panel state
  readonly containerWidth = signal(420);
  readonly containerHeight = signal(600);
  readonly activeScenario = signal<DemoScenario>('conversation');
  readonly showConfigPanel = signal(true);

  // Theme customization
  readonly themeTokens = signal<Record<string, string>>({});
  readonly primaryColor = signal('#2563eb');
  readonly userBubbleColor = signal('#2563eb');
  readonly agentBubbleColor = signal('#f3f4f6');

  // Event log for debugging
  readonly eventLog = signal<string[]>([]);
  readonly showEventLog = signal(false);

  // Computed styles
  readonly containerStyles = computed(() => {
    const tokens = this.themeTokens();
    const styles = Object.entries(tokens)
      .map(([key, value]) => `${key}: ${value}`)
      .join('; ');

    return styles || undefined;
  });

  ngOnInit(): void {
    this.mockChat.initialize();
    this.logEvent('Chat initialized');
  }

  // Event handlers
  onMessageSend(event: MessageSendEvent): void {
    this.logEvent(`Message sent: "${event.text}" with ${event.attachments.length} attachment(s)`);

    // Clear local state
    this.inputValue.set('');
    this.attachments.set([]);

    // Send via mock service
    this.mockChat.sendMessage(event);
  }

  onMessageRetry(message: ChatMessage): void {
    this.logEvent(`Retry message: ${message.id}`);
    this.mockChat.retryMessage(message);
  }

  onAttachmentSelect(files: File[]): void {
    this.logEvent(`Files selected: ${files.map(f => f.name).join(', ')}`);

    const newAttachments: Attachment[] = files.map((file, index) => {
      const base: Attachment = {
        id: `attachment-${Date.now()}-${index}`,
        file
      };

      if (file.type.startsWith('image/')) {
        base.previewUrl = URL.createObjectURL(file);
      }

      return base;
    });

    this.attachments.update(current => [...current, ...newAttachments]);
  }

  onAttachmentRemove(attachment: Attachment): void {
    this.logEvent(`Attachment removed: ${attachment.file.name}`);

    // Revoke object URL if it was created
    if (attachment.previewUrl) {
      URL.revokeObjectURL(attachment.previewUrl);
    }

    this.attachments.update(current => current.filter(a => a.id !== attachment.id));
  }

  onQuickReplySubmit(event: QuickReplySubmitEvent): void {
    this.logEvent(`Quick reply: ${event.type} = ${JSON.stringify(event.value)}`);
    this.mockChat.submitQuickReply(event);
  }

  onImagePreview(content: ImageContent): void {
    this.logEvent(`Image preview: ${content.fullUrl}`);
    // In a real app, this would open a lightbox
    window.open(content.fullUrl, '_blank');
  }

  onFileDownload(content: FileContent): void {
    this.logEvent(`File download: ${content.fileName}`);
    // In a real app, this would trigger a download
    console.log('Download file:', content);
  }

  onScrollTop(): void {
    this.logEvent('Scrolled to top - loading more messages');
    this.mockChat.loadMoreMessages();
  }

  // Configuration actions
  loadScenario(scenario: DemoScenario): void {
    this.activeScenario.set(scenario);
    this.mockChat.loadScenario(scenario);
    this.attachments.set([]);
    this.inputValue.set('');
    this.logEvent(`Loaded scenario: ${scenario}`);
  }

  showQuickReplyDemo(type: 'confirmation' | 'singleChoice' | 'multipleChoice'): void {
    this.mockChat.showQuickReply(type);
    this.logEvent(`Showing quick reply: ${type}`);
  }

  triggerFailedMessage(): void {
    this.mockChat.simulateFailedMessage();
    this.logEvent('Triggered failed message');
  }

  updateThemeToken(token: string, value: string): void {
    this.themeTokens.update(tokens => ({
      ...tokens,
      [token]: value
    }));
    this.logEvent(`Theme updated: ${token} = ${value}`);
  }

  applyPrimaryColor(): void {
    const color = this.primaryColor();
    this.updateThemeToken('--ngx-bubble-user-bg', color);
    this.updateThemeToken('--ngx-action-btn-bg', color);
    this.updateThemeToken('--ngx-quick-reply-selected-bg', color);
  }

  applyUserBubbleColor(): void {
    this.updateThemeToken('--ngx-bubble-user-bg', this.userBubbleColor());
  }

  applyAgentBubbleColor(): void {
    this.updateThemeToken('--ngx-bubble-agent-bg', this.agentBubbleColor());
  }

  resetTheme(): void {
    this.themeTokens.set({});
    this.primaryColor.set('#2563eb');
    this.userBubbleColor.set('#2563eb');
    this.agentBubbleColor.set('#f3f4f6');
    this.logEvent('Theme reset');
  }

  toggleConfigPanel(): void {
    this.showConfigPanel.update(show => !show);
  }

  toggleEventLog(): void {
    this.showEventLog.update(show => !show);
  }

  clearEventLog(): void {
    this.eventLog.set([]);
  }

  private logEvent(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    this.eventLog.update(log => [`[${timestamp}] ${message}`, ...log.slice(0, 49)]);
  }
}
