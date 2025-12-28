/**
 * Typing indicator interface for showing who is currently typing.
 */

/**
 * Represents a user who is currently typing.
 */
export interface TypingIndicator {
  /** Unique identifier of the typing user */
  userId: string;
  /** Display name of the typing user */
  userName: string;
  /** Optional avatar URL */
  avatar?: string;
}
