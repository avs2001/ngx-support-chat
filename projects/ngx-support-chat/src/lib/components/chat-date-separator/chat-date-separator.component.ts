import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { ChatConfigService } from '../../services/chat-config.service';
import { formatDate, isToday, isYesterday } from '../../utils/date-helpers.util';

/**
 * Component for displaying date separators in the chat message area.
 * Shows "Today", "Yesterday", or a formatted date based on configuration.
 */
@Component({
  selector: 'ngx-chat-date-separator',
  standalone: true,
  templateUrl: './chat-date-separator.component.html',
  styleUrl: './chat-date-separator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatDateSeparatorComponent {
  /** The date to display */
  readonly date = input.required<Date>();

  private readonly config = inject(ChatConfigService);

  /** Computed display text based on the date */
  readonly displayText = computed(() => {
    const d = this.date();
    const labels = this.config.dateSeparatorLabels();

    if (isToday(d)) {
      return labels.today;
    }

    if (isYesterday(d)) {
      return labels.yesterday;
    }

    return formatDate(d, this.config.dateFormat());
  });
}
