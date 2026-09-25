import Decimal from 'break_infinity.js';
import { D } from '../engine/BigNumber';
import { ShinobiRankDefinition, ShinobiRankId, RivalShinobi } from '../types/rankings';

export const SHINOBI_RANKS: ShinobiRankDefinition[] = [
  {
    id: 'estudante',
    title: 'Estudante da Academia',
    subtitle: 'Aprendiz nos primeiros passos das artes shinobi',
    minClicksAllTime: 0,
    minCPS: D(0),
    minPrestiges: 0,
    badgeClass: 'text-zinc-400 bg-zinc-800/80 border-zinc-700/60',
    borderClass: 'border-zinc-800',
    accentColor: '#a1a1aa',
    reward: {
      title: 'Graduação Inicial',
      description: 'Nenhuma recompensa ativa nesta fase básica.',
      effectType: 'click_power_pct',
      value: 0,
    },
  },
  {
    id: 'gennin',
    title: 'Ninja Gennin',
    subtitle: 'Portador da bandana oficial da aldeia',
    minClicksAllTime: 100,
    minCPS: D(10),
    minPrestiges: 0,
    badgeClass: 'text-amber-400 bg-amber-950/40 border-amber-600/50',
    borderClass: 'border-amber-700/60',
    accentColor: '#f59e0b',
    reward: {
      title: 'Disciplina Gennin',
      description: '+5% permanente na produção de CPS global.',
      effectType: 'cps_global_pct',
      value: 5,
    },
  },
  {
    id: 'chunin',
    title: 'Ninja Chūnin',
    subtitle: 'Líder tático aprovado pelo Exame Chūnin',
    minClicksAllTime: 500,
    minCPS: D(250),
    minPrestiges: 0,
    badgeClass: 'text-emerald-400 bg-emerald-950/40 border-emerald-600/50',
    borderClass: 'border-emerald-700/60',
    accentColor: '#10b981',
    reward: {
      title: 'Liderança Tática Chūnin',
      description: '+10% no valor de clique manual e 1 Bilhete da Forja Gacha.',
      effectType: 'click_power_pct',
      value: 10,
    },
  },
  {
    id: 'tokubetsu_jonin',
    title: 'Tokubetsu Jōnin',
    subtitle: 'Especialista em inteligência, rastreamento e barreiras',
    minClicksAllTime: 2000,
    minCPS: D(5000),
    minPrestiges: 0,
    badgeClass: 'text-teal-400 bg-teal-950/40 border-teal-600/50',
    borderClass: 'border-teal-700/60',
    accentColor: '#14b8a6',
    reward: {
      title: 'Especialização Ninja',
      description: '+15% de CPS global e +5% de chance de crítico.',
      effectType: 'cps_global_pct',
      value: 15,
    },
  },
  {
    id: 'jonin',
    title: 'Ninja Jōnin de Elite',
    subtitle: 'Comandante de missões de alto escalão e esquadrões',
    minClicksAllTime: 5000,
    minCPS: D(100000),
    minPrestiges: 0,
    badgeClass: 'text-cyan-400 bg-cyan-950/40 border-cyan-600/50',
    borderClass: 'border-cyan-700/60',
    accentColor: '#06b6d4',
    reward: {
      title: 'Maestria Jōnin',
      description: '5 Fragmentos de Armas e -3% no custo de todos os geradores.',
      effectType: 'generator_cost_pct',
      value: 3,
    },
  },
  {
    id: 'anbu',
    title: 'Capitão da ANBU',
    subtitle: 'Esquadrão tático de assassinatos e operações secretas',
    minClicksAllTime: 12000,
    minCPS: D(2000000),
    minPrestiges: 0,
    badgeClass: 'text-rose-400 bg-rose-950/40 border-rose-600/50',
    borderClass: 'border-rose-700/60',
    accentColor: '#f43f5e',
    reward: {
      title: 'Máscara das Sombras',
      description: '+25% de clique manual e +20% no CPS global.',
      effectType: 'click_power_pct',
      value: 25,
    },
  },
  {
    id: 'sannin',
    title: 'Sannin / Mestre Sábio',
    subtitle: 'Lenda viva respeitada através de todas as grandes nações',
    minClicksAllTime: 30000,
    minCPS: D(50000000),
    minPrestiges: 1,
    badgeClass: 'text-purple-400 bg-purple-950/40 border-purple-600/50',
    borderClass: 'border-purple-700/60',
    accentColor: '#a855f7',
    reward: {
      title: 'Tradição dos Três Lendários',
      description: '+50% de CPS global e +0.4% de conversão sub-linear de CPS^0.65 para clique.',
      effectType: 'cps_global_pct',
      value: 50,
    },
  },
  {
    id: 'kage',
    title: 'Hokage / Kage da Vila',
    subtitle: 'Líder supremo e guardião da Chama da Aldeia',
    minClicksAllTime: 75000,
    minCPS: D(1000000000),
    minPrestiges: 2,
    badgeClass: 'text-amber-300 bg-amber-950/50 border-amber-500/50',
    borderClass: 'border-amber-500/60',
    accentColor: '#fbbf24',
    reward: {
      title: 'Vontade do Fogo Suprema',
      description: '10 unidades de Chakra Ancestral direto e desbloqueio de aura cosmética.',
      effectType: 'ancestral_chakra',
      value: 10,
    },
  },
  {
    id: 'rikudou',
    title: 'Deus Shinobi (Rikudou)',
    subtitle: 'Encarnação primordial do Sábio dos Seis Caminhos',
    minClicksAllTime: 150000,
    minCPS: D(100000000000),
    minPrestiges: 5,
    badgeClass: 'text-fuchsia-300 bg-fuchsia-950/50 border-fuchsia-500/50',
    borderClass: 'border-fuchsia-500/60',
    accentColor: '#e879f9',
    reward: {
      title: 'Banbutsu Sōzō Divino',
      description: 'Multiplicador global de 2x (dobro) em toda a produção.',
      effectType: 'global_multiplier',
      value: 2,
    },
  },
];

