export interface ShinobiInsignia {
  id: string;
  name: string;
  category: 'LEADERSHIP' | 'COMBAT' | 'LINEAGE' | 'LEGACY';
  color: string;
  bgGlow: string;
  borderClass: string;
  iconType: 'SHIELD' | 'BOOST' | 'HEXAGON' | 'HASH' | 'SWORDS' | 'EYE' | 'FLAME' | 'CROWN';
  description: string;
  requirementHint: string;
}

export interface BannerPreset {
  id: string;
  name: string;
  imageUrl: string;
  theme: string;
}

export const SHINOBI_INSIGNIAS: ShinobiInsignia[] = [
  {
    id: 'insignia_command',
    name: 'Guarda Tática de Konoha',
    category: 'LEADERSHIP',
    color: 'text-violet-400',
    bgGlow: 'bg-violet-600/20 text-violet-300 shadow-[0_0_10px_rgba(139,92,246,0.5)]',
    borderClass: 'border-violet-500/50 hover:border-violet-400',
    iconType: 'SHIELD',
    description: 'Condecoração concedida a capitães de esquadrão da Guarda de Konoha e lideranças táticas.',
    requirementHint: 'Disponível para shinobis de destaque em Konoha.',
  },
  {
    id: 'insignia_boost',
    name: 'Impulso Tempestuoso (Boost)',
    category: 'COMBAT',
    color: 'text-cyan-300',
    bgGlow: 'bg-cyan-500/20 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.5)]',
    borderClass: 'border-cyan-500/50 hover:border-cyan-300',
    iconType: 'BOOST',
    description: 'Dominador da canalização contínua de CPS e aceleração supersônica de chakra.',
    requirementHint: 'Ative alta taxa de geração de chakra.',
  },
  {
    id: 'insignia_gem',
    name: 'Gema Ancestral Rikudō',
    category: 'LEGACY',
    color: 'text-pink-400',
    bgGlow: 'bg-pink-600/20 text-pink-300 shadow-[0_0_12px_rgba(236,72,153,0.5)]',
    borderClass: 'border-pink-500/50 hover:border-pink-400',
    iconType: 'HEXAGON',
    description: 'Portador da centelha primordial do Sábio dos Seis Caminhos e reencarnações lendárias.',
    requirementHint: 'Conquiste chakra ancestral ou renascimentos.',
  },
  {
    id: 'insignia_verified_hash',
    name: 'Registro Shinobi Verificado (#)',
    category: 'LEGACY',
    color: 'text-emerald-400',
    bgGlow: 'bg-emerald-500/20 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.5)]',
    borderClass: 'border-emerald-500/50 hover:border-emerald-400',
    iconType: 'HASH',
    description: 'Identidade shinobi ativa sincronizada com o banco central da Folha.',
    requirementHint: 'Conta registrada e verificada com sucesso.',
  },
  {
    id: 'insignia_gauntlet',
    name: 'Campeão da Grande Guerra',
    category: 'COMBAT',
    color: 'text-amber-400',
    bgGlow: 'bg-amber-500/20 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.5)]',
    borderClass: 'border-amber-500/50 hover:border-amber-400',
    iconType: 'SWORDS',
    description: 'Vencedor de combates mortais contra os chefes mais temidos do Gauntlet.',
    requirementHint: 'Derrote chefes desafiadores no Gauntlet.',
  },
  {
    id: 'insignia_sharingan',
    name: 'Olhos da Verdade Ocular',
    category: 'LINEAGE',
    color: 'text-rose-400',
    bgGlow: 'bg-rose-600/20 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.5)]',
    borderClass: 'border-rose-500/50 hover:border-rose-400',
    iconType: 'EYE',
    description: 'Despertar das linhagens visuais lendárias capazes de antever qualquer jutsu.',
    requirementHint: 'Desbloqueie nós de clã e técnicas secretas.',
  },
  {
    id: 'insignia_fire',
    name: 'Chama da Vontade do Fogo',
    category: 'LEADERSHIP',
    color: 'text-orange-400',
    bgGlow: 'bg-orange-500/20 text-orange-300 shadow-[0_0_10px_rgba(249,115,22,0.5)]',
    borderClass: 'border-orange-500/50 hover:border-orange-400',
    iconType: 'FLAME',
    description: 'A chama inextinguível dos que nunca desistem e protegem seus aliados.',
    requirementHint: 'Mantenha a bravura em combate e presença ativa.',
  },
  {
    id: 'insignia_crown',
    name: 'Soberania dos Kages',
    category: 'LEGACY',
    color: 'text-yellow-400',
    bgGlow: 'bg-yellow-500/20 text-yellow-300 shadow-[0_0_12px_rgba(234,179,8,0.5)]',
    borderClass: 'border-yellow-500/50 hover:border-yellow-400',
    iconType: 'CROWN',
    description: 'O manto supremo dos que alcançaram o topo dos rankings ninja.',
    requirementHint: 'Alcance patentes elevadas de shinobi.',
  },
];

export const DEFAULT_BANNER_PRESETS: BannerPreset[] = [
  {
    id: 'manga_noir',
    name: 'Mangá Noir & Gato Preto (Estilo Referência)',
    imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1200&auto=format&fit=crop',
    theme: 'Dark Anime Monochrome',
  },
  {
    id: 'konoha_moonlight',
    name: 'Noite Sob a Aldeia da Folha',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop',
    theme: 'Deep Night & Fog',
  },
  {
    id: 'storm_waterfall',
    name: 'Vale do Fim & Tormenta Noturna',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
    theme: 'Dark Waters & Lightning',
  },
  {
    id: 'akatsuki_eclipse',
    name: 'Eclipse Carmesim & Sombras',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop',
    theme: 'Crimson Sky',
  },
  {
    id: 'cosmic_sixpaths',
    name: 'Cosmos dos Seis Caminhos',
    imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1200&auto=format&fit=crop',
    theme: 'Cosmic Darkness',
  },
];

export function getInsigniaById(id: string): ShinobiInsignia | undefined {
  return SHINOBI_INSIGNIAS.find((i) => i.id === id);
}

export function getDefaultEquippedInsignias(): string[] {
  return ['insignia_command', 'insignia_boost', 'insignia_gem', 'insignia_verified_hash'];
}
