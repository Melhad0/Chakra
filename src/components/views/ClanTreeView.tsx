import React, { useState, useMemo } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { formatBigNumber } from '../../engine/BigNumber';
import { CLAN_NODES } from '../../engine/data';
import { PRESTIGE_THRESHOLD, calculatePendingAncestralChakra } from '../../engine/formulas';
import { ViewHeader } from './ViewHeader';
import { IconRenderer } from '../common/IconRenderer';
import { Badge } from '../common/Badge';
import {
  GitBranch,
  Sparkles,
  Lock,
  CheckCircle2,
  Flame,
  Info,
  Layers,
} from 'lucide-react';
import { ClanBranchKey, ClanNode } from '../../types/prestige';

const BRANCH_CONFIG: Record<
  ClanBranchKey,
  {
    name: string;
    subtitle: string;
    badgeVariant: 'cyan' | 'chakra' | 'warning' | 'neutral';
    accentColor: string;
    borderColor: string;
    bgGradient: string;
    glowClass: string;
    icon: string;
  }
> = {
  root: {
    name: 'Tronco Primordial (Rikudō)',
    subtitle: 'A Essência Original do Sábio dos Seis Caminhos',
    badgeVariant: 'warning',
    accentColor: '#EAB308',
    borderColor: 'border-amber-500/50 hover:border-amber-400',
    bgGradient: 'from-amber-950/20 via-zinc-900/80 to-zinc-950/90',
    glowClass: 'shadow-[0_0_15px_rgba(234,179,8,0.15)]',
    icon: 'Sun',
  },
  senju: {
    name: 'Linhagem Senju & Uzumaki',
    subtitle: 'Vitalidade Infinita, Fūinjutsu & Multiplicadores de CPS',
    badgeVariant: 'cyan',
    accentColor: '#06B6D4',
    borderColor: 'border-cyan-500/50 hover:border-cyan-400',
    bgGradient: 'from-cyan-950/20 via-zinc-900/80 to-zinc-950/90',
    glowClass: 'shadow-[0_0_15px_rgba(6,182,212,0.15)]',
    icon: 'Trees',
  },
  uchiha: {
    name: 'Linhagem Uchiha',
    subtitle: 'Poder Ocular, Susano\'o & Acertos Críticos Destrutivos',
    badgeVariant: 'warning',
    accentColor: '#F43F5E',
    borderColor: 'border-rose-500/50 hover:border-rose-400',
    bgGradient: 'from-rose-950/20 via-zinc-900/80 to-zinc-950/90',
    glowClass: 'shadow-[0_0_15px_rgba(244,63,94,0.15)]',
    icon: 'Eye',
  },
  hyuga: {
    name: 'Linhagem Hyūga & Lua',
    subtitle: 'Visão 360°, Tenketsu & Recompensas Cósmicas',
    badgeVariant: 'chakra',
    accentColor: '#A855F7',
    borderColor: 'border-purple-500/50 hover:border-purple-400',
    bgGradient: 'from-purple-950/20 via-zinc-900/80 to-zinc-950/90',
    glowClass: 'shadow-[0_0_15px_rgba(168,85,247,0.15)]',
    icon: 'Moon',
  },
  otsutsuki: {
    name: 'Linhagem Otsutsuki Celestial',
    subtitle: 'Ascensão Divina, Karma & Transcendência Universal',
    badgeVariant: 'warning',
    accentColor: '#F59E0B',
    borderColor: 'border-amber-500/60 hover:border-amber-400',
    bgGradient: 'from-amber-950/30 via-zinc-900/80 to-zinc-950/90',
    glowClass: 'shadow-[0_0_15px_rgba(245,158,11,0.2)]',
    icon: 'Crown',
  },
};

