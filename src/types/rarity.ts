export type ItemRarity =
  | 'BASIC'
  | 'COMMON'
  | 'UNCOMMON'
  | 'RARE'
  | 'VERY_RARE'
  | 'EPIC'
  | 'LEGENDARY'
  | 'MYTHIC'
  | 'DIVINE'
  | 'ADM';

export interface RarityDefinition {
  tier: number;
  id: ItemRarity;
  label: string;
  colorHex: string;
  badgeClass: string;
  borderClass: string;
  textClass: string;
  glowClass: string;
  bgGradientClass?: string;
  dropWeight: number; // Peso estocástico de saque
  sacrificeEssence: number; // Rendimento base no Sacrifício Elemental
}

export const RARITY_ORDER: Record<ItemRarity, number> = {
  BASIC: 1,
  COMMON: 2,
  UNCOMMON: 3,
  RARE: 4,
  VERY_RARE: 5,
  EPIC: 6,
  LEGENDARY: 7,
  MYTHIC: 8,
  DIVINE: 9,
  ADM: 10,
};

export const RARITY_CONFIG: Record<ItemRarity, RarityDefinition> = {
  BASIC: {
    tier: 1,
    id: 'BASIC',
    label: 'Básico',
    colorHex: '#71717A',
    badgeClass: 'bg-zinc-900/80 text-zinc-400 border-zinc-600',
    borderClass: 'border-zinc-600',
    textClass: 'text-zinc-400',
    glowClass: '',
    dropWeight: 400,
    sacrificeEssence: 1,
  },
  COMMON: {
    tier: 2,
    id: 'COMMON',
    label: 'Comum',
    colorHex: '#15803D',
    badgeClass: 'bg-emerald-950/70 text-emerald-400 border-emerald-800',
    borderClass: 'border-emerald-800',
    textClass: 'text-emerald-500',
    glowClass: '',
    dropWeight: 280,
    sacrificeEssence: 3,
  },
  UNCOMMON: {
    tier: 3,
    id: 'UNCOMMON',
    label: 'Incomum',
    colorHex: '#22C55E',
    badgeClass: 'bg-green-950/70 text-green-300 border-green-500',
    borderClass: 'border-green-500',
    textClass: 'text-green-400',
    glowClass: 'shadow-[0_0_8px_rgba(34,197,94,0.25)]',
    dropWeight: 180,
    sacrificeEssence: 8,
  },
  RARE: {
    tier: 4,
    id: 'RARE',
    label: 'Raro',
    colorHex: '#1D4ED8',
    badgeClass: 'bg-blue-950/70 text-blue-300 border-blue-700',
    borderClass: 'border-blue-700',
    textClass: 'text-blue-400',
    glowClass: 'shadow-[0_0_12px_rgba(29,78,216,0.35)]',
    dropWeight: 100,
    sacrificeEssence: 20,
  },
  VERY_RARE: {
    tier: 5,
    id: 'VERY_RARE',
    label: 'Muito Raro',
    colorHex: '#00F0FF',
    badgeClass: 'bg-cyan-950/70 text-cyan-200 border-cyan-400',
    borderClass: 'border-cyan-400',
    textClass: 'text-cyan-300',
    glowClass: 'drop-shadow-[0_0_6px_#00f0ff] shadow-[0_0_14px_rgba(0,240,255,0.45)]',
    dropWeight: 50,
    sacrificeEssence: 50,
  },
  EPIC: {
    tier: 6,
    id: 'EPIC',
    label: 'Épico',
    colorHex: '#A855F7',
    badgeClass: 'bg-purple-950/70 text-purple-200 border-purple-500',
    borderClass: 'border-purple-500',
    textClass: 'text-purple-400',
    glowClass: 'drop-shadow-[0_0_8px_#a855f7] shadow-[0_0_18px_rgba(168,85,247,0.5)]',
    dropWeight: 25,
    sacrificeEssence: 130,
  },
  LEGENDARY: {
    tier: 7,
    id: 'LEGENDARY',
    label: 'Lendário',
    colorHex: '#EAB308',
    badgeClass: 'bg-amber-950/70 text-amber-200 border-amber-400',
    borderClass: 'border-amber-400',
    textClass: 'text-amber-300 font-bold',
    glowClass: 'drop-shadow-[0_0_10px_#facc15] shadow-[0_0_22px_rgba(234,179,8,0.6)]',
    dropWeight: 10,
    sacrificeEssence: 350,
  },
  MYTHIC: {
    tier: 8,
    id: 'MYTHIC',
    label: 'Mítico',
    colorHex: '#EC4899',
    badgeClass: 'bg-black/80 text-white border-transparent bg-gradient-to-r from-red-500 via-amber-400 via-emerald-400 via-cyan-400 to-purple-500 animate-shimmer',
    borderClass: 'border-transparent',
    textClass: 'text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-amber-300 to-cyan-300 font-extrabold',
    glowClass: 'shadow-[0_0_25px_rgba(236,72,153,0.65)]',
    bgGradientClass: 'bg-gradient-to-r from-red-500/20 via-emerald-500/20 via-cyan-500/20 to-purple-500/20 animate-shimmer',
    dropWeight: 4,
    sacrificeEssence: 1000,
  },
  DIVINE: {
    tier: 9,
    id: 'DIVINE',
    label: 'Divino',
    colorHex: '#FFFFFF',
    badgeClass: 'bg-slate-900 text-white border-white',
    borderClass: 'border-white',
    textClass: 'text-white font-extrabold tracking-wide drop-shadow-[0_0_8px_#ffffff]',
    glowClass: 'shadow-[0_0_16px_#ffffff] drop-shadow-[0_0_12px_rgba(255,255,255,0.85)]',
    dropWeight: 1.5,
    sacrificeEssence: 3000,
  },
  ADM: {
    tier: 10,
    id: 'ADM',
    label: "ADM's",
    colorHex: '#09090B',
    badgeClass: 'bg-[#09090b] text-zinc-100 border-zinc-400 ring-1 ring-cyan-400/40',
    borderClass: 'border-zinc-300 shadow-[inset_0_0_12px_rgba(255,255,255,0.25)]',
    textClass: 'text-zinc-100 font-black tracking-widest drop-shadow-[0_0_6px_rgba(255,255,255,0.5)]',
    glowClass: 'shadow-[0_0_22px_rgba(0,0,0,0.9)] ring-2 ring-white/30',
    bgGradientClass: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800 via-[#09090b] to-black',
    dropWeight: 0.2,
    sacrificeEssence: 10000,
  },
};

const LEGACY_MAP: Record<string, ItemRarity> = {
  COMMON: 'COMMON',
  UNCOMMON: 'UNCOMMON',
  RARE: 'RARE',
  EPIC: 'EPIC',
  LEGENDARY: 'LEGENDARY',
  MYTHIC: 'MYTHIC',
};

export function normalizeItemRarity(rawRarity: string | undefined): ItemRarity {
  if (!rawRarity) return 'COMMON';
  const upper = rawRarity.toUpperCase().trim();
  if (upper in RARITY_CONFIG) {
    return upper as ItemRarity;
  }
  if (upper in LEGACY_MAP) {
    return LEGACY_MAP[upper];
  }
  return 'COMMON';
}

export function getRarityConfig(rarity: ItemRarity | string | undefined): RarityDefinition {
  if (!rarity) return RARITY_CONFIG.COMMON;
  const normalized = normalizeItemRarity(rarity);
  return RARITY_CONFIG[normalized] || RARITY_CONFIG.COMMON;
}

