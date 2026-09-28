import { ShinobiRankId } from '../types/rankings';

export interface ShinobiAvatarOption {
  readonly id: string;
  readonly name: string;
  readonly title: string;
  readonly initials: string;
  readonly accentColor: string;
  readonly bgGradient: string;
  readonly emojiIcon: string;
}

export interface AvatarFrameOption {
  readonly id: string;
  readonly name: string;
  readonly borderClass: string;
  readonly glowClass: string;
  readonly description: string;
  readonly minRank?: ShinobiRankId;
  readonly minBossId?: number;
  readonly requirementLabel: string;
}

export interface FavoriteNinjaOption {
  readonly id: string;
  readonly name: string;
  readonly title: string;
  readonly quote: string;
  readonly insignia: string;
  readonly clan: string;
}

export const SHINOBI_AVATARS: ShinobiAvatarOption[] = [
  {
    id: 'naruto',
    name: 'Naruto Uzumaki',
    title: 'Herói de Konoha & Sábio dos Sapos',
    initials: 'NU',
    accentColor: '#F97316',
    bgGradient: 'from-amber-600/30 to-orange-950/60',
    emojiIcon: '🍥',
  },
  {
    id: 'sasuke',
    name: 'Sasuke Uchiha',
    title: 'Último Vingador & Rinnegan Supremo',
    initials: 'SU',
    accentColor: '#8B5CF6',
    bgGradient: 'from-violet-600/30 to-purple-950/60',
    emojiIcon: '⚡',
  },
  {
    id: 'kakashi',
    name: 'Kakashi Hatake',
    title: 'O Ninja Copiador & Sexto Hokage',
    initials: 'KH',
    accentColor: '#06B6D4',
    bgGradient: 'from-cyan-600/30 to-slate-950/60',
    emojiIcon: '📖',
  },
  {
    id: 'itachi',
    name: 'Itachi Uchiha',
    title: 'Prodígio de Konoha & Mestre do Tsukuyomi',
    initials: 'IU',
    accentColor: '#EF4444',
    bgGradient: 'from-rose-600/30 to-red-950/60',
    emojiIcon: '🐦‍⬛',
  },
  {
    id: 'minato',
    name: 'Minato Namikaze',
    title: 'Relâmpago Amarelo & Quarto Hokage',
    initials: 'MN',
    accentColor: '#EAB308',
    bgGradient: 'from-yellow-500/30 to-amber-950/60',
    emojiIcon: '⚡',
  },
  {
    id: 'jiraiya',
    name: 'Jiraiya',
    title: 'Sannin Lendário & Mestre dos Sapos',
    initials: 'JY',
    accentColor: '#10B981',
    bgGradient: 'from-emerald-600/30 to-teal-950/60',
    emojiIcon: '🐸',
  },
  {
    id: 'tsunade',
    name: 'Tsunade Senju',
    title: 'Mestra Médica & Quinta Hokage',
    initials: 'TS',
    accentColor: '#14B8A6',
    bgGradient: 'from-teal-600/30 to-emerald-950/60',
    emojiIcon: '💎',
  },
  {
    id: 'madara',
    name: 'Madara Uchiha',
    title: 'Fantasma dos Uchiha & Portador do Susano\'o',
    initials: 'MU',
    accentColor: '#DC2626',
    bgGradient: 'from-red-700/30 to-zinc-950/70',
    emojiIcon: '🔥',
  },
  {
    id: 'gaara',
    name: 'Gaara do Deserto',
    title: 'Quinto Kazekage & Defesa Absoluta',
    initials: 'GD',
    accentColor: '#D97706',
    bgGradient: 'from-amber-700/30 to-stone-950/70',
    emojiIcon: '🏺',
  },
  {
    id: 'hinata',
    name: 'Hinata Hyūga',
    title: 'Princesa do Byakugan & Punho Gentil',
    initials: 'HH',
    accentColor: '#A78BFA',
    bgGradient: 'from-indigo-600/30 to-purple-950/60',
    emojiIcon: '👁️',
  },
  {
    id: 'obito',
    name: 'Obito Uchiha',
    title: 'Líder nas Sombras & Mangekyō Kamui',
    initials: 'OU',
    accentColor: '#6366F1',
    bgGradient: 'from-indigo-700/30 to-zinc-950/70',
    emojiIcon: '🌀',
  },
  {
    id: 'anbu_mask',
    name: 'Capitão ANBU',
    title: 'Operações Especiais de Assassinato de Konoha',
    initials: 'AB',
    accentColor: '#94A3B8',
    bgGradient: 'from-slate-600/30 to-zinc-950/70',
    emojiIcon: '🎭',
  },
];

