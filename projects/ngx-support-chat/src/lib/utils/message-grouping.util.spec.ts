import { describe, it, expect } from 'vitest';

import { ChatMessage } from '../../../models/chat-message.model';

import {
  groupMessagesByDate,
  shouldGroupWithPrevious,
  getTotalMessageCount,
  findMessageIndex,
  flattenGroupedMessages,
  DEFAULT_GROUP_THRESHOLD_MS,
  GroupedMessages,
  MessageGroup
} from './message-grouping.util';

describe('message-grouping.util', () => {
  // Helper to create test messages
  function createMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
    return {
      id: `msg-${Math.random().toString(36).substring(2, 9)}`,
      type: 'text',
      senderId: 'user-1',
      senderName: 'Test User',
      timestamp: new Date(2025, 5, 15, 12, 0),
      status: 'sent',
      content: { text: 'Test message' },
      ...overrides
    };
  }

  describe('groupMessagesByDate', () => {
    it('should return empty array for empty messages', () => {
      expect(groupMessagesByDate([], 'user-1')).toEqual([]);
    });

    it('should group single message', () => {
      const messages = [createMessage({ id: 'msg-1', senderId: 'user-1' })];
      const result = groupMessagesByDate(messages, 'user-1');

      expect(result).toHaveLength(1);
      expect(result[0]?.groups).toHaveLength(1);
      expect(result[0]?.groups[0]?.messages).toHaveLength(1);
      expect(result[0]?.groups[0]?.isCurrentUser).toBe(true);
    });

    it('should group consecutive messages from same sender', () => {
      const baseTime = new Date(2025, 5, 15, 12, 0);
      const messages = [
        createMessage({ id: 'msg-1', senderId: 'user-1', timestamp: new Date(baseTime.getTime()) }),
        createMessage({ id: 'msg-2', senderId: 'user-1', timestamp: new Date(baseTime.getTime() + 60000) }),
        createMessage({ id: 'msg-3', senderId: 'user-1', timestamp: new Date(baseTime.getTime() + 120000) })
      ];

      const result = groupMessagesByDate(messages, 'user-1');

      expect(result).toHaveLength(1);
      expect(result[0]?.groups).toHaveLength(1);
      expect(result[0]?.groups[0]?.messages).toHaveLength(3);
    });

    it('should separate messages from different senders', () => {
      const baseTime = new Date(2025, 5, 15, 12, 0);
      const messages = [
        createMessage({ id: 'msg-1', senderId: 'user-1', timestamp: new Date(baseTime.getTime()) }),
        createMessage({ id: 'msg-2', senderId: 'agent-1', senderName: 'Agent', timestamp: new Date(baseTime.getTime() + 60000) }),
        createMessage({ id: 'msg-3', senderId: 'user-1', timestamp: new Date(baseTime.getTime() + 120000) })
      ];

      const result = groupMessagesByDate(messages, 'user-1');

      expect(result).toHaveLength(1);
      expect(result[0]?.groups).toHaveLength(3);
      expect(result[0]?.groups[0]?.isCurrentUser).toBe(true);
      expect(result[0]?.groups[1]?.isCurrentUser).toBe(false);
      expect(result[0]?.groups[2]?.isCurrentUser).toBe(true);
    });

    it('should separate messages exceeding time threshold', () => {
      const baseTime = new Date(2025, 5, 15, 12, 0);
      const messages = [
        createMessage({ id: 'msg-1', senderId: 'user-1', timestamp: new Date(baseTime.getTime()) }),
        createMessage({
          id: 'msg-2',
          senderId: 'user-1',
          timestamp: new Date(baseTime.getTime() + DEFAULT_GROUP_THRESHOLD_MS + 1000)
        })
      ];

      const result = groupMessagesByDate(messages, 'user-1');

      expect(result).toHaveLength(1);
      expect(result[0]?.groups).toHaveLength(2);
    });

    it('should group messages on same day with custom threshold', () => {
      const baseTime = new Date(2025, 5, 15, 12, 0);
      const customThreshold = 10 * 60 * 1000; // 10 minutes
      const messages = [
        createMessage({ id: 'msg-1', senderId: 'user-1', timestamp: new Date(baseTime.getTime()) }),
        createMessage({ id: 'msg-2', senderId: 'user-1', timestamp: new Date(baseTime.getTime() + 8 * 60 * 1000) })
      ];

      const result = groupMessagesByDate(messages, 'user-1', customThreshold);

      expect(result[0]?.groups).toHaveLength(1);
      expect(result[0]?.groups[0]?.messages).toHaveLength(2);
    });

    it('should create separate date groups for different days', () => {
      const day1 = new Date(2025, 5, 15, 12, 0);
      const day2 = new Date(2025, 5, 16, 12, 0);
      const messages = [
        createMessage({ id: 'msg-1', senderId: 'user-1', timestamp: day1 }),
        createMessage({ id: 'msg-2', senderId: 'user-1', timestamp: day2 })
      ];

      const result = groupMessagesByDate(messages, 'user-1');

      expect(result).toHaveLength(2);
      expect(result[0]?.date.getDate()).toBe(15);
      expect(result[1]?.date.getDate()).toBe(16);
    });

    it('should not group system messages', () => {
      const baseTime = new Date(2025, 5, 15, 12, 0);
      const messages = [
        createMessage({ id: 'msg-1', senderId: 'user-1', timestamp: new Date(baseTime.getTime()) }),
        createMessage({
          id: 'msg-2',
          type: 'system',
          senderId: 'system',
          content: { text: 'Agent joined' },
          timestamp: new Date(baseTime.getTime() + 60000)
        }),
        createMessage({ id: 'msg-3', senderId: 'user-1', timestamp: new Date(baseTime.getTime() + 120000) })
      ];

      const result = groupMessagesByDate(messages, 'user-1');

      expect(result[0]?.groups).toHaveLength(3);
    });

    it('should preserve sender information in groups', () => {
      const messages = [
        createMessage({
          id: 'msg-1',
          senderId: 'agent-1',
          senderName: 'Support Agent',
          senderAvatar: 'https://example.com/avatar.jpg'
        })
      ];

      const result = groupMessagesByDate(messages, 'user-1');

      const group = result[0]?.groups[0];
      expect(group?.senderId).toBe('agent-1');
      expect(group?.senderName).toBe('Support Agent');
      expect(group?.senderAvatar).toBe('https://example.com/avatar.jpg');
      expect(group?.isCurrentUser).toBe(false);
    });
  });

  describe('shouldGroupWithPrevious', () => {
    it('should return true for same sender within threshold', () => {
      const baseTime = new Date(2025, 5, 15, 12, 0);
      const msg1 = createMessage({ senderId: 'user-1', timestamp: baseTime });
      const msg2 = createMessage({ senderId: 'user-1', timestamp: new Date(baseTime.getTime() + 60000) });

      expect(shouldGroupWithPrevious(msg2, msg1, DEFAULT_GROUP_THRESHOLD_MS)).toBe(true);
    });

    it('should return false for different senders', () => {
      const baseTime = new Date(2025, 5, 15, 12, 0);
      const msg1 = createMessage({ senderId: 'user-1', timestamp: baseTime });
      const msg2 = createMessage({ senderId: 'agent-1', timestamp: new Date(baseTime.getTime() + 60000) });

      expect(shouldGroupWithPrevious(msg2, msg1, DEFAULT_GROUP_THRESHOLD_MS)).toBe(false);
    });

    it('should return false when exceeding threshold', () => {
      const baseTime = new Date(2025, 5, 15, 12, 0);
      const msg1 = createMessage({ senderId: 'user-1', timestamp: baseTime });
      const msg2 = createMessage({
        senderId: 'user-1',
        timestamp: new Date(baseTime.getTime() + DEFAULT_GROUP_THRESHOLD_MS + 1)
      });

      expect(shouldGroupWithPrevious(msg2, msg1, DEFAULT_GROUP_THRESHOLD_MS)).toBe(false);
    });

    it('should return false for system messages', () => {
      const baseTime = new Date(2025, 5, 15, 12, 0);
      const msg1 = createMessage({ senderId: 'system', type: 'system', timestamp: baseTime });
      const msg2 = createMessage({ senderId: 'system', type: 'system', timestamp: new Date(baseTime.getTime() + 60000) });

      expect(shouldGroupWithPrevious(msg2, msg1, DEFAULT_GROUP_THRESHOLD_MS)).toBe(false);
    });

    it('should return false when current message is system type', () => {
      const baseTime = new Date(2025, 5, 15, 12, 0);
      const msg1 = createMessage({ senderId: 'user-1', timestamp: baseTime });
      const msg2 = createMessage({ senderId: 'user-1', type: 'system', timestamp: new Date(baseTime.getTime() + 60000) });

      expect(shouldGroupWithPrevious(msg2, msg1, DEFAULT_GROUP_THRESHOLD_MS)).toBe(false);
    });
  });

  describe('getTotalMessageCount', () => {
    it('should return 0 for empty array', () => {
      expect(getTotalMessageCount([])).toBe(0);
    });

    it('should count all messages across groups', () => {
      const grouped: GroupedMessages[] = [
        {
          date: new Date(2025, 5, 15),
          groups: [
            { senderId: 'user-1', senderName: 'User', isCurrentUser: true, messages: [createMessage(), createMessage()] },
            { senderId: 'agent-1', senderName: 'Agent', isCurrentUser: false, messages: [createMessage()] }
          ]
        },
        {
          date: new Date(2025, 5, 16),
          groups: [{ senderId: 'user-1', senderName: 'User', isCurrentUser: true, messages: [createMessage()] }]
        }
      ];

      expect(getTotalMessageCount(grouped)).toBe(4);
    });
  });

  describe('findMessageIndex', () => {
    it('should return null for empty array', () => {
      expect(findMessageIndex([], 'msg-1')).toBeNull();
    });

    it('should find message in grouped structure', () => {
      const targetId = 'target-msg';
      const grouped: GroupedMessages[] = [
        {
          date: new Date(2025, 5, 15),
          groups: [
            { senderId: 'user-1', senderName: 'User', isCurrentUser: true, messages: [createMessage({ id: 'msg-1' })] },
            {
              senderId: 'agent-1',
              senderName: 'Agent',
              isCurrentUser: false,
              messages: [createMessage({ id: 'msg-2' }), createMessage({ id: targetId })]
            }
          ]
        }
      ];

      const result = findMessageIndex(grouped, targetId);

      expect(result).toEqual({ dateIndex: 0, groupIndex: 1, messageIndex: 1 });
    });

    it('should return null for non-existent message', () => {
      const grouped: GroupedMessages[] = [
        {
          date: new Date(2025, 5, 15),
          groups: [{ senderId: 'user-1', senderName: 'User', isCurrentUser: true, messages: [createMessage({ id: 'msg-1' })] }]
        }
      ];

      expect(findMessageIndex(grouped, 'non-existent')).toBeNull();
    });
  });

  describe('flattenGroupedMessages', () => {
    it('should return empty array for empty input', () => {
      expect(flattenGroupedMessages([])).toEqual([]);
    });

    it('should flatten all messages in order', () => {
      const msg1 = createMessage({ id: 'msg-1' });
      const msg2 = createMessage({ id: 'msg-2' });
      const msg3 = createMessage({ id: 'msg-3' });

      const grouped: GroupedMessages[] = [
        {
          date: new Date(2025, 5, 15),
          groups: [
            { senderId: 'user-1', senderName: 'User', isCurrentUser: true, messages: [msg1] },
            { senderId: 'agent-1', senderName: 'Agent', isCurrentUser: false, messages: [msg2] }
          ]
        },
        {
          date: new Date(2025, 5, 16),
          groups: [{ senderId: 'user-1', senderName: 'User', isCurrentUser: true, messages: [msg3] }]
        }
      ];

      const result = flattenGroupedMessages(grouped);

      expect(result).toHaveLength(3);
      expect(result[0]?.id).toBe('msg-1');
      expect(result[1]?.id).toBe('msg-2');
      expect(result[2]?.id).toBe('msg-3');
    });
  });
});