export const ClanTreeView: React.FC = () => {
  const chakraAncestral = useGameStore((s) => s.chakraAncestral);
  const clanNodes = useGameStore((s) => s.clanNodes);
  const buyClanNode = useGameStore((s) => s.buyClanNode);
  const stats = useGameStore((s) => s.stats);
  const performPrestige = useGameStore((s) => s.performPrestige);

  const [activeTab, setActiveTab] = useState<'all' | ClanBranchKey>('all');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('primordial_chakra');

  const allNodesList = useMemo(() => Object.values(CLAN_NODES), []);
  const totalNodesCount = allNodesList.length;
  const unlockedNodesCount = useMemo(
    () => Object.keys(clanNodes).filter((k) => clanNodes[k]).length,
    [clanNodes]
  );

  // Prestígio
  const runChakra = stats.totalChakraEarned;
  const pendingAncestral = calculatePendingAncestralChakra(runChakra);
  const canPrestige = runChakra.gte(PRESTIGE_THRESHOLD);
  const prestigeProgress = Math.min(
    100,
    Math.max(0, runChakra.div(PRESTIGE_THRESHOLD).mul(100).toNumber())
  );

  // Multiplicadores acumulados de clãs em tempo real
  const { clanCPSMultiplier, clanClickMultiplier, clanCritChanceBonus, clanRewardMultiplier } =
    useMemo(() => {
      let cpsMult = 1;
      let clickMult = 1;
      let critBonus = 0;
      let rewMult = 1;

      for (const id in clanNodes) {
        if (clanNodes[id]) {
          const n = CLAN_NODES[id];
          if (n) {
            if (n.cpsMultiplier && n.cpsMultiplier > 1) cpsMult *= n.cpsMultiplier;
            if (n.clickMultiplier && n.clickMultiplier > 1) clickMult *= n.clickMultiplier;
            if (n.critChanceBonus) critBonus += n.critChanceBonus;
            if (n.rewardMultiplier && n.rewardMultiplier > 1) rewMult *= n.rewardMultiplier;
          }
        }
      }

      return {
        clanCPSMultiplier: cpsMult,
        clanClickMultiplier: clickMult,
        clanCritChanceBonus: critBonus,
        clanRewardMultiplier: rewMult,
      };
    }, [clanNodes]);

  const isNodeVisible = (node: ClanNode): boolean => {
    if (!node.parent) return true;
    return !!clanNodes[node.parent];
  };

  const selectedNode = CLAN_NODES[selectedNodeId] || CLAN_NODES.primordial_chakra;
  const isSelectedUnlocked = !!clanNodes[selectedNode.id];
  const isSelectedParentUnlocked = !selectedNode.parent || !!clanNodes[selectedNode.parent];
  const canAffordSelected = chakraAncestral.gte(selectedNode.cost);

  const branchesData = useMemo(() => {
    const keys: ClanBranchKey[] = ['root', 'senju', 'uchiha', 'hyuga', 'otsutsuki'];
    return keys.map((key) => {
      const allBranchNodes = allNodesList.filter((n) => n.branch === key);
      const visibleNodes = allBranchNodes.filter(isNodeVisible);
      const unlockedCount = allBranchNodes.filter((n) => !!clanNodes[n.id]).length;
      const hiddenCount = allBranchNodes.length - visibleNodes.length;

      return {
        key,
        config: BRANCH_CONFIG[key],
        allNodes: allBranchNodes,
        visibleNodes,
        unlockedCount,
        totalCount: allBranchNodes.length,
        hiddenCount,
      };
    });
  }, [allNodesList, clanNodes]);

  const displayedBranches = useMemo(() => {
    if (activeTab === 'all') return branchesData;
    return branchesData.filter((b) => b.key === activeTab);
  }, [branchesData, activeTab]);

  return (
    <div className="w-screen h-screen flex flex-col bg-[#07080c] text-zinc-100 overflow-hidden select-none font-sans relative">
      {/* Luzes de Fundo Ambientais */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Cabeçalho Fixo Universal */}
      <ViewHeader
        title="Árvore Genealógica de Clãs Shinobi"
        subtitle="Despertar progressivo de linhagens ancestrais e ritual de renascimento"
        badgeText={`${unlockedNodesCount}/${totalNodesCount} Linhagens Despertas`}
        badgeVariant="cyan"
        icon={<GitBranch className="w-4 h-4 text-purple-400 stroke-[2]" />}
      />

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-3 lg:p-5 gap-4 relative z-10">
        {/* ÁREA CENTRAL: PRESTÍGIO + ABAS DE LINHAGEM + GRAFO DA ÁRVORE */}
        <section className="flex-1 flex flex-col gap-3 min-w-0 overflow-hidden">
          {/* 1. Card Superior: Saldo Ancestral & Ritual de Renascimento */}
          <div className="bg-gradient-to-r from-zinc-900/90 via-zinc-950/85 to-[#090a0f]/95 backdrop-blur-2xl border border-purple-500/30 rounded-2xl p-4 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 flex-shrink-0 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500/60 to-transparent pointer-events-none" />

            {/* Saldo de Chakra Ancestral & Multiplicadores */}
            <div className="flex items-center gap-3.5 min-w-[240px]">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 via-zinc-900 to-amber-500/20 border border-purple-500/50 flex items-center justify-center text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.3)] flex-shrink-0">
                <Sparkles className="w-6 h-6 stroke-[1.8]" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block font-bold">
                  Chakra Ancestral Acumulado
                </span>
                <span className="text-xl sm:text-2xl font-mono font-black text-purple-300 drop-shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                  {chakraAncestral.toString()}
                </span>
                <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-zinc-400 flex-wrap">
                  <span className="text-emerald-400 font-bold px-1.5 py-0.2 rounded bg-emerald-950/60 border border-emerald-800/60">{clanCPSMultiplier.toFixed(1)}x CPS</span>
                  <span className="text-amber-400 font-bold px-1.5 py-0.2 rounded bg-amber-950/60 border border-amber-800/60">{clanClickMultiplier.toFixed(1)}x Clique</span>
                  {clanCritChanceBonus > 0 && (
                    <span className="text-rose-400 font-bold px-1.5 py-0.2 rounded bg-rose-950/60 border border-rose-800/60">+{clanCritChanceBonus}% Crítico</span>
                  )}
                  {clanRewardMultiplier > 1 && (
                    <span className="text-cyan-400 font-bold px-1.5 py-0.2 rounded bg-cyan-950/60 border border-cyan-800/60">{clanRewardMultiplier.toFixed(1)}x Ouro</span>
                  )}
                </div>
              </div>
            </div>

            {/* Ritual de Renascimento (Prestígio) */}
            <div className="flex-1 max-w-md w-full bg-zinc-900/70 border border-zinc-800/90 p-3.5 rounded-xl font-mono text-xs shadow-inner">
              <div className="flex items-center justify-between mb-1.5 text-[11px]">
                <span className="text-zinc-200 font-bold flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  Renascimento Shinobi (Limiar 10¹³)
                </span>
                <span className={canPrestige ? 'text-emerald-400 font-bold' : 'text-zinc-400'}>
                  {formatBigNumber(runChakra)} / {formatBigNumber(PRESTIGE_THRESHOLD)}
                </span>
              </div>

              {/* Barra de Progresso com Gradiente */}
              <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden mb-2 p-0.5 border border-zinc-850">
                <div
                  style={{ width: `${prestigeProgress}%` }}
                  className={`h-full transition-all duration-500 rounded-full ${
                    canPrestige
                      ? 'bg-gradient-to-r from-amber-500 via-purple-500 to-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                      : 'bg-gradient-to-r from-zinc-700 to-zinc-500'
                  }`}
                />
              </div>

              <div className="flex items-center justify-between text-[10px]">
                <span className="text-zinc-400">
                  Ganho: <strong className="text-purple-300 font-bold">+{pendingAncestral} Ancestral</strong>
                </span>
                <button
                  disabled={!canPrestige}
                  onClick={() => {
                    if (
                      confirm(
                        `Executar Renascimento Shinobi? Você receberá +${pendingAncestral} Chakra Ancestral e reiniciará sua jornada atual para despertar novas linhagens.`
                      )
                    ) {
                      performPrestige();
                    }
                  }}
                  className={`px-3 py-1 rounded-lg font-mono text-[10px] font-bold transition-all duration-200 border cursor-pointer ${
                    canPrestige
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:scale-105 active:scale-95'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-600 cursor-not-allowed'
                  }`}
                >
                  {canPrestige ? 'Executar Renascimento' : 'Requer 10T Chakra'}
                </button>
              </div>
            </div>
          </div>

          {/* 2. Barra de Abas das Grandes Linhagens */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 flex-shrink-0">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all duration-200 flex items-center gap-1.5 border whitespace-nowrap cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-purple-950/80 border-purple-500/70 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                  : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Panorama Geral ({unlockedNodesCount}/{totalNodesCount})</span>
            </button>

            {branchesData.map((b) => {
              const isSelectedTab = activeTab === b.key;
              const isFullyUnlocked = b.unlockedCount === b.totalCount;

              return (
                <button
                  key={b.key}
                  onClick={() => setActiveTab(b.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all duration-200 flex items-center gap-1.5 border whitespace-nowrap cursor-pointer ${
                    isSelectedTab
                      ? 'bg-zinc-850 border-zinc-700 text-zinc-100 shadow-md'
                      : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  <span className="truncate">{b.config.name.split(' ')[0]}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full border ${
                      isFullyUnlocked
                        ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-400'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    {b.unlockedCount}/{b.totalCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 3. Área Visual da Árvore de Linhagens */}
          <div className="flex-1 bg-gradient-to-b from-zinc-900/80 via-zinc-950/85 to-[#090a0f]/95 backdrop-blur-2xl border border-zinc-800/90 rounded-2xl shadow-2xl p-4 sm:p-6 overflow-y-auto custom-scrollbar relative flex flex-col">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {displayedBranches.map((branch) => (
                <div
                  key={branch.key}
                  className={`bg-zinc-900/50 border rounded-2xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden transition-all duration-300 ${branch.config.borderColor}`}
                >
                  {/* Cabeçalho da Linhagem */}
                  <div className="pb-3 border-b border-zinc-800/80 mb-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant={branch.config.badgeVariant}>{branch.config.name}</Badge>
                      </div>
                      <p className="text-[10px] font-mono text-zinc-400 mt-1 leading-tight">
                        {branch.config.subtitle}
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-purple-400 ml-2">
                      {branch.unlockedCount}/{branch.totalCount}
                    </span>
                  </div>

                  {/* Lista Sequencial de Nós Revelados */}
                  <div className="space-y-2 flex-1">
                    {branch.visibleNodes.map((node, index) => {
                      const isUnlocked = !!clanNodes[node.id];
                      const isSelected = selectedNodeId === node.id;
                      const canAfford = chakraAncestral.gte(node.cost);

                      return (
                        <div key={node.id} className="relative">
                          {index > 0 && (
                            <div className="w-0.5 h-2.5 bg-zinc-800 mx-auto -my-1" />
                          )}

                          <button
                            onClick={() => setSelectedNodeId(node.id)}
                            className={`w-full p-2.5 rounded-xl border transition-all duration-200 text-left flex items-center justify-between gap-3 cursor-pointer select-none ${
                              isSelected
                                ? 'ring-2 ring-purple-400 bg-zinc-850/95 border-purple-500 shadow-md scale-[1.01]'
                                : isUnlocked
                                ? 'bg-purple-950/20 border-purple-900/50 hover:border-purple-500/60 text-zinc-200 hover:-translate-y-0.5'
                                : canAfford
                                ? 'bg-amber-950/25 border-amber-500/60 hover:border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.15)] animate-pulse hover:-translate-y-0.5'
                                : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-400'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 ${
                                  isUnlocked
                                    ? 'bg-purple-900/40 border-purple-500/60 text-purple-300'
                                    : canAfford
                                    ? 'bg-amber-950/60 border-amber-500/60 text-amber-300'
                                    : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                                }`}
                              >
                                <IconRenderer name={node.icon} className="w-4 h-4 stroke-[1.8]" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-zinc-200 truncate">
                                  {node.name}
                                </h4>
                                <span className="text-[10px] font-mono text-zinc-500 block truncate">
                                  {node.desc}
                                </span>
                              </div>
                            </div>

                            <div className="text-right flex-shrink-0">
                              {isUnlocked ? (
                                <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> Desperto
                                </span>
                              ) : (
                                <span
                                  className={`text-[10px] font-mono font-bold ${
                                    canAfford ? 'text-amber-300' : 'text-zinc-500'
                                  }`}
                                >
                                  {node.cost} Anc
                                </span>
                              )}
                            </div>
                          </button>
                        </div>
                      );
                    })}

                    {/* Indicador de Névoa de Guerra */}
                    {branch.hiddenCount > 0 && (
                      <div className="pt-2">
                        <div className="p-2.5 rounded-xl border border-dashed border-zinc-800/80 bg-zinc-950/40 flex items-center justify-between text-zinc-500 text-[10px] font-mono">
                          <span className="flex items-center gap-1.5">
                            <Lock className="w-3 h-3 text-zinc-600" />
                            <span>+{branch.hiddenCount} Linhagens Seladas</span>
                          </span>
                          <span className="text-zinc-600">Desperte o nó anterior</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CARD LATERAL DIREITO: INSPEÇÃO DETALHADA E BOTÃO DE DESPERTAR */}
        <aside className="w-full lg:w-96 bg-gradient-to-b from-zinc-900/80 via-zinc-950/85 to-[#090a0f]/95 backdrop-blur-2xl border border-zinc-800/90 rounded-2xl shadow-2xl p-5 flex flex-col justify-between flex-shrink-0 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent pointer-events-none" />

          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                Inspeção de Linhagem
              </span>
              {isSelectedUnlocked ? (
                <Badge variant="production" icon={<CheckCircle2 className="w-3 h-3" />}>
                  Desperto
                </Badge>
              ) : isSelectedParentUnlocked ? (
                <Badge variant="cyan">Disponível para Despertar</Badge>
              ) : (
                <Badge variant="neutral" icon={<Lock className="w-3 h-3" />}>
                  Selado
                </Badge>
              )}
            </div>

            {/* Ícone e Nome do Nó */}
            <div className="mt-4 flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-zinc-900 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.2)] flex-shrink-0">
                <IconRenderer name={selectedNode.icon} className="w-7 h-7 stroke-[1.8]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white leading-tight">
                  {selectedNode.name}
                </h3>
                <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider block mt-1 font-bold">
                  Ramo: {BRANCH_CONFIG[selectedNode.branch]?.name || selectedNode.branch}
                </span>
              </div>
            </div>

            {/* Descrição e Efeitos Permanentes */}
            <div className="mt-4 p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800/80 text-xs font-mono leading-relaxed text-zinc-300 shadow-inner">
              <div className="flex items-center gap-1.5 text-zinc-400 font-bold mb-1.5">
                <Info className="w-3.5 h-3.5 text-purple-400" />
                <span>Efeito Permanente da Linhagem:</span>
              </div>
              <p>{selectedNode.desc}</p>
            </div>

            {/* Requisitos de Linhagem */}
            {selectedNode.parent && (
              <div className="mt-3 p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-850 text-xs font-mono flex items-center justify-between">
                <span className="text-zinc-500">Requer ancestral:</span>
                <span
                  className={
                    isSelectedParentUnlocked
                      ? 'text-emerald-400 font-bold'
                      : 'text-rose-400 font-bold'
                  }
                >
                  {CLAN_NODES[selectedNode.parent]?.name || 'Anterior'}
                </span>
              </div>
            )}
          </div>

          {/* Botão de Aquisição / Status */}
          <div className="pt-4 border-t border-zinc-800/80 mt-4">
            <div className="flex items-center justify-between text-xs font-mono mb-2.5">
              <span className="text-zinc-400">Custo de Despertar:</span>
              <strong className="text-purple-300 text-sm font-bold">
                {selectedNode.cost} Chakra Ancestral
              </strong>
            </div>

            {isSelectedUnlocked ? (
              <div className="w-full py-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 text-xs font-mono font-bold text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Linhagem Ativa e Consolidada
              </div>
            ) : (
              <button
                disabled={!isSelectedParentUnlocked || !canAffordSelected}
                onClick={() => buyClanNode(selectedNode.id)}
                className={`w-full py-2.5 rounded-xl text-xs font-mono font-bold transition-all duration-200 border flex items-center justify-center gap-2 cursor-pointer ${
                  isSelectedParentUnlocked && canAffordSelected
                    ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:scale-105 active:scale-95'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-600 cursor-not-allowed'
                }`}
              >
                {!isSelectedParentUnlocked ? (
                  <>
                    <Lock className="w-4 h-4 text-zinc-600" /> Requer Linhagem Anterior
                  </>
                ) : !canAffordSelected ? (
                  <>
                    <Sparkles className="w-4 h-4 text-zinc-600" /> Chakra Ancestral Insuficiente
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Despertar Linhagem (-{selectedNode.cost} Ancestral)
                  </>
                )}
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
