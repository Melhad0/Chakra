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
    desc: '45 segundos de CPS estável + 2 Fragmentos de Armas da Forja.',
    cpsSeconds: 45,
    weaponFragments: 2,
  },
  {
    id: 'tier_30m',
    timeSeconds: 1800,
    title: 'Perseverança Ninja (30 Min)',
    desc: '180 segundos de CPS estável + 1 Bilhete da Forja Gacha.',
    cpsSeconds: 180,
    minRank: 'gennin',
    gachaTickets: 1,
  },
  {
    id: 'tier_1h',
    timeSeconds: 3600,
    title: 'Espírito Inabalável (1 Hora)',
    desc: '400 segundos de CPS estável + 5 Fragmentos de Armas da Forja.',
    cpsSeconds: 400,
    minRank: 'gennin',
    weaponFragments: 5,
  },
  {
    id: 'tier_2h',
    timeSeconds: 7200,
    title: 'Vontade do Fogo (2 Horas)',
    desc: '2 unidades de Chakra Ancestral + Bônus de +10% no CPS por 30 minutos.',
    cpsSeconds: 0,
    minRank: 'chunin',
    ancestralChakra: 2,
    buffCpsPct: 10,
    buffDurationSeconds: 1800,
  },
  {
    id: 'tier_4h',
    timeSeconds: 14400,
    title: 'Determinação de Aço (4 Horas)',
    desc: '900 segundos de CPS estável + 10 Fragmentos de Armas + 2 Bilhetes Gacha.',
    cpsSeconds: 900,
    minRank: 'chunin',
    weaponFragments: 10,
    gachaTickets: 2,
  },
  {
    id: 'tier_8h',
    timeSeconds: 28800,
    title: 'Caminho do Guerreiro (8 Horas)',
    desc: '1.800 segundos de CPS estável + 5 Chakra Ancestral + 3 Bilhetes Gacha.',
    cpsSeconds: 1800,
    minRank: 'tokubetsu_jonin',
    ancestralChakra: 5,
    gachaTickets: 3,
  },
  {
    id: 'tier_16h',
    timeSeconds: 57600,
    title: 'Domínio do Tenketsu (16 Horas)',
    desc: '3.600 segundos de CPS estável + 25 Fragmentos de Armas + Bônus de +15% CPS por 45 minutos.',
    cpsSeconds: 3600,
    minRank: 'jonin',
    weaponFragments: 25,
    buffCpsPct: 15,
    buffDurationSeconds: 2700,
  },
  {
    id: 'tier_24h',
    timeSeconds: 86400,
    title: 'Sombra Protetora (24 Horas)',
    desc: '10 Chakra Ancestral + 5 Bilhetes Gacha + 40 Fragmentos de Armas da Forja.',
    cpsSeconds: 0,
    minRank: 'anbu',
    ancestralChakra: 10,
    gachaTickets: 5,
    weaponFragments: 40,
  },
  {
    id: 'tier_50h',
    timeSeconds: 180000,
    title: 'Lenda Shinobi (50 Horas)',
    desc: '7.200 segundos de CPS estável + 20 Chakra Ancestral + 8 Bilhetes Gacha.',
    cpsSeconds: 7200,
    minRank: 'sannin',
    ancestralChakra: 20,
    gachaTickets: 8,
  },
  {
    id: 'tier_75h',
    timeSeconds: 270000,
    title: 'Vontade do Kage (75 Horas)',
    desc: '35 Chakra Ancestral + 10 Bilhetes Gacha + 80 Fragmentos de Armas da Forja.',
    cpsSeconds: 0,
    minRank: 'kage',
    ancestralChakra: 35,
    gachaTickets: 10,
    weaponFragments: 80,
  },
  {
    id: 'tier_100h',
    timeSeconds: 360000,
    title: 'Despertar Rikudou (100 Horas)',
    desc: '15.000 segundos de CPS estável + 50 Chakra Ancestral + 15 Bilhetes Gacha + Bônus Divino de +25% CPS por 1 hora.',
    cpsSeconds: 15000,
    minRank: 'rikudou',
    ancestralChakra: 50,
    gachaTickets: 15,
    buffCpsPct: 25,
    buffDurationSeconds: 3600,
  },
];
