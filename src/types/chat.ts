export type ChatChannelId = 'general' | 'clans' | 'announcements';

export interface ChatReaction {
  emoji: string;
  count: number;
  userReacted?: boolean;
}

export interface ChatMessage {
  id: string;
  channelId: ChatChannelId;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderRankTitle: string;
  senderRankColor: string;
  senderClan?: string;
  isSystem?: boolean;
  isCurrentUser?: boolean;
  content: string;
  timestamp: string;
  reactions: ChatReaction[];
  badgeTitle?: string;
}

export interface ChatChannel {
  id: ChatChannelId;
  name: string;
  description: string;
  iconName: string;
}
