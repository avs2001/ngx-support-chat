import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  input,
  OnDestroy,
  output,
  signal,
  viewChild
} from '@angular/core';

import { ChatMessage } from '../../../models/chat-message.model';
import { FileContent, ImageContent } from '../../../models/content-types.model';
import { ChatDateSeparatorComponent } from '../chat-date-separator/chat-date-separator.component';
import { ChatMessageGroupComponent } from '../chat-message-group/chat-message-group.component';
import { groupMessagesByDate, GroupedMessages, MessageGroup } from '../../utils/message-grouping.util';
import { ChatAnnouncerService } from '../../services/chat-announcer.service';

/**
 * Union type for items that can be rendered in the message area.
 */
export type MessageAreaItem =
  | { type: 'separator'; date: Date }
  | { type: 'group'; group: MessageGroup };

/**
 * Component for displaying a scrollable list of chat messages.
 * Uses CDK virtual scrolling for performance with large message lists.
 * Groups messages by date and sender automatically.
 */
@Component({
  selector: 'ngx-chat-message-area',
  standalone: true,
  imports: [ScrollingModule, ChatDateSeparatorComponent, ChatMessageGroupComponent],
  templateUrl: './chat-message-area.component.html',
  styleUrl: './chat-message-area.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatMessageAreaComponent implements AfterViewInit, OnDestroy {
  /** Array of chat messages to display */
  readonly messages = input.required<ChatMessage[]>();

  /** Current user's ID for message alignment */
  readonly currentUserId = input.required<string>();

  /** Whether to show avatars */
  readonly showAvatars = input<boolean>(true);

  /** Whether to show sender names */
  readonly showSenderNames = input<boolean>(true);

  /** Item size in pixels for virtual scrolling */
  readonly itemSize = input<number>(80);

  /** Whether to auto-scroll to bottom when new messages arrive */
  readonly autoScrollToBottom = input<boolean>(true);

  /** Emitted when retry is clicked on a failed message */
  readonly messageRetry = output<string>();

  /** Emitted when an image is clicked for preview */
  readonly imagePreview = output<ImageContent>();

  /** Emitted when a file download is requested */
  readonly fileDownload = output<FileContent>();

  /** Emitted when the user scrolls */
  readonly scrolled = output<{ offset: number; isAtBottom: boolean }>();

  /** Reference to the virtual scroll viewport */
  readonly viewport = viewChild<CdkVirtualScrollViewport>('viewport');

  private readonly elementRef = inject(ElementRef);
  private readonly announcer = inject(ChatAnnouncerService);
  private resizeObserver: ResizeObserver | null = null;
  private lastMessageCount = signal(0);

  /** Index of currently focused message in the flat message list */
  private readonly focusedMessageIndex = signal<number>(-1);

  /** Whether keyboard navigation mode is active */
  readonly isInNavigationMode = signal(false);

  /**
   * Groups messages by date and then by sender.
   */
  readonly groupedMessages = computed((): GroupedMessages[] => {
    return groupMessagesByDate(this.messages(), this.currentUserId());
  });

  /**
   * Flattens grouped messages into a renderable item list.
   * Includes date separators and message groups.
   */
  readonly items = computed((): MessageAreaItem[] => {
    const groups = this.groupedMessages();
    const result: MessageAreaItem[] = [];

    for (const dateGroup of groups) {
      // Add date separator
      result.push({ type: 'separator', date: dateGroup.date });

      // Add all message groups for this date
      for (const group of dateGroup.groups) {
        result.push({ type: 'group', group });
      }
    }

    return result;
  });

  /**
   * Track items for efficient rendering.
   */
  trackByItem(index: number, item: MessageAreaItem): string {
    if (item.type === 'separator') {
      return `sep-${String(item.date.getTime())}`;
    }
    // Use first message ID as group identifier
    const firstMessage = item.group.messages[0];
    return `grp-${firstMessage?.id ?? String(index)}`;
  }

  ngAfterViewInit(): void {
    this.setupScrollListener();
    this.setupResizeObserver();
    this.scrollToBottomIfNeeded();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  /**
   * Scrolls to the bottom of the message list.
   */
  scrollToBottom(behavior: ScrollBehavior = 'smooth'): void {
    const vp = this.viewport();
    if (vp) {
      try {
        vp.scrollTo({ bottom: 0, behavior });
      } catch {
        // scrollTo may not be available in test environments (JSDOM)
      }
    }
  }

  /**
   * Checks if the viewport is scrolled to the bottom.
   */
  isScrolledToBottom(): boolean {
    const vp = this.viewport();
    if (!vp) return true;

    const bottomOffset = vp.measureScrollOffset('bottom');
    // Consider "at bottom" if within 50px
    return bottomOffset <= 50;
  }

  private setupScrollListener(): void {
    const vp = this.viewport();
    if (!vp) return;

    vp.elementScrolled().subscribe(() => {
      const offset = vp.measureScrollOffset('top');
      const isAtBottom = this.isScrolledToBottom();
      this.scrolled.emit({ offset, isAtBottom });
    });
  }

  private setupResizeObserver(): void {
    if (typeof ResizeObserver === 'undefined') return;

    this.resizeObserver = new ResizeObserver(() => {
      // Re-check scroll position on resize
      if (this.autoScrollToBottom() && this.isScrolledToBottom()) {
        this.scrollToBottom('auto');
      }
    });

    const el = this.elementRef.nativeElement as Element;
    this.resizeObserver.observe(el);
  }

  private scrollToBottomIfNeeded(): void {
    const currentCount = this.messages().length;
    const previousCount = this.lastMessageCount();

    if (this.autoScrollToBottom() && currentCount > previousCount) {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        this.scrollToBottom('smooth');
      });
    }

    this.lastMessageCount.set(currentCount);
  }

  /**
   * Type guard for separator items.
   */
  isSeparator(item: MessageAreaItem): item is { type: 'separator'; date: Date } {
    return item.type === 'separator';
  }

  /**
   * Type guard for group items.
   */
  isGroup(item: MessageAreaItem): item is { type: 'group'; group: MessageGroup } {
    return item.type === 'group';
  }

  /**
   * Flat list of all messages for keyboard navigation.
   */
  private readonly flatMessages = computed((): ChatMessage[] => {
    return this.messages();
  });

  /**
   * Handle keyboard events for message navigation.
   */
  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    // Only handle navigation when the message area or a message is focused
    const target = event.target as HTMLElement;
    const isInMessageArea = this.elementRef.nativeElement.contains(target);
    if (!isInMessageArea) return;

    switch (event.key) {
      case 'ArrowUp':
        this.focusPreviousMessage();
        event.preventDefault();
        break;
      case 'ArrowDown':
        this.focusNextMessage();
        event.preventDefault();
        break;
      case 'Enter':
        this.announceCurrentMessage();
        event.preventDefault();
        break;
      case 'Escape':
        this.exitNavigationMode();
        event.preventDefault();
        break;
    }
  }

  /**
   * Enter navigation mode when a message receives focus.
   */
  @HostListener('focusin', ['$event'])
  onFocusIn(event: FocusEvent): void {
    const target = event.target as HTMLElement;
    if (target.getAttribute('role') === 'listitem') {
      this.isInNavigationMode.set(true);
      // Find the message index based on the focused element
      const messageElements = this.getMessageElements();
      const index = messageElements.indexOf(target);
      if (index >= 0) {
        this.focusedMessageIndex.set(index);
      }
    }
  }

  /**
   * Focus the previous message in the list.
   */
  private focusPreviousMessage(): void {
    const currentIndex = this.focusedMessageIndex();
    const messageElements = this.getMessageElements();

    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      this.focusedMessageIndex.set(newIndex);
      messageElements[newIndex]?.focus();
    } else if (currentIndex === -1 && messageElements.length > 0) {
      // First navigation - start at the last message
      const lastIndex = messageElements.length - 1;
      this.focusedMessageIndex.set(lastIndex);
      messageElements[lastIndex]?.focus();
    }

    this.isInNavigationMode.set(true);
  }

  /**
   * Focus the next message in the list.
   */
  private focusNextMessage(): void {
    const currentIndex = this.focusedMessageIndex();
    const messageElements = this.getMessageElements();

    if (currentIndex < messageElements.length - 1) {
      const newIndex = currentIndex + 1;
      this.focusedMessageIndex.set(newIndex);
      messageElements[newIndex]?.focus();
    } else if (currentIndex === -1 && messageElements.length > 0) {
      // First navigation - start at the first message
      this.focusedMessageIndex.set(0);
      messageElements[0]?.focus();
    }

    this.isInNavigationMode.set(true);
  }

  /**
   * Announce the currently focused message using the screen reader.
   */
  private announceCurrentMessage(): void {
    const index = this.focusedMessageIndex();
    const messages = this.flatMessages();

    if (index >= 0 && index < messages.length) {
      const message = messages[index];
      if (message) {
        this.announcer.announceMessage(message);
      }
    }
  }

  /**
   * Exit keyboard navigation mode and return focus to the container.
   */
  private exitNavigationMode(): void {
    this.isInNavigationMode.set(false);
    this.focusedMessageIndex.set(-1);

    // Return focus to the viewport container
    const vp = this.viewport();
    if (vp) {
      (vp.elementRef.nativeElement as HTMLElement).focus();
    }
  }

  /**
   * Get all message elements currently rendered in the DOM.
   */
  private getMessageElements(): HTMLElement[] {
    const container = this.elementRef.nativeElement as HTMLElement;
    return Array.from(container.querySelectorAll('[role="listitem"]'));
  }
}
