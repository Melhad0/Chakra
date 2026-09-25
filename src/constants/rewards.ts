import { ShinobiRankId } from '../types/rankings';

export interface OnlinePresenceTier {
  readonly id: string;
  readonly timeSeconds: number;
  readonly title: string;
  readonly desc: string;
  readonly cpsSeconds: number;
  readonly minRank?: ShinobiRankId;
  readonly gachaTickets?: number;
  readonly weaponFragments?: number;
  readonly ancestralChakra?: number;
  readonly buffCpsPct?: number;
  readonly buffDurationSeconds?: number;
}

export const ONLINE_PRESENCE_TIERS: OnlinePresenceTier[] = [
  {
    id: 'tier_5m',
    timeSeconds: 300,
    title: 'Treinamento Inicial (5 Min)',
    desc: '15 segundos de CPS estável (limitado a 50% do custo do maior gerador).',
    cpsSeconds: 15,
  },
  {
    id: 'tier_10m',
    timeSeconds: 600,
    title: 'Foco de Respiração (10 Min)',
    desc: '45 segundos de CPS estável + 2 Fragmentos de Armas.',
    cpsSeconds: 45,
    weaponFragments: 2,
  },
  {
    id: 'tier_30m',
    timeSeconds: 1800,
    title: 'Perseverança Ninja (30 Min)',
    desc: '180 segundos de CPS estável + 1 Bilhete da Forja Gacha (Requer Patente Gennin).',
    cpsSeconds: 180,
    minRank: 'gennin',
    gachaTickets: 1,
  },
  {
    id: 'tier_1h',
    timeSeconds: 3600,
    title: 'Espírito Inabalável (1 Hora)',
    desc: '400 segundos de CPS estável + 5 Fragmentos de Armas.',
    cpsSeconds: 400,
    weaponFragments: 5,
  },
  {
    id: 'tier_2h',
    timeSeconds: 7200,
    title: 'Vontade do Fogo (2 Horas)',
    desc: '2 unidades de Chakra Ancestral direto + Bônus de +10% no CPS por 30 minutos.',
    cpsSeconds: 0,
    ancestralChakra: 2,
    buffCpsPct: 10,
    buffDurationSeconds: 1800, // 30 minutos
  },
];
