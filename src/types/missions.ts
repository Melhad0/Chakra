import Decimal from 'break_infinity.js';

export type MissionRank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS';

export interface MissionOutcome {
  narrativeResult: string;
  isSuccess: boolean;
  rewardChakraSeconds?: number;      // Segundos de CPS estável a conceder
  rewardChakraFixed?: Decimal;       // Valor fixo adicional de Chakra
  rewardAncestral?: number;          // Chakra Ancestral concedido
  rewardGachaTickets?: number;       // Bilhetes de invocação / gacha
  rewardForgeFragments?: number;     // Fragmentos de forja de armas
  buffDurationSeconds?: number;      // Duração de buff temporário
  buffCpsMultiplier?: number;        // Multiplicador do buff temporário (ex: 2.0 = 2x)
  permanentCpsMultiplier?: number;   // Multiplicador permanente global de CPS (ex: 1.25)
  penaltyExhaustionSeconds?: number; // Reduz o CPS temporariamente (exaustão do esquadrão)
  penaltyChakraLossPercent?: number; // Drena % do saldo atual (0 a 100)
  penaltyCooldownSeconds?: number;   // Cooldown adicional no mural de missões
  penaltyClickExhaustionSeconds?: number; // Exaustão muscular no clique manual
}

export interface MissionChoice {
  id: string;
  actionTitle: string;
  tacticalDescription: string;
  successProbability: number; // Ex: 0.65 = 65% de chance de sucesso
  successOutcome: MissionOutcome;
  failureOutcome: MissionOutcome;
}

export interface ShinobiMission {
  id: string;
  rank: MissionRank;
  title: string;
  loreBriefing: string;
  requiredRankTier: number;     // Índice mínimo de patente (0: Estudante a 8: Deus Shinobi)
  requiredRankName: string;     // Nome canônico da patente necessária
  durationSeconds: number;      // Tempo de execução/investigação em segundos
  choices: [MissionChoice, MissionChoice];
}

export interface ActiveMissionState {
  activeMissionId: string | null;
  selectedChoiceId: string | null;
  startedAt: number | null;
  resolvesAt: number | null;
  lastOutcome: MissionOutcome | null;
  cooldownExpiresAt: number | null;
}