export const AVATAR_FRAMES: AvatarFrameOption[] = [
  {
    id: 'frame_default',
    name: 'Aço de Konoha',
    borderClass: 'border-zinc-700/80 shadow-none',
    glowClass: 'shadow-zinc-800/40',
    description: 'Moldura de ferro forjado dos estudantes da academia.',
    requirementLabel: 'Inicial (Livre)',
  },
  {
    id: 'frame_fire',
    name: 'Chakra Katon (Fogo)',
    borderClass: 'border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]',
    glowClass: 'shadow-rose-500/50',
    description: 'Aura incandescente forjada nas chamas da Folha.',
    minRank: 'gennin',
    requirementLabel: 'Requer Patente Gennin',
  },
  {
    id: 'frame_wind',
    name: 'Chakra Fūton (Vento)',
    borderClass: 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]',
    glowClass: 'shadow-emerald-500/50',
    description: 'Borda etérea com fluxo contínuo de ar cortante.',
    minRank: 'chunin',
    requirementLabel: 'Requer Patente Chūnin',
  },
  {
    id: 'frame_lightning',
    name: 'Chakra Raiton (Raio)',
    borderClass: 'border-cyan-400 shadow-[0_0_18px_rgba(6,182,212,0.5)]',
    glowClass: 'shadow-cyan-400/60',
    description: 'Descargas elétricas azuis de alta velocidade.',
    minRank: 'tokubetsu_jonin',
    requirementLabel: 'Requer Tokubetsu Jōnin',
  },
  {
    id: 'frame_anbu',
    name: 'Sombra da Névoa (Obsidiana)',
    borderClass: 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.5)]',
    glowClass: 'shadow-purple-500/60',
    description: 'Borda obsidiana com brilho violeta das operações secretas.',
    minRank: 'anbu',
    minBossId: 15,
    requirementLabel: 'Requer Patente ANBU ou Chefe 15',
  },
  {
    id: 'frame_hokage',
    name: 'Vontade do Fogo (Dourada)',
    borderClass: 'border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.6)] ring-1 ring-amber-300/40',
    glowClass: 'shadow-amber-400/70',
    description: 'Aura nobre e imponente dos líderes máximos de Konoha.',
    minRank: 'kage',
    minBossId: 30,
    requirementLabel: 'Requer Patente Kage ou Chefe 30',
  },
  {
    id: 'frame_rikudou',
    name: 'Seis Caminhos Divinos',
    borderClass: 'border-white shadow-[0_0_30px_rgba(255,255,255,0.7)] ring-2 ring-cyan-400/50 animate-pulse',
    glowClass: 'shadow-white/80',
    description: 'Moldura celestial cósmica dos descendentes de Otsutsuki.',
    minRank: 'rikudou',
    minBossId: 40,
    requirementLabel: 'Requer Patente Rikudou ou Chefe 40',
  },
];

