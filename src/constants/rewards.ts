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
    desc: '8 segundos de CPS estável (limitado a 20% do custo do maior gerador).',
    cpsSeconds: 8,
  },
  {
    id: 'tier_10m',
    timeSeconds: 600,
    title: 'Foco de Respiração (10 Min)',
    desc: '20 segundos de CPS estável + 1 Fragmento de Arma da Forja.',
    cpsSeconds: 20,
    weaponFragments: 1,
  },
  {
    id: 'tier_30m',
    timeSeconds: 1800,
    title: 'Perseverança Ninja (30 Min)',
    desc: '80 segundos de CPS estável + 1 Bilhete da Forja Gacha.',
    cpsSeconds: 80,
    minRank: 'gennin',
    gachaTickets: 1,
  },
  {
    id: 'tier_1h',
    timeSeconds: 3600,
    title: 'Espírito Inabalável (1 Hora)',
    desc: '180 segundos de CPS estável + 3 Fragmentos de Armas da Forja.',
    cpsSeconds: 180,
    minRank: 'gennin',
    weaponFragments: 3,
  },
  {
    id: 'tier_2h',
    timeSeconds: 7200,
    title: 'Vontade do Fogo (2 Horas)',
    desc: '1 Chakra Ancestral + Bônus de +8% no CPS por 15 minutos.',
    cpsSeconds: 0,
    minRank: 'chunin',
    ancestralChakra: 1,
    buffCpsPct: 8,
    buffDurationSeconds: 900,
  },
  {
    id: 'tier_4h',
    timeSeconds: 14400,
    title: 'Determinação de Aço (4 Horas)',
    desc: '400 segundos de CPS estável + 5 Fragmentos de Armas + 1 Bilhete Gacha.',
    cpsSeconds: 400,
    minRank: 'chunin',
    weaponFragments: 5,
    gachaTickets: 1,
  },
  {
    id: 'tier_8h',
    timeSeconds: 28800,
    title: 'Caminho do Guerreiro (8 Horas)',
    desc: '800 segundos de CPS estável + 2 Chakra Ancestral + 2 Bilhetes Gacha.',
    cpsSeconds: 800,
    minRank: 'tokubetsu_jonin',
    ancestralChakra: 2,
    gachaTickets: 2,
  },
  {
    id: 'tier_16h',
    timeSeconds: 57600,
    title: 'Domínio do Tenketsu (16 Horas)',
    desc: '1.500 segundos de CPS estável + 12 Fragmentos de Armas + Bônus de +10% CPS por 20 minutos.',
    cpsSeconds: 1500,
    minRank: 'jonin',
    weaponFragments: 12,
    buffCpsPct: 10,
    buffDurationSeconds: 1200,
  },
  {
    id: 'tier_24h',
    timeSeconds: 86400,
    title: 'Sombra Protetora (24 Horas)',
    desc: '4 Chakra Ancestral + 3 Bilhetes Gacha + 20 Fragmentos de Armas da Forja.',
    cpsSeconds: 0,
    minRank: 'anbu',
    ancestralChakra: 4,
    gachaTickets: 3,
    weaponFragments: 20,
  },
  {
    id: 'tier_50h',
    timeSeconds: 180000,
    title: 'Lenda Shinobi (50 Horas)',
    desc: '3.000 segundos de CPS estável + 8 Chakra Ancestral + 4 Bilhetes Gacha.',
    cpsSeconds: 3000,
    minRank: 'sannin',
    ancestralChakra: 8,
    gachaTickets: 4,
  },
  {
    id: 'tier_75h',
    timeSeconds: 270000,
    title: 'Vontade do Kage (75 Horas)',
    desc: '12 Chakra Ancestral + 5 Bilhetes Gacha + 35 Fragmentos de Armas da Forja.',
    cpsSeconds: 0,
    minRank: 'kage',
    ancestralChakra: 12,
    gachaTickets: 5,
    weaponFragments: 35,
  },
  {
    id: 'tier_100h',
    timeSeconds: 360000,
    title: 'Despertar Rikudou (100 Horas)',
    desc: '6.000 segundos de CPS estável + 20 Chakra Ancestral + 8 Bilhetes Gacha + Bônus de +15% CPS por 30 minutos.',
    cpsSeconds: 6000,
    minRank: 'rikudou',
    ancestralChakra: 20,
    gachaTickets: 8,
    buffCpsPct: 15,
    buffDurationSeconds: 1800,
  },
];