export const SHINOBI_RANKS_MAP = Object.fromEntries(
  SHINOBI_RANKS.map((r) => [r.id, r])
) as Record<ShinobiRankId, ShinobiRankDefinition>;

/**
 * Retorna a patente atual baseada nas estatísticas do jogador
 */
export function getCurrentRank(
  allTimeClicks: number,
  highestCPS: Decimal,
  prestiges: number
): ShinobiRankDefinition {
  for (let i = SHINOBI_RANKS.length - 1; i >= 0; i--) {
    const rank = SHINOBI_RANKS[i];
    if (
      allTimeClicks >= rank.minClicksAllTime &&
      highestCPS.gte(rank.minCPS) &&
      prestiges >= rank.minPrestiges
    ) {
      return rank;
    }
  }
  return SHINOBI_RANKS[0];
}

/**
 * Retorna a próxima patente após a atual
 */
export function getNextRank(currentRankId: ShinobiRankId): ShinobiRankDefinition | null {
  const currentIndex = SHINOBI_RANKS.findIndex((r) => r.id === currentRankId);
  if (currentIndex === -1 || currentIndex >= SHINOBI_RANKS.length - 1) {
    return null;
  }
  return SHINOBI_RANKS[currentIndex + 1];
}

/**
 * Calcula o progresso percentual (0 a 100) para a próxima patente
 */
export function calculateRankProgress(
  currentRank: ShinobiRankDefinition,
  nextRank: ShinobiRankDefinition | null,
  allTimeClicks: number,
  highestCPS: Decimal,
  prestiges: number
): { overallProgress: number; clicksPct: number; cpsPct: number; prestigesPct: number } {
  if (!nextRank) {
    return { overallProgress: 100, clicksPct: 100, cpsPct: 100, prestigesPct: 100 };
  }

  // Progresso de Cliques
  const clicksReq = Math.max(1, nextRank.minClicksAllTime - currentRank.minClicksAllTime);
  const currentClicksProgress = Math.max(0, allTimeClicks - currentRank.minClicksAllTime);
  const clicksPct = Math.min(100, (currentClicksProgress / clicksReq) * 100);

  // Progresso de CPS
  let cpsPct = 100;
  if (nextRank.minCPS.gt(currentRank.minCPS)) {
    const curCPS = highestCPS.sub(currentRank.minCPS).max(0);
    const neededCPS = nextRank.minCPS.sub(currentRank.minCPS);
    try {
      const ratio = curCPS.div(neededCPS).toNumber();
      cpsPct = Math.max(0, Math.min(100, ratio * 100));
    } catch {
      cpsPct = highestCPS.gte(nextRank.minCPS) ? 100 : 0;
    }
  }

  // Progresso de Prestígios
  const prestigesReq = Math.max(1, nextRank.minPrestiges - currentRank.minPrestiges);
  const currentPrestigesProgress = Math.max(0, prestiges - currentRank.minPrestiges);
  const prestigesPct = nextRank.minPrestiges === 0 ? 100 : Math.min(100, (currentPrestigesProgress / prestigesReq) * 100);

  // Média ponderada
  const overallProgress = Math.min(100, Math.floor((clicksPct + cpsPct + prestigesPct) / 3));

  return {
    overallProgress,
    clicksPct: Math.floor(clicksPct),
    cpsPct: Math.floor(cpsPct),
    prestigesPct: Math.floor(prestigesPct),
  };
}

