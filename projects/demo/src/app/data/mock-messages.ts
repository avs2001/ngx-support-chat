import { ChatMessage, QuickReplySet } from 'ngx-support-chat';

/**
 * Agent configuration for demo.
 */
export const DEMO_AGENT = {
  id: 'agent-1',
  name: 'Support Agent',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=support-agent'
};

/**
 * User configuration for demo.
 */
export const DEMO_USER = {
  id: 'user-1',
  name: 'You'
};

/**
 * Initial messages for the demo conversation.
 */
export const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'init-1',
    type: 'system',
    senderId: 'system',
    senderName: 'System',
    timestamp: new Date(Date.now() - 7200000), // 2 hours ago
    status: 'read',
    content: { text: 'Chat session started' }
  },
  {
    id: 'init-2',
    type: 'text',
    senderId: DEMO_AGENT.id,
    senderName: DEMO_AGENT.name,
    senderAvatar: DEMO_AGENT.avatar,
    timestamp: new Date(Date.now() - 7190000),
    status: 'read',
    content: { text: 'Hello! Welcome to our support chat. I\'m here to help you with any questions you may have.' }
  },
  {
    id: 'init-3',
    type: 'text',
    senderId: DEMO_USER.id,
    senderName: DEMO_USER.name,
    timestamp: new Date(Date.now() - 7100000),
    status: 'read',
    content: { text: 'Hi! Thanks for the quick response.' }
  },
  {
    id: 'init-4',
    type: 'text',
    senderId: DEMO_AGENT.id,
    senderName: DEMO_AGENT.name,
    senderAvatar: DEMO_AGENT.avatar,
    timestamp: new Date(Date.now() - 7000000),
    status: 'read',
    content: { text: 'Of course! What can I help you with today?' }
  },
  {
    id: 'init-5',
    type: 'text',
    senderId: DEMO_USER.id,
    senderName: DEMO_USER.name,
    timestamp: new Date(Date.now() - 6900000),
    status: 'read',
    content: { text: 'I have a question about your products.' }
  },
  {
    id: 'init-6',
    type: 'text',
    senderId: DEMO_AGENT.id,
    senderName: DEMO_AGENT.name,
    senderAvatar: DEMO_AGENT.avatar,
    timestamp: new Date(Date.now() - 6800000),
    status: 'read',
    content: { text: 'I\'d be happy to help! Feel free to ask anything about our products, pricing, or services.' }
  }
];

/**
 * Agent response templates.
 */
export const AGENT_RESPONSES = {
  greeting: 'Hello! How can I assist you today?',
  help: 'I\'d be happy to help! Here are some things I can assist with:\n\n- Product information\n- Order status\n- Technical support\n- Account questions\n\nWhat would you like to know more about?',
  pricing: 'Our pricing varies depending on the plan you choose. We offer:\n\n- **Basic**: $9/month\n- **Pro**: $29/month\n- **Enterprise**: Custom pricing\n\nWould you like more details on any of these plans?',
  thanks: 'You\'re welcome! Is there anything else I can help you with?',
  goodbye: 'Thank you for chatting with us today! Have a great day! 👋',
  generic: [
    'That\'s a great question! Let me look into that for you.',
    'I understand. Let me help you with that.',
    'Thanks for the information. Here\'s what I can tell you...',
    'I see what you mean. Let me explain how that works.',
    'Good point! Here\'s some more context on that topic.',
    'I appreciate you sharing that. Let me provide some guidance.',
    'That makes sense. Here\'s what I\'d recommend...',
    'I\'m checking our resources now. One moment please...'
  ]
};

/**
 * Quick reply scenarios.
 */
export const QUICK_REPLY_SCENARIOS = {
  confirmation: {
    id: 'qr-confirm',
    type: 'confirmation',
    prompt: 'Would you like to proceed with this option?',
    options: [
      { value: true, label: 'Yes, proceed' },
      { value: false, label: 'No, cancel' }
    ],
    submitted: false
  },
  singleChoice: {
    id: 'qr-single',
    type: 'single-choice',
    prompt: 'What topic would you like help with?',
    options: [
      { value: 'billing', label: 'Billing & Payments' },
      { value: 'technical', label: 'Technical Support' },
      { value: 'account', label: 'Account Settings' },
      { value: 'other', label: 'Something Else' }
    ],
    submitted: false
  },
  multipleChoice: {
    id: 'qr-multi',
    type: 'multiple-choice',
    prompt: 'Which features are you interested in? (Select all that apply)',
    options: [
      { value: 'analytics', label: 'Analytics Dashboard' },
      { value: 'reporting', label: 'Automated Reports' },
      { value: 'integrations', label: 'Third-party Integrations' },
      { value: 'api', label: 'API Access' },
      { value: 'support', label: 'Priority Support' }
    ],
    submitted: false
  }
} as const satisfies Record<string, QuickReplySet>;

/**
 * Generate messages for performance testing.
 */
export function generatePerformanceMessages(count: number, startIndex = 0): ChatMessage[] {
  const messages: ChatMessage[] = [];
  const baseTime = Date.now() - count * 60000; // Start from count minutes ago

  for (let i = 0; i < count; i++) {
    const index = startIndex + i;
    const isUser = index % 3 === 0;
    const isSystem = index % 20 === 0;

    if (isSystem) {
      messages.push({
        id: `perf-${index}`,
        type: 'system',
        senderId: 'system',
        senderName: 'System',
        timestamp: new Date(baseTime + i * 60000),
        status: 'read',
        content: { text: `System event at message ${index}` }
      });
    } else if (isUser) {
      messages.push({
        id: `perf-${index}`,
        type: 'text',
        senderId: DEMO_USER.id,
        senderName: DEMO_USER.name,
        timestamp: new Date(baseTime + i * 60000),
        status: 'read',
        content: { text: getRandomUserMessage(index) }
      });
    } else {
      messages.push({
        id: `perf-${index}`,
        type: 'text',
        senderId: DEMO_AGENT.id,
        senderName: DEMO_AGENT.name,
        senderAvatar: DEMO_AGENT.avatar,
        timestamp: new Date(baseTime + i * 60000),
        status: 'read',
        content: { text: getRandomAgentMessage(index) }
      });
    }
  }

  return messages;
}

/**
 * Sample user messages for performance testing.
 */
function getRandomUserMessage(index: number): string {
  const messages = [
    'How does this feature work?',
    'Can you explain more about the pricing?',
    'I need help with my account.',
    'Is there a way to export my data?',
    'What are the system requirements?',
    'Can I upgrade my plan later?',
    'How do I reset my password?',
    'Is there a mobile app available?',
    'What payment methods do you accept?',
    'How long does shipping take?'
  ] as const;
  return messages[index % messages.length] ?? 'Hello!';
}

/**
 * Sample agent messages for performance testing.
 */
function getRandomAgentMessage(index: number): string {
  const messages = [
    'Let me help you with that.',
    'Great question! Here\'s what you need to know...',
    'I\'d be happy to explain that further.',
    'Yes, you can definitely do that. Here\'s how...',
    'That\'s available in our Pro plan.',
    'I\'ll send you the details right away.',
    'Let me check on that for you.',
    'Here\'s a step-by-step guide...',
    'I understand your concern. Let me help.',
    'Thanks for your patience. Here\'s the answer...'
  ] as const;
  return messages[index % messages.length] ?? 'How can I help?';
}
