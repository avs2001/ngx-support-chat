/**
 * Message grouping utilities for chat display.
 * Provides functions to group messages by date and sender.
 */

import { ChatMessage } from '../../../models/chat-message.model';

import { getTimeDifferenceMs, isSameDay, startOfDay } from './date-helpers.util';

/** Default time threshold for grouping consecutive messages (5 minutes) */
export const DEFAULT_GROUP_THRESHOLD_MS = 5 * 60 * 1000;

/**
 * Represents a group of consecutive messages from the same sender.
 */
export interface MessageGroup {
  /** Sender ID for this group */
  senderId: string;
  /** Sender name for this group */
  senderName: string;
  /** Sender avatar URL (if available) */
  senderAvatar?: string;
  /** Whether sender is the current user */
  isCurrentUser: boolean;
  /** Messages in this group */
  messages: ChatMessage[];
}

/**
 * Represents messages grouped by date.
 * Each date may contain multiple sender groups.
 */
export interface GroupedMessages {
  /** The date for this group (normalized to start of day) */
  date: Date;
  /** Message groups within this date */
  groups: MessageGroup[];
}

/**
 * Groups messages by date and then by sender.
 * Creates a hierarchical structure for efficient rendering.
 *
 * @param messages - Array of chat messages (should be sorted by timestamp)
 * @param currentUserId - The current user's ID for alignment
 * @param timeThreshold - Time threshold in ms for sender grouping (default 5 minutes)
 * @returns Array of grouped messages by date
 */
export function groupMessagesByDate(
  messages: ChatMessage[],
  currentUserId: string,
  timeThreshold: number = DEFAULT_GROUP_THRESHOLD_MS
): GroupedMessages[] {
  if (messages.length === 0) {
    return [];
  }

  const result: GroupedMessages[] = [];
  let currentDateGroup: GroupedMessages | null = null;
  let currentSenderGroup: MessageGroup | null = null;
  let previousMessage: ChatMessage | null = null;

  for (const message of messages) {
    const messageDate = startOfDay(message.timestamp);

    // Check if we need a new date group
    if (!currentDateGroup || !isSameDay(currentDateGroup.date, messageDate)) {
      // Start new date group
      currentDateGroup = {
        date: messageDate,
        groups: []
      };
      result.push(currentDateGroup);
      currentSenderGroup = null;
      previousMessage = null;
    }

    // Check if we need a new sender group
    const shouldStartNewGroup =
      !currentSenderGroup ||
      !previousMessage ||
      !shouldGroupWithPrevious(message, previousMessage, timeThreshold);

    if (shouldStartNewGroup) {
      currentSenderGroup = {
        senderId: message.senderId,
        senderName: message.senderName,
        senderAvatar: message.senderAvatar,
        isCurrentUser: message.senderId === currentUserId,
        messages: []
      };
      currentDateGroup.groups.push(currentSenderGroup);
    }

    currentSenderGroup.messages.push(message);
    previousMessage = message;
  }

  return result;
}

/**
 * Determines if a message should be grouped with the previous message.
 * Messages are grouped if they have the same sender and are within the time threshold.
 *
 * @param current - The current message
 * @param previous - The previous message
 * @param threshold - Time threshold in milliseconds
 * @returns true if messages should be grouped together
 */
export function shouldGroupWithPrevious(current: ChatMessage, previous: ChatMessage, threshold: number): boolean {
  // Must be same sender
  if (current.senderId !== previous.senderId) {
    return false;
  }

  // System messages should not be grouped
  if (current.type === 'system' || previous.type === 'system') {
    return false;
  }

  // Must be within time threshold
  const timeDiff = getTimeDifferenceMs(current.timestamp, previous.timestamp);
  return timeDiff <= threshold;
}

/**
 * Gets the total number of messages across all groups.
 *
 * @param groupedMessages - Array of grouped messages
 * @returns Total message count
 */
export function getTotalMessageCount(groupedMessages: GroupedMessages[]): number {
  return groupedMessages.reduce(
    (total, dateGroup) => total + dateGroup.groups.reduce((dateTotal, group) => dateTotal + group.messages.length, 0),
    0
  );
}

/**
 * Finds the index of a message in the grouped structure.
 * Returns null if not found.
 *
 * @param groupedMessages - Array of grouped messages
 * @param messageId - The message ID to find
 * @returns Object with dateIndex, groupIndex, and messageIndex, or null
 */
export function findMessageIndex(
  groupedMessages: GroupedMessages[],
  messageId: string
): { dateIndex: number; groupIndex: number; messageIndex: number } | null {
  for (let dateIndex = 0; dateIndex < groupedMessages.length; dateIndex++) {
    const dateGroup = groupedMessages[dateIndex];
    if (!dateGroup) continue;

    for (let groupIndex = 0; groupIndex < dateGroup.groups.length; groupIndex++) {
      const group = dateGroup.groups[groupIndex];
      if (!group) continue;

      const messageIndex = group.messages.findIndex(m => m.id === messageId);
      if (messageIndex !== -1) {
        return { dateIndex, groupIndex, messageIndex };
      }
    }
  }
  return null;
}

/**
 * Flattens grouped messages back into a single array.
 * Useful for virtual scrolling where items need sequential access.
 *
 * @param groupedMessages - Array of grouped messages
 * @returns Flat array of messages
 */
export function flattenGroupedMessages(groupedMessages: GroupedMessages[]): ChatMessage[] {
  return groupedMessages.flatMap(dateGroup => dateGroup.groups.flatMap(group => group.messages));
}
