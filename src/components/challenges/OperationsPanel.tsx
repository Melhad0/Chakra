import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { formatBigNumber } from '../../engine/BigNumber';
import { CLAN_NODES } from '../../engine/data';
import { IconRenderer } from '../common/IconRenderer';
import { RankingDashboard } from './RankingDashboard';
import {
  Scroll,
  GitFork,
  Trophy,
  Sparkles,
  Maximize2,
  Dice5,
  PanelRightClose,
  Swords,
  Briefcase,
  Flame,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';
import { PRESTIGE_THRESHOLD, calculatePendingAncestralChakra } from '../../engine/formulas';
import { getCurrentRank, getNextPromotionMission } from '../../constants/rankings';

export const OperationsPanel: React.FC = () => {
  const activeTab = useGameStore((s) => s.activeTab);
  const setActiveTab = useGameStore((s) => s.setActiveTab);
  const chakraAncestral = useGameStore((s) => s.chakraAncestral);
  const clanNodes = useGameStore((s) => s.clanNodes);
  const buyClanNode = useGameStore((s) => s.buyClanNode);
  const activeMission = useGameStore((s) => s.activeMission);
  const gauntlet = useGameStore((s) => s.gauntlet);
  const inventory = useGameStore((s) => s.inventory);
  const stats = useGameStore((s) => s.stats);
  const passedExams = useGameStore((s) => s.passedExams);
  const performPrestige = useGameStore((s) => s.performPrestige);
  const setView = useGameStore((s) => s.setView);
  const toggleRightSidebar = useGameStore((s) => s.toggleRightSidebar);

  const [cooldownRemaining, setCooldownRemaining] = React.useState<number>(0);

  React.useEffect(() => {
    const updateCooldown = () => {
      if (gauntlet.cooldownExpiresAt && gauntlet.cooldownExpiresAt > Date.now()) {
        const remaining = Math.max(0, Math.ceil((gauntlet.cooldownExpiresAt - Date.now()) / 1000));
        setCooldownRemaining(remaining);
      } else {
        setCooldownRemaining(0);
      }
    };
    updateCooldown();
    const interval = setInterval(updateCooldown, 1000);
    return () => clearInterval(interval);
  }, [gauntlet.cooldownExpiresAt]);

  const totalClanNodesCount = Object.keys(CLAN_NODES).length;
  const unlockedClanNodesCount = Object.keys(clanNodes).filter((k) => clanNodes[k]).length;
  const currentRank = getCurrentRank(
    stats.manualClicksAllTime,
    stats.highestCPSRecord,
    stats.totalPrestiges,
    passedExams
  );
  const canPrestige = stats.totalChakraEarned.gte(PRESTIGE_THRESHOLD);
  const prestigeProgress = Math.min(100, Math.max(0, stats.totalChakraEarned.div(PRESTIGE_THRESHOLD).mul(100).toNumber()));
  const isMissionRunning = !!(activeMission.activeMissionId && activeMission.resolvesAt && activeMission.resolvesAt > Date.now());
  const isMissionReady = !!(activeMission.activeMissionId && activeMission.resolvesAt && Date.now() >= activeMission.resolvesAt);
  const inventoryItemCount = inventory ? inventory.inventoryBag.filter(Boolean).length : 0;
  const nextMission = getNextPromotionMission(passedExams);
  const isExamEligible = nextMission
    ? stats.manualClicksAllTime >= nextMission.requirements.minClicksAllTime &&
      stats.highestCPSRecord.gte(nextMission.requirements.minCPS)
    : false;

  return (
    <aside className="relative h-full bg-gradient-to-b from-zinc-900/90 via-zinc-950/85 to-[#08090d]/95 backdrop-blur-2xl border border-zinc-800/90 hover:border-purple-500/40 transition-all duration-300 rounded-2xl p-3.5 flex flex-col overflow-hidden shadow-2xl shadow-black/80 group/panel">
      {/* 0. LUZ AMBIENTE & NEON DINÂMICO */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500/60 to-transparent pointer-events-none" />

      {/* 1. CABEÇALHO DA CENTRAL DE OPERAÇÕES */}
      <div className="pb-3 border-b border-zinc-800/80 flex-shrink-0 relative z-10 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          {/* Logo & Título */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500/20 via-zinc-900 to-rose-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.25)] flex-shrink-0 group-hover/panel:scale-105 transition-transform duration-300">
              <Scroll className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs font-black text-white tracking-wider uppercase truncate">
                  Operações Shinobi
                </h2>
                <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
                  Nexus
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-mono truncate">
                Comando tático & módulos de missão
              </p>
            </div>
          </div>

          {/* Botão de Toggle da Barra Lateral */}
          <button
            onClick={toggleRightSidebar}
            title="Recolher Central de Operações"
            className="p-1.5 rounded-xl bg-zinc-900/80 border border-zinc-850 hover:border-purple-500/40 text-zinc-400 hover:text-zinc-100 hover:bg-purple-950/20 transition-all duration-200 cursor-pointer shadow-sm flex items-center justify-center group/btn"
          >
            <PanelRightClose className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform duration-200" />
          </button>
        </div>

        {/* HUD Rápido de Status Tático */}
        <div className="grid grid-cols-3 gap-1.5 text-center">
          <div className="p-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60">
            <span className="text-[9px] text-zinc-400 block font-mono">Patente</span>
            <span className="text-[10px] font-bold text-amber-300 truncate block">
              {currentRank.title.split(' ')[0]}
            </span>
          </div>
          <div className="p-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60">
            <span className="text-[9px] text-zinc-400 block font-mono">Ancestral</span>
            <span className="text-[10px] font-bold text-purple-300 truncate block font-mono">
              {chakraAncestral.toString()}
            </span>
          </div>
          <div className="p-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60">
            <span className="text-[9px] text-zinc-400 block font-mono">Linhagens</span>
            <span className="text-[10px] font-bold text-emerald-300 truncate block font-mono">
              {unlockedClanNodesCount}/{totalClanNodesCount}
            </span>
          </div>
        </div>
      </div>

      {/* 2. OS 6 CARTÕES DE ACESSO RÁPIDO AOS MÓDULOS DE OPERAÇÃO (CLEAN UI & PROGRESSIVE DISCLOSURE) */}
      <div className="grid grid-cols-2 gap-2 my-2.5 flex-shrink-0 relative z-10">
        {/* Card 1: Arena de Desafios (Gauntlet) */}
        <Tooltip
          title="Arena de Desafios (Gauntlet)"
          badgeText="Combate Tático"
          badgeVariant="rose"
          description="Batalhas contra chefes canônicos do universo shinobi. Derrote vilões para desbloquear saques estocásticos, armaduras e pontos de atributo RPG."
          metrics={[
            { label: 'Chefe Alvo Ativo', value: `#${gauntlet.currentActiveBossId}`, colorClass: 'text-rose-400' },
            { label: 'Maior Derrotado', value: `#${gauntlet.highestBossDefeated}`, colorClass: 'text-amber-400' },
            { label: 'Status', value: cooldownRemaining > 0 ? `Recuperação (${cooldownRemaining}s)` : 'Pronto para Batalha', colorClass: cooldownRemaining > 0 ? 'text-amber-400' : 'text-emerald-400' },
          ]}
          position="left"
          className="w-full"
        >
          <button
            onClick={() => setView('CHALLENGES')}
            className="w-full group p-2.5 rounded-xl bg-zinc-900/70 hover:bg-zinc-850/90 border border-rose-950/50 hover:border-rose-500/60 transition-all duration-200 shadow-sm hover:shadow-[0_4px_16px_rgba(244,63,94,0.18)] hover:-translate-y-0.5 flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-rose-950/70 border border-rose-700/60 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform">
                <Swords className="w-3.5 h-3.5 stroke-[2]" />
              </div>
              <span className="text-xs font-bold text-zinc-100 group-hover:text-rose-300 transition-colors truncate">
                Desafios
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-950/80 border border-rose-800/60 text-rose-300 flex-shrink-0">
              #{gauntlet.currentActiveBossId}
            </span>
          </button>
        </Tooltip>

        {/* Card 2: Quadro de Missões Shinobi */}
        <Tooltip
          title="Quadro Oficial de Missões"
          badgeText="Mural da Folha"
          badgeVariant="emerald"
          description="Incursões táticas de Rank E a SS. Envie esquadrões para obter recompensas passivas, pergaminhos de gacha e minigames de selos manuais."
          metrics={[
            { label: 'Total no Catálogo', value: '14 Missões', colorClass: 'text-emerald-400' },
            { label: 'Status Atual', value: isMissionReady ? 'Pronto para Resgate!' : isMissionRunning ? 'Em Andamento...' : 'Disponível', colorClass: isMissionReady ? 'text-emerald-300' : 'text-zinc-400' },
          ]}
          position="left"
          className="w-full"
        >
          <button
            onClick={() => setView('MISSIONS')}
            className={`w-full group p-2.5 rounded-xl transition-all duration-200 shadow-sm hover:-translate-y-0.5 flex items-center justify-between cursor-pointer border ${
              isMissionReady
                ? 'bg-emerald-950/30 border-emerald-500/70 shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:border-emerald-400'
                : 'bg-zinc-900/70 hover:bg-zinc-850/90 border-emerald-950/50 hover:border-emerald-500/60'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-emerald-950/70 border border-emerald-700/60 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <Dice5 className="w-3.5 h-3.5 stroke-[2]" />
              </div>
              <span className="text-xs font-bold text-zinc-100 group-hover:text-emerald-300 transition-colors truncate">
                Missões
              </span>
            </div>
            <span
              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border flex-shrink-0 ${
                isMissionReady
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 animate-pulse'
                  : 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
              }`}
            >
              {isMissionReady ? '!' : '14'}
            </span>
          </button>
        </Tooltip>

        {/* Card 3: Inventário & Arsenal */}
        <Tooltip
          title="Arsenal Shinobi & Afinidades"
          badgeText="RPG Paper Doll"
          badgeVariant="cyan"
          description="Gestão de 11 slots de equipamentos, armaduras e armas canônicas obtidas em chefes, além da Roda dos Cinco Elementos de Chakra."
          metrics={[
            { label: 'Itens na Mochila', value: `${inventoryItemCount} itens`, colorClass: 'text-cyan-300' },
            { label: 'Elementos Despertos', value: `${inventory?.unlockedElements?.length || 0}/5`, colorClass: 'text-amber-400' },
          ]}
          position="left"
          className="w-full"
        >
          <button
            onClick={() => setView('INVENTORY')}
            className="w-full group p-2.5 rounded-xl bg-zinc-900/70 hover:bg-zinc-850/90 border border-cyan-950/50 hover:border-cyan-500/60 transition-all duration-200 shadow-sm hover:shadow-[0_4px_16px_rgba(6,182,212,0.18)] hover:-translate-y-0.5 flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-cyan-950/70 border border-cyan-700/60 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                <Briefcase className="w-3.5 h-3.5 stroke-[2]" />
              </div>
              <span className="text-xs font-bold text-zinc-100 group-hover:text-cyan-300 transition-colors truncate">
                Inventário
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 flex-shrink-0">
              {inventoryItemCount}
            </span>
          </button>
        </Tooltip>

        {/* Card 4: Árvore de Clãs */}
        <Tooltip
          title="Árvore Genealógica de Clãs"
          badgeText="Linhagens Sábias"
          badgeVariant="purple"
          description="Desperte nós ancestrais (Senju, Uchiha, Hyūga, Otsutsuki) investindo Chakra Ancestral obtido através do Renascimento Shinobi."
          metrics={[
            { label: 'Linhagens Despertas', value: `${unlockedClanNodesCount}/${totalClanNodesCount}`, colorClass: 'text-purple-300' },
            { label: 'Chakra Ancestral', value: chakraAncestral.toString(), colorClass: 'text-purple-400' },
            { label: 'Renascimento', value: canPrestige ? 'Disponível!' : `${prestigeProgress.toFixed(0)}%`, colorClass: canPrestige ? 'text-amber-400' : 'text-zinc-400' },
          ]}
          position="left"
          className="w-full"
        >
          <button
            onClick={() => setView('CLAN_TREE')}
            className="w-full group p-2.5 rounded-xl bg-zinc-900/70 hover:bg-zinc-850/90 border border-purple-950/50 hover:border-purple-500/60 transition-all duration-200 shadow-sm hover:shadow-[0_4px_16px_rgba(168,85,247,0.18)] hover:-translate-y-0.5 flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-purple-950/70 border border-purple-700/60 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                <GitFork className="w-3.5 h-3.5 stroke-[2]" />
              </div>
              <span className="text-xs font-bold text-zinc-100 group-hover:text-purple-300 transition-colors truncate">
                Clãs
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-950/60 border border-purple-800/60 text-purple-300 flex-shrink-0">
              {unlockedClanNodesCount}/{totalClanNodesCount}
            </span>
          </button>
        </Tooltip>

        {/* Card 5: Missões de Graduação & Patentes */}
        <Tooltip
          title="Quartel de Graduação Shinobi"
          badgeText="Patentes Oficiais"
          badgeVariant="amber"
          description="Missões de promoção oficial de patente (Gennin até Rikudō Sennin). Complete critérios estritos de cliques, CPS e chefes derrotados."
          metrics={[
            { label: 'Patente Atual', value: currentRank.title, colorClass: 'text-amber-300' },
            { label: 'Próximo Alvo', value: nextMission ? nextMission.codename : 'Patente Máxima', colorClass: 'text-zinc-200' },
            { label: 'Avaliação', value: isExamEligible ? 'Apto para Promoção!' : 'Critérios em Curso', colorClass: isExamEligible ? 'text-amber-400' : 'text-zinc-400' },
          ]}
          position="left"
          className="w-full"
        >
          <button
            onClick={() => setView('CHUNIN_EXAM')}
            className={`w-full group p-2.5 rounded-xl transition-all duration-200 shadow-sm hover:-translate-y-0.5 flex items-center justify-between cursor-pointer border ${
              isExamEligible
                ? 'bg-amber-950/30 border-amber-500/70 shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:border-amber-400'
                : 'bg-zinc-900/70 hover:bg-zinc-850/90 border-amber-950/50 hover:border-amber-500/60'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-amber-950/70 border border-amber-700/60 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                <Flame className="w-3.5 h-3.5 stroke-[2]" />
              </div>
              <span className="text-xs font-bold text-zinc-100 group-hover:text-amber-300 transition-colors truncate">
                Graduação
              </span>
            </div>
            <span
              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border flex-shrink-0 ${
                isExamEligible
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse'
                  : 'bg-amber-950/60 text-amber-400 border-amber-800/60'
              }`}
            >
              {isExamEligible ? '!' : 'Rank'}
            </span>
          </button>
        </Tooltip>

        {/* Card 6: Hall da Fama */}
        <Tooltip
          title="Hall da Fama Global"
          badgeText="Neon Postgres"
          badgeVariant="amber"
          description="Placar mundial conectando todos os jogadores com métricas sincronizadas em tempo real no banco de dados Neon."
          metrics={[
            { label: 'Sua Patente', value: currentRank.title, colorClass: 'text-amber-300' },
            { label: 'Classificação', value: 'Top 50 Mundiais', colorClass: 'text-zinc-200' },
          ]}
          position="left"
          className="w-full"
        >
          <button
            onClick={() => setView('RANKINGS')}
            className="w-full group p-2.5 rounded-xl bg-zinc-900/70 hover:bg-zinc-850/90 border border-yellow-950/50 hover:border-yellow-500/60 transition-all duration-200 shadow-sm hover:shadow-[0_4px_16px_rgba(234,179,8,0.18)] hover:-translate-y-0.5 flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-yellow-950/70 border border-yellow-700/60 flex items-center justify-center text-yellow-400 group-hover:scale-105 transition-transform">
                <Trophy className="w-3.5 h-3.5 stroke-[2]" />
              </div>
              <span className="text-xs font-bold text-zinc-100 group-hover:text-yellow-300 transition-colors truncate">
                Rankings
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-yellow-950/60 border border-yellow-800/60 text-yellow-300 flex-shrink-0">
              Top 50
            </span>
          </button>
        </Tooltip>
      </div>

      {/* 3. SELETOR DE ABAS COM VISUAL MODERNO E EXPANDIR */}
      <div className="flex items-center justify-between gap-1.5 py-1.5 px-1 bg-zinc-950/60 rounded-xl border border-zinc-800/80 flex-shrink-0 relative z-10">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('clans')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
              activeTab === 'clans'
                ? 'bg-purple-950/80 text-purple-300 border border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
            }`}
          >
            <GitFork className="w-3.5 h-3.5 stroke-[2]" />
            <span>Clãs & Linhagens</span>
          </button>

          <button
            onClick={() => setActiveTab('rankings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
              activeTab === 'rankings'
                ? 'bg-yellow-950/80 text-yellow-300 border border-yellow-500/50 shadow-[0_0_12px_rgba(234,179,8,0.25)]'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 stroke-[2]" />
            <span>Rankings</span>
          </button>
        </div>

        {/* Botão de Expandir Tela Cheia Dedicada */}
        <button
          onClick={() => {
            if (activeTab === 'clans') setView('CLAN_TREE');
            else if (activeTab === 'rankings') setView('RANKINGS');
          }}
          title="Expandir para Tela Cheia Dedicada"
          className="p-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800 hover:border-purple-500/50 text-zinc-400 hover:text-purple-300 transition-all duration-200 cursor-pointer shadow-sm group/exp"
        >
          <Maximize2 className="w-3.5 h-3.5 group-hover/exp:scale-110 transition-transform" />
        </button>
      </div>

      {/* 4. CONTEÚDO DINÂMICO ROLÁVEL */}
      <div className="flex-1 overflow-y-auto mt-2.5 pr-1 custom-scrollbar relative z-10">
        {/* ================================================================= */}
        {/* ABA: ÁRVORE DE CLÃS & PRESTÍGIO                                   */}
        {/* ================================================================= */}
        {(activeTab === 'clans' || activeTab === 'gauntlet') && (
          <div className="space-y-3">
            {/* Card de Prestígio / Renascimento Shinobi */}
            {(() => {
              const runChakra = stats.totalChakraEarned;
              const pendingPoints = calculatePendingAncestralChakra(runChakra);
              const canPrestigeNow = runChakra.gte(PRESTIGE_THRESHOLD);
              const progressPct = Math.min(100, Math.max(0, runChakra.div(PRESTIGE_THRESHOLD).mul(100).toNumber()));

              return (
                <div className="relative p-3.5 bg-gradient-to-br from-amber-950/20 via-zinc-900/90 to-zinc-950/95 border border-amber-500/30 rounded-xl overflow-hidden shadow-lg shadow-black/50 group/prestige">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover/prestige:scale-125 transition-transform duration-500" />
                  
                  <div className="flex items-center justify-between mb-2.5 relative z-10">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
                        <Sparkles className="w-4 h-4 stroke-[2]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-zinc-100">
                            Renascimento Shinobi
                          </h4>
                          <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            Nível Kage
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-400 leading-tight">
                          Reinicia o progresso em troca de Chakra Ancestral permanente.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-zinc-800/80 font-mono text-[11px] relative z-10">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Progresso até o Limiar:</span>
                      <span className={canPrestigeNow ? 'text-emerald-400 font-bold' : 'text-zinc-300'}>
                        {formatBigNumber(runChakra)} / {formatBigNumber(PRESTIGE_THRESHOLD)}
                      </span>
                    </div>

                    {/* Barra de Progresso com Shimmer */}
                    <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden p-0.5 border border-zinc-850">
                      <div
                        style={{ width: `${progressPct}%` }}
                        className={`h-full transition-all duration-500 rounded-full ${
                          canPrestigeNow
                            ? 'bg-gradient-to-r from-amber-500 to-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                            : 'bg-gradient-to-r from-zinc-700 to-zinc-500'
                        }`}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-0.5">
                      <span className="text-zinc-400">Chakra Ancestral a receber:</span>
                      <span className="text-amber-300 font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        +{pendingPoints} Ancestral
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 relative z-10">
                    <button
                      disabled={!canPrestigeNow}
                      onClick={() => {
                        if (confirm(`Confirma o Renascimento Shinobi? Você receberá +${pendingPoints} Chakra Ancestral e reiniciará seu progresso na run atual.`)) {
                          performPrestige();
                        }
                      }}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold font-mono transition-all duration-300 flex items-center justify-center gap-2 ${
                        canPrestigeNow
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)] cursor-pointer hover:scale-[1.02] active:scale-[0.98]'
                          : 'bg-zinc-900/60 border border-zinc-800 text-zinc-600 cursor-not-allowed'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {canPrestigeNow
                        ? `Executar Renascimento (+${pendingPoints} Ancestral)`
                        : `Requer ${formatBigNumber(PRESTIGE_THRESHOLD)} Chakra`}
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Saldo de Chakra Ancestral */}
            <div className="flex items-center justify-between bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/80 shadow-inner">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Chakra Ancestral
                </span>
              </div>
              <span className="text-base font-mono font-black text-purple-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]">
                {chakraAncestral.toString()}
              </span>
            </div>

            {/* Lista dos Nós de Clã */}
            <div className="space-y-2">
              {Object.values(CLAN_NODES)
                .filter((node) => !node.parent || !!clanNodes[node.parent])
                .map((node) => {
                  const isUnlocked = !!clanNodes[node.id];
                  const canAfford = chakraAncestral.gte(node.cost);

                  return (
                    <div
                      key={node.id}
                      className={`relative p-3 rounded-xl border transition-all duration-300 overflow-hidden ${
                        isUnlocked
                          ? 'bg-gradient-to-br from-purple-950/30 via-zinc-900/80 to-zinc-950/90 border-purple-500/50 shadow-md shadow-purple-950/20'
                          : canAfford
                          ? 'bg-zinc-900/80 border-purple-500/30 hover:border-purple-500/70 hover:shadow-lg hover:shadow-purple-950/30'
                          : 'bg-zinc-950/50 border-zinc-850 opacity-70'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 border ${
                              isUnlocked
                                ? 'bg-purple-950/80 border-purple-500/60 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                                : canAfford
                                ? 'bg-zinc-850 border-zinc-700 text-zinc-300'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-600'
                            }`}
                          >
                            <IconRenderer name={node.icon} className="w-4 h-4 stroke-[2]" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-zinc-100 truncate flex items-center gap-1.5">
                              {node.name}
                              {isUnlocked && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                              )}
                            </h4>
                            <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug line-clamp-2">
                              {node.desc}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-zinc-800/60 flex items-center justify-between">
                        <span className="text-[10px] font-mono">
                          {isUnlocked ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Linhagem Ativa
                            </span>
                          ) : (
                            <span className={canAfford ? 'text-purple-300 font-semibold' : 'text-zinc-500'}>
                              Custo: {node.cost} Ancestral
                            </span>
                          )}
                        </span>

                        {!isUnlocked && (
                          <button
                            disabled={!canAfford}
                            onClick={() => buyClanNode(node.id)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all duration-200 border cursor-pointer ${
                              canAfford
                                ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.35)] hover:scale-105 active:scale-95'
                                : 'bg-zinc-900/60 border-zinc-800 text-zinc-600 cursor-not-allowed'
                            }`}
                          >
                            Despertar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* ABA: RANKINGS GLOBAIS & PLACAR                                    */}
        {/* ================================================================= */}
        {activeTab === 'rankings' && (
          <div className="pb-4">
            <RankingDashboard />
          </div>
        )}
      </div>
    </aside>
  );
};
