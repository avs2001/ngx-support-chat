/**
 * Quick reply interfaces for interactive message responses.
 */

/**
 * Type of quick reply interaction.
 */
export type QuickReplyType = 'confirmation' | 'single-choice' | 'multiple-choice';

/**
 * Individual quick reply option.
 */
export interface QuickReplyOption {
  /** Value submitted when option is selected */
  value: unknown;
  /** Display label for the option */
  label: string;
  /** Whether the option is disabled */
  disabled?: boolean;
}

/**
 * A set of quick reply options presented to the user.
 */
export interface QuickReplySet {
  /** Unique identifier for this quick reply set */
  id: string;
  /** Type of quick reply interaction */
  type: QuickReplyType;
  /** Optional prompt text displayed above options */
  prompt?: string;
  /** Available options */
  options: QuickReplyOption[];
  /** Whether the user has submitted a response */
  submitted: boolean;
  /** Selected values after submission */
  selectedValues?: unknown[];
}