/**
 * Elenco canônico do Hall da Fama / Rivalry Board
 */
export const RIVAL_SHINOBIS: RivalShinobi[] = [
  {
    rankPosition: 1,
    name: 'Hagoromo Otsutsuki',
    title: 'Sábio dos Seis Caminhos',
    rankId: 'rikudou',
    avatar: 'otsutsuki_god',
    sessionClicks: 24500,
    allTimeClicks: 520000,
    peakCPS: D('500000000000'),
    prestiges: 12,
    quote: 'O chakra foi criado para conectar os corações dos homens.',
  },
  {
    rankPosition: 2,
    name: 'Hashirama Senju',
    title: 'Primeiro Hokage (Deus Shinobi)',
    rankId: 'kage',
    avatar: 'senju_elite',
    sessionClicks: 18200,
    allTimeClicks: 320000,
    peakCPS: D('25000000000'),
    prestiges: 8,
    quote: 'Para proteger a aldeia, suportaremos qualquer fardo.',
  },
  {
    rankPosition: 3,
    name: 'Madara Uchiha',
    title: 'Lenda de Konoha',
    rankId: 'kage',
    avatar: 'uchiha_elite',
    sessionClicks: 16900,
    allTimeClicks: 290000,
    peakCPS: D('18000000000'),
    prestiges: 7,
    quote: 'Neste mundo onde há luz, também há sombras correspondentes.',
  },
  {
    rankPosition: 4,
    name: 'Minato Namikaze',
    title: 'Quarto Hokage (Relâmpago Amarelo)',
    rankId: 'kage',
    avatar: 'kage',
    sessionClicks: 11400,
    allTimeClicks: 110000,
    peakCPS: D('2500000000'),
    prestiges: 4,
    quote: 'A velocidade dos reflexos supera qualquer jōnin em campo.',
  },
  {
    rankPosition: 5,
    name: 'Jiraiya (Gama Sennin)',
    title: 'Sannin Lendário dos Sapos',
    rankId: 'sannin',
    avatar: 'sannin',
    sessionClicks: 7800,
    allTimeClicks: 48000,
    peakCPS: D('120000000'),
    prestiges: 2,
    quote: 'O verdadeiro talento de um shinobi é não desistir jamais.',
  },
  {
    rankPosition: 6,
    name: 'Itachi Uchiha',
    title: 'Capitão da ANBU nas Sombras',
    rankId: 'anbu',
    avatar: 'anbu',
    sessionClicks: 5200,
    allTimeClicks: 22000,
    peakCPS: D('8500000'),
    prestiges: 1,
    quote: 'Mesmo a ilusão mais perfeita não oculta a verdade do olhar.',
  },
  {
    rankPosition: 7,
    name: 'Kakashi Hatake',
    title: 'Ninja Copiador dos Mil Jutsus',
    rankId: 'jonin',
    avatar: 'jonin',
    sessionClicks: 3200,
    allTimeClicks: 8400,
    peakCPS: D('450000'),
    prestiges: 0,
    quote: 'Aqueles que quebram as regras são lixo, mas quem abandona amigos é pior.',
  },
  {
    rankPosition: 8,
    name: 'Neji Hyūga',
    title: 'Prodígio dos Oito Trigramas',
    rankId: 'tokubetsu_jonin',
    avatar: 'hyuga_elite',
    sessionClicks: 1400,
    allTimeClicks: 3600,
    peakCPS: D('24000'),
    prestiges: 0,
    quote: 'Nenhum pássaro permanece preso quando decide cortar o céu.',
  },
  {
    rankPosition: 9,
    name: 'Rock Lee',
    title: 'Especialista em Lótus Primária',
    rankId: 'chunin',
    avatar: 'chunin',
    sessionClicks: 850,
    allTimeClicks: 1200,
    peakCPS: D('800'),
    prestiges: 0,
    quote: 'Com esforço contínuo, até um gênio pode ser superado.',
  },
  {
    rankPosition: 10,
    name: 'Iruka Umino',
    title: 'Instrutor da Academia',
    rankId: 'gennin',
    avatar: 'genin',
    sessionClicks: 320,
    allTimeClicks: 320,
    peakCPS: D('45'),
    prestiges: 0,
    quote: 'Um shinobi aprende a levantar sempre que cai no treino.',
  },
];
