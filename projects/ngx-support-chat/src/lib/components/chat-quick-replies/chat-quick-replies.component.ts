import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

import { QuickReplyOption, QuickReplySet, QuickReplySubmitEvent } from '../../../models/public-api';

/**
 * Component for displaying interactive quick reply options.
 *
 * Supports three types of quick replies:
 * - **confirmation**: Single button that immediately submits
 * - **single-choice**: Radio-style options, selection immediately submits
 * - **multiple-choice**: Checkbox options with a Submit button
 *
 * After submission, the component displays a disabled state showing
 * the user's selection(s).
 *
 * @example
 * ```html
 * <ngx-chat-quick-replies
 *   [quickReplies]="quickReplySet"
 *   (quickReplySubmit)="onQuickReplySubmit($event)"
 * />
 * ```
 */
@Component({
  selector: 'ngx-chat-quick-replies',
  standalone: true,
  imports: [NgClass],
  templateUrl: './chat-quick-replies.component.html',
  styleUrl: './chat-quick-replies.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatQuickRepliesComponent {
  /** The quick reply set to display */
  readonly quickReplies = input.required<QuickReplySet>();

  /** Emitted when user submits a quick reply selection */
  readonly quickReplySubmit = output<QuickReplySubmitEvent>();

  /** Internal state for multiple-choice selections (before submit) */
  readonly selectedValues = signal<unknown[]>([]);

  /** Quick reply type for template checks */
  readonly type = computed(() => this.quickReplies().type);

  /** Whether the quick replies have been submitted */
  readonly isSubmitted = computed(() => this.quickReplies().submitted);

  /** Options from the quick reply set */
  readonly options = computed(() => this.quickReplies().options);

  /** Prompt text if available */
  readonly prompt = computed(() => this.quickReplies().prompt);

  /** First option (for confirmation type) */
  readonly firstOption = computed(() => this.options()[0]);

  /** Whether there are selections (for submit button state) */
  readonly hasSelections = computed(() => this.selectedValues().length > 0);

  /**
   * Check if an option is currently selected (for multiple-choice before submit)
   */
  isSelected(option: QuickReplyOption): boolean {
    return this.selectedValues().includes(option.value);
  }

  /**
   * Check if an option was selected in the submitted response
   */
  wasSelected(option: QuickReplyOption): boolean {
    const selected = this.quickReplies().selectedValues ?? [];
    return selected.includes(option.value);
  }

  /**
   * Handle confirmation button click
   */
  onConfirm(): void {
    const option = this.firstOption();
    if (option && !option.disabled) {
      this.emitSubmit(option.value);
    }
  }

  /**
   * Handle single-choice option selection
   */
  onSingleSelect(option: QuickReplyOption): void {
    if (!option.disabled && !this.isSubmitted()) {
      this.emitSubmit(option.value);
    }
  }

  /**
   * Toggle a multiple-choice option
   */
  onMultiToggle(option: QuickReplyOption): void {
    if (option.disabled || this.isSubmitted()) {
      return;
    }

    this.selectedValues.update(current => {
      const index = current.indexOf(option.value);
      if (index === -1) {
        return [...current, option.value];
      } else {
        return current.filter(v => v !== option.value);
      }
    });
  }

  /**
   * Submit multiple-choice selections
   */
  onMultiSubmit(): void {
    if (this.hasSelections() && !this.isSubmitted()) {
      this.emitSubmit(this.selectedValues());
    }
  }

  /**
   * Emit the quick reply submit event
   */
  private emitSubmit(value: unknown): void {
    this.quickReplySubmit.emit({
      type: this.type(),
      value
    });
  }

  /**
   * Get CSS classes for an option button
   */
  getOptionClasses(option: QuickReplyOption): Record<string, boolean> {
    const submitted = this.isSubmitted();
    const wasSelectedInSubmission = this.wasSelected(option);
    const isCurrentlySelected = this.isSelected(option);

    return {
      'quick-reply-option': true,
      'quick-reply-option--selected': submitted ? wasSelectedInSubmission : isCurrentlySelected,
      'quick-reply-option--disabled': option.disabled ?? false,
      'quick-reply-option--muted': submitted && !wasSelectedInSubmission
    };
  }
}
