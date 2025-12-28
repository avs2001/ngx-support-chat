import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Header component for the chat interface.
 *
 * This is a presentational component that provides a styled container
 * for projected header content. It handles the visual styling and
 * border separator.
 *
 * @example
 * ```html
 * <ngx-chat-header>
 *   <div class="header-content">
 *     <img [src]="agentAvatar" alt="Agent" />
 *     <span>Support Chat</span>
 *   </div>
 * </ngx-chat-header>
 * ```
 */
@Component({
  selector: 'ngx-chat-header',
  templateUrl: './chat-header.component.html',
  styleUrl: './chat-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatHeaderComponent {}