export const FAVORITE_NINJAS: FavoriteNinjaOption[] = [
  {
    id: 'naruto',
    name: 'Naruto Uzumaki',
    title: 'O Sétimo Hokage',
    quote: 'Eu nunca volto atrás na minha palavra... esse é o meu caminho ninja!',
    insignia: '🍥',
    clan: 'Uzumaki',
  },
  {
    id: 'sasuke',
    name: 'Sasuke Uchiha',
    title: 'O Hokage das Sombras',
    quote: 'Meus olhos enxergam a escuridão do mundo claramente.',
    insignia: '👁️',
    clan: 'Uchiha',
  },
  {
    id: 'kakashi',
    name: 'Kakashi Hatake',
    title: 'O Ninja Copiador',
    quote: 'Aqueles que quebram as regras são lixo, mas os que abandonam seus amigos são piores que lixo.',
    insignia: '⚡',
    clan: 'Hatake',
  },
  {
    id: 'itachi',
    name: 'Itachi Uchiha',
    title: 'O Mártir de Konoha',
    quote: 'Não importa quem você seja, ninguém conhece o seu verdadeiro eu até a hora da morte.',
    insignia: '🐦‍⬛',
    clan: 'Uchiha',
  },
  {
    id: 'minato',
    name: 'Minato Namikaze',
    title: 'O Relâmpago Amarelo',
    quote: 'Por aqueles que amo, eu cruzaria qualquer distância em um piscar de olhos.',
    insignia: '🗡️',
    clan: 'Namikaze',
  },
  {
    id: 'jiraiya',
    name: 'Jiraiya',
    title: 'O Galante Sábio dos Sapos',
    quote: 'A verdadeira medida de um shinobi não é como ele vive, mas sim como ele morre.',
    insignia: '📜',
    clan: 'Sannin',
  },
  {
    id: 'tsunade',
    name: 'Tsunade Senju',
    title: 'A Lendária Kage Médica',
    quote: 'Pessoas ficam mais fortes quando têm algo importante que querem proteger.',
    insignia: '💎',
    clan: 'Senju',
  },
  {
    id: 'madara',
    name: 'Madara Uchiha',
    title: 'O Patriarca da Guerra',
    quote: 'Acorde para a realidade. Neste mundo, onde há luz, há sempre sombras.',
    insignia: '🔥',
    clan: 'Uchiha',
  },
  {
    id: 'gaara',
    name: 'Gaara',
    title: 'O Kazekage da Areia',
    quote: 'A paz alcançada através do sofrimento compartilhado é a mais duradoura.',
    insignia: '🏺',
    clan: 'Kazekage',
  },
  {
    id: 'pain',
    name: 'Pain (Nagato)',
    title: 'Deus de Amegakure',
    quote: 'Aqueles que não entendem a verdadeira dor nunca poderão entender a verdadeira paz.',
    insignia: '🌧️',
    clan: 'Uzumaki',
  },
];

export const SHINOBI_RANK_PROGRESSION_ORDER: readonly ShinobiRankId[] = [
  'estudante',
  'gennin',
  'chunin',
  'tokubetsu_jonin',
  'jonin',
  'anbu',
  'sannin',
  'kage',
  'rikudou',
] as const;

export function isFrameUnlocked(
  frame: AvatarFrameOption,
  currentRankId: ShinobiRankId = 'estudante',
  highestBossDefeated: number = 0
): boolean {
  // Borda inicial sempre livre
  if (!frame.minRank && !frame.minBossId) {
    return true;
  }

  // Verifica requisito de patente se houver
  if (frame.minRank) {
    const playerRankIndex = SHINOBI_RANK_PROGRESSION_ORDER.indexOf(currentRankId);
    const requiredRankIndex = SHINOBI_RANK_PROGRESSION_ORDER.indexOf(frame.minRank);
    if (playerRankIndex >= 0 && requiredRankIndex >= 0 && playerRankIndex >= requiredRankIndex) {
      return true;
    }
  }

  // Verifica requisito de Gauntlet Boss se houver
  if (frame.minBossId && highestBossDefeated >= frame.minBossId) {
    return true;
  }

  return false;
}

export function getAvatarById(avatarId?: string): ShinobiAvatarOption {
  const found = SHINOBI_AVATARS.find((a) => a.id === avatarId);
  return found || SHINOBI_AVATARS[0];
}

export function getFrameById(frameId?: string): AvatarFrameOption {
  const found = AVATAR_FRAMES.find((f) => f.id === frameId);
  return found || AVATAR_FRAMES[0];
}

export function getFavoriteNinjaById(ninjaIdOrName?: string): FavoriteNinjaOption {
  if (!ninjaIdOrName) return FAVORITE_NINJAS[0];
  const found = FAVORITE_NINJAS.find(
    (n) => n.id === ninjaIdOrName || n.name.toLowerCase() === ninjaIdOrName.toLowerCase()
  );
  return found || FAVORITE_NINJAS[0];
}

