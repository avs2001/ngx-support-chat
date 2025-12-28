import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { TypingIndicator } from '../../../models/public-api';

/**
 * Component for displaying a typing indicator.
 *
 * Shows an animated three-dot indicator with optional avatar and text.
 * The indicator appears in a message-bubble-like container aligned to the left
 * (agent position).
 *
 * @example
 * ```html
 * <ngx-chat-typing-indicator
 *   [typingIndicator]="{ userId: 'agent-1', userName: 'Support Agent', avatar: 'agent.png' }"
 *   [showText]="true"
 * />
 * ```
 */
@Component({
  selector: 'ngx-chat-typing-indicator',
  standalone: true,
  templateUrl: './chat-typing-indicator.component.html',
  styleUrl: './chat-typing-indicator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatTypingIndicatorComponent {
  /** The typing indicator data (who is typing) */
  readonly typingIndicator = input.required<TypingIndicator>();

  /** Whether to show the "X is typing..." text */
  readonly showText = input<boolean>(false);

  /** User name for display */
  readonly userName = computed(() => this.typingIndicator().userName);

  /** Avatar URL if available */
  readonly avatar = computed(() => this.typingIndicator().avatar);

  /** Whether an avatar is available */
  readonly hasAvatar = computed(() => !!this.avatar());

  /** Typing text to display */
  readonly typingText = computed(() => `${this.userName()} is typing...`);
}
