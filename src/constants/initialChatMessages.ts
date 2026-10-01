import { ChatMessage, ChatChannel } from '../types/chat';

export const CHAT_CHANNELS: ChatChannel[] = [
  {
    id: 'general',
    name: 'Geral (Konoha)',
    description: 'Piazza central da Aldeia da Folha: troca de estratégias e conversas shinobi',
    iconName: 'Users',
  },
  {
    id: 'clans',
    name: 'Clãs & Linhagens',
    description: 'Debates sobre poderes hereditários, Uchiha, Senju, Hyūga e Otsutsuki',
    iconName: 'GitFork',
  },
  {
    id: 'announcements',
    name: 'Transmissões do Hokage',
    description: 'Notificações mundiais de chefes derrotados, drops míticos e promoções',
    iconName: 'Flame',
  },
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [];

export const QUICK_EMOJIS = ['🔥', '⚡', '🌀', '🍥', '🍃', '⚔️', '👁️', '💪', '👑', '✨', '🐸', '🌙'];
