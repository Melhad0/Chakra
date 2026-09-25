import React, { useState } from 'react';
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
  HelpCircle,
  Flame,
  Info,
} from 'lucide-react';

export const ClanTreeView: React.FC = () => {
  const chakraAncestral = useGameStore((s) => s.chakraAncestral);
  const clanNodes = useGameStore((s) => s.clanNodes);
  const buyClanNode = useGameStore((s) => s.buyClanNode);
  const stats = useGameStore((s) => s.stats);
  const performPrestige = useGameStore((s) => s.performPrestige);

  const [selectedNodeId, setSelectedNodeId] = useState<string>('primordial_chakra');

  const selectedNode = CLAN_NODES[selectedNodeId] || CLAN_NODES.primordial_chakra;
  const isSelectedUnlocked = !!clanNodes[selectedNode.id];
  const isSelectedParentUnlocked = !selectedNode.parent || !!clanNodes[selectedNode.parent];
  const canAffordSelected = chakraAncestral.gte(selectedNode.cost);

  // Prestígio
  const runChakra = stats.totalChakraEarned;
  const pendingAncestral = calculatePendingAncestralChakra(runChakra);
  const canPrestige = runChakra.gte(PRESTIGE_THRESHOLD);
  const prestigeProgress = Math.min(100, Math.max(0, runChakra.div(PRESTIGE_THRESHOLD).mul(100).toNumber()));

  // Contagem de nós
  const totalNodesCount = Object.keys(CLAN_NODES).length;
  const unlockedNodesCount = Object.keys(clanNodes).filter((k) => clanNodes[k]).length;

  // Multiplicadores acumulados de clãs
  let clanCPSMultiplier = 1;
  let clanClickMultiplier = 1;
  let clanCritChanceBonus = 0;
  if (clanNodes['primordial_chakra']) clanCPSMultiplier *= 1.5;
  if (clanNodes['uzumaki_vitality']) clanCPSMultiplier *= 2.0;
  if (clanNodes['senju_wood_release']) clanCPSMultiplier *= 3.0;
  if (clanNodes['chakra_fruit']) clanCPSMultiplier *= 5.0;
  if (clanNodes['sharingan_awakening']) clanCritChanceBonus += 10;
  if (clanNodes['perfect_susanoo_lineage']) clanClickMultiplier *= 10;

  // Organização dos nós por ramificação
  const rootNode = CLAN_NODES['primordial_chakra'];
  const senjuBranch = [CLAN_NODES['uzumaki_vitality'], CLAN_NODES['senju_wood_release']];
  const uchihaBranch = [
    CLAN_NODES['sharingan_awakening'],
    CLAN_NODES['mangekyo_sharingan_lineage'],
    CLAN_NODES['perfect_susanoo_lineage'],
  ];
  const hyugaBranch = [CLAN_NODES['byakugan_vision']];
  const otsutsukiBranch = [CLAN_NODES['chakra_fruit']];

  return (
    <div className="w-screen h-screen flex flex-col bg-[#08090d] text-zinc-100 overflow-hidden select-none">
      {/* Cabeçalho Fixo Universal */}
      <ViewHeader
        title="Árvore Genealógica de Clãs"
        subtitle="Linhagens Ancestrais e Renascimento Shinobi"
        badgeText={`${unlockedNodesCount}/${totalNodesCount} Despertos`}
        badgeVariant="cyan"
        icon={<GitBranch className="w-4 h-4 text-purple-400 stroke-[1.75]" />}
      />

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-4 lg:p-6 gap-4 lg:gap-6">
        {/* ================================================================= */}
        {/* ÁREA CENTRAL: PAINEL DE PRESTÍGIO + GRAFO VISUAL DA ÁRVORE        */}
        {/* ================================================================= */}
        <section className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Card Superior de Linhagem & Ritual de Renascimento */}
          <div className="bg-zinc-900/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-5 flex-shrink-0">
            {/* Saldo de Chakra Ancestral & Multiplicadores */}
            <div className="flex items-center gap-4 min-w-[240px]">
              <div className="w-14 h-14 rounded-2xl bg-purple-950/60 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                <Sparkles className="w-7 h-7 stroke-[1.5]" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block font-semibold">
                  Chakra Ancestral Acumulado
                </span>
                <span className="text-2xl sm:text-3xl font-mono font-bold text-purple-300">
                  {chakraAncestral.toString()}
                </span>
                <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-zinc-400">
                  <span className="text-emerald-400 font-semibold">{clanCPSMultiplier}x CPS</span>
                  <span>•</span>
                  <span className="text-amber-400 font-semibold">{clanClickMultiplier}x Clique</span>
                  {clanCritChanceBonus > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-rose-400 font-semibold">+{clanCritChanceBonus}% Crítico</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Ritual de Renascimento (Prestígio) */}
            <div className="flex-1 max-w-lg w-full bg-zinc-950/80 border border-zinc-800 p-3.5 rounded-xl font-mono text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  Renascimento Shinobi (Limiar 10¹³)
                </span>
                <span className={canPrestige ? 'text-emerald-400 font-bold' : 'text-zinc-400'}>
                  {formatBigNumber(runChakra)} / {formatBigNumber(PRESTIGE_THRESHOLD)}
                </span>
              </div>

              {/* Barra de Progresso até 10^13 */}
              <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden mb-2">
                <div
                  style={{ width: `${prestigeProgress}%` }}
                  className={`h-full transition-all duration-300 ${
                    canPrestige
                      ? 'bg-gradient-to-r from-amber-500 to-purple-500'
                      : 'bg-zinc-700'
                  }`}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-500">
                  Ganho: <strong className="text-purple-300">+{pendingAncestral} Ancestral</strong>
                </span>
                <button
                  disabled={!canPrestige}
                  onClick={() => {
                    if (
                      confirm(
                        `Executar Renascimento Shinobi? Você receberá +${pendingAncestral} Chakra Ancestral e reiniciará seu progresso na run atual.`
                      )
                    ) {
                      performPrestige();
                    }
                  }}
                  className={`px-3 py-1 rounded-lg font-mono text-xs font-semibold transition border ${
                    canPrestige
                      ? 'bg-purple-950/80 hover:bg-purple-900 border-purple-500/50 text-purple-200 shadow-md cursor-pointer'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
                  }`}
                >
                  {canPrestige ? 'Executar Ritual de Renascimento' : 'Limiar Insuficiente'}
                </button>
              </div>
            </div>
          </div>

          {/* Grafo Visual da Árvore de Linhagens */}
          <div className="flex-1 bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl shadow-2xl p-6 overflow-y-auto custom-scrollbar relative flex flex-col items-center">
            {/* Background Halo */}
            <div className="absolute w-[500px] h-[500px] rounded-full bg-purple-900/5 blur-3xl pointer-events-none" />

            {/* NÓ RAIZ CENTRAL: CHAKRA PRIMORDIAL DE HAGOROMO */}
            <div className="flex flex-col items-center z-10 mb-8">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-semibold mb-2">
                Raiz Primordial da Criação
              </span>
              <button
                onClick={() => setSelectedNodeId(rootNode.id)}
                className={`group relative p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 ${
                  clanNodes[rootNode.id]
                    ? 'bg-purple-950/80 border-purple-500/70 text-purple-200 shadow-[0_0_25px_rgba(168,85,247,0.3)]'
                    : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                } ${selectedNodeId === rootNode.id ? 'ring-2 ring-purple-400 scale-105' : ''}`}
              >
                <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-700/60 flex items-center justify-center">
                  <IconRenderer name={rootNode.icon} className="w-6 h-6 stroke-[1.5]" />
                </div>
                <div className="text-center">
                  <h4 className="text-xs font-bold text-zinc-100">{rootNode.name}</h4>
                  <span className="text-[10px] font-mono text-purple-400">
                    {clanNodes[rootNode.id] ? 'Desperto' : `Custo: ${rootNode.cost} Ancestral`}
                  </span>
                </div>
              </button>

              {/* Conector Tronco Principal */}
              <div
                className={`w-0.5 h-8 transition-colors ${
                  clanNodes[rootNode.id] ? 'bg-purple-500 shadow-[0_0_8px_#a855f7]' : 'bg-zinc-800'
                }`}
              />
            </div>

            {/* 4 RAMIFICAÇÕES CANÔNICAS EM GRID */}
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-4 gap-6 z-10">
              {/* RAMO 1: SENJU / UZUMAKI (Capacidade & Regeneração) */}
              <div className="flex flex-col items-center gap-4 bg-zinc-950/40 p-4 rounded-xl border border-zinc-850">
                <div className="text-center pb-2 border-b border-zinc-850 w-full">
                  <Badge variant="cyan">Ramo Senju / Uzumaki</Badge>
                  <span className="text-[10px] font-mono text-zinc-500 block mt-1">Multiplicadores de CPS</span>
                </div>

                {senjuBranch.map((node, i) => {
                  const isUnlocked = !!clanNodes[node.id];
                  const isParentUnlocked = !node.parent || !!clanNodes[node.parent];
                  const isSelected = selectedNodeId === node.id;

                  return (
                    <React.Fragment key={node.id}>
                      {i > 0 && (
                        <div
                          className={`w-0.5 h-6 transition-colors ${
                            isUnlocked ? 'bg-cyan-500 shadow-[0_0_8px_#06b6d4]' : 'bg-zinc-800'
                          }`}
                        />
                      )}
                      <button
                        onClick={() => setSelectedNodeId(node.id)}
                        className={`w-full p-3 rounded-xl border transition-all text-left flex items-center gap-3 ${
                          !isParentUnlocked
                            ? 'opacity-30 border-dashed border-zinc-800 bg-zinc-950/40 cursor-not-allowed'
                            : isUnlocked
                            ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200 shadow-sm'
                            : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700 text-zinc-400'
                        } ${isSelected ? 'ring-2 ring-cyan-400' : ''}`}
                      >
                        <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
                          {!isParentUnlocked ? (
                            <HelpCircle className="w-4 h-4 text-zinc-600" />
                          ) : (
                            <IconRenderer name={node.icon} className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-xs font-semibold text-zinc-200 truncate">{node.name}</h5>
                          <span className="text-[10px] font-mono text-zinc-500">
                            {isUnlocked ? 'Desperto' : `${node.cost} Ancestral`}
                          </span>
                        </div>
                      </button>
                    </React.Fragment>
                  );
                })}
              </div>

              {/* RAMO 2: UCHIHA (Clique & Acertos Críticos) */}
              <div className="flex flex-col items-center gap-4 bg-zinc-950/40 p-4 rounded-xl border border-zinc-850">
                <div className="text-center pb-2 border-b border-zinc-850 w-full">
                  <Badge variant="danger">Ramo Uchiha</Badge>
                  <span className="text-[10px] font-mono text-zinc-500 block mt-1">Clique & Críticos</span>
                </div>

                {uchihaBranch.map((node, i) => {
                  const isUnlocked = !!clanNodes[node.id];
                  const isParentUnlocked = !node.parent || !!clanNodes[node.parent];
                  const isSelected = selectedNodeId === node.id;

                  return (
                    <React.Fragment key={node.id}>
                      {i > 0 && (
                        <div
                          className={`w-0.5 h-6 transition-colors ${
                            isUnlocked ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' : 'bg-zinc-800'
                          }`}
                        />
                      )}
                      <button
                        onClick={() => setSelectedNodeId(node.id)}
                        className={`w-full p-3 rounded-xl border transition-all text-left flex items-center gap-3 ${
                          !isParentUnlocked
                            ? 'opacity-30 border-dashed border-zinc-800 bg-zinc-950/40 cursor-not-allowed'
                            : isUnlocked
                            ? 'bg-rose-950/40 border-rose-500/50 text-rose-200 shadow-sm'
                            : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700 text-zinc-400'
                        } ${isSelected ? 'ring-2 ring-rose-400' : ''}`}
                      >
                        <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
                          {!isParentUnlocked ? (
                            <HelpCircle className="w-4 h-4 text-zinc-600" />
                          ) : (
                            <IconRenderer name={node.icon} className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-xs font-semibold text-zinc-200 truncate">{node.name}</h5>
                          <span className="text-[10px] font-mono text-zinc-500">
                            {isUnlocked ? 'Desperto' : `${node.cost} Ancestral`}
                          </span>
                        </div>
                      </button>
                    </React.Fragment>
                  );
                })}
              </div>

              {/* RAMO 3: HYŪGA (Precisão & Recompensas) */}
              <div className="flex flex-col items-center gap-4 bg-zinc-950/40 p-4 rounded-xl border border-zinc-850">
                <div className="text-center pb-2 border-b border-zinc-850 w-full">
                  <Badge variant="chakra">Ramo Hyūga</Badge>
                  <span className="text-[10px] font-mono text-zinc-500 block mt-1">Precisão Tenketsu</span>
                </div>

                {hyugaBranch.map((node) => {
                  const isUnlocked = !!clanNodes[node.id];
                  const isParentUnlocked = !node.parent || !!clanNodes[node.parent];
                  const isSelected = selectedNodeId === node.id;

                  return (
                    <button
                      key={node.id}
                      onClick={() => setSelectedNodeId(node.id)}
                      className={`w-full p-3 rounded-xl border transition-all text-left flex items-center gap-3 ${
                        !isParentUnlocked
                          ? 'opacity-30 border-dashed border-zinc-800 bg-zinc-950/40 cursor-not-allowed'
                          : isUnlocked
                          ? 'bg-amber-950/40 border-amber-500/50 text-amber-200 shadow-sm'
                          : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700 text-zinc-400'
                      } ${isSelected ? 'ring-2 ring-amber-400' : ''}`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
                        <IconRenderer name={node.icon} className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-xs font-semibold text-zinc-200 truncate">{node.name}</h5>
                        <span className="text-[10px] font-mono text-zinc-500">
                          {isUnlocked ? 'Desperto' : `${node.cost} Ancestral`}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* RAMO 4: OTSUTSUKI (Poder Transcendente) */}
              <div className="flex flex-col items-center gap-4 bg-zinc-950/40 p-4 rounded-xl border border-zinc-850">
                <div className="text-center pb-2 border-b border-zinc-850 w-full">
                  <Badge variant="warning">Ramo Otsutsuki</Badge>
                  <span className="text-[10px] font-mono text-zinc-500 block mt-1">Transcendência Divina</span>
                </div>

                {otsutsukiBranch.map((node) => {
                  const isUnlocked = !!clanNodes[node.id];
                  const isParentUnlocked = !node.parent || !!clanNodes[node.parent];
                  const isSelected = selectedNodeId === node.id;

                  return (
                    <button
                      key={node.id}
                      onClick={() => setSelectedNodeId(node.id)}
                      className={`w-full p-3 rounded-xl border transition-all text-left flex items-center gap-3 ${
                        !isParentUnlocked
                          ? 'opacity-30 border-dashed border-zinc-800 bg-zinc-950/40 cursor-not-allowed'
                          : isUnlocked
                          ? 'bg-purple-950/50 border-purple-500/60 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                          : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700 text-zinc-400'
                      } ${isSelected ? 'ring-2 ring-purple-400' : ''}`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
                        <IconRenderer name={node.icon} className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-xs font-semibold text-zinc-200 truncate">{node.name}</h5>
                        <span className="text-[10px] font-mono text-zinc-500">
                          {isUnlocked ? 'Desperto' : `${node.cost} Ancestral`}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* CARD LATERAL DE INSPEÇÃO DE NÓ ANCESTRAL                          */}
        {/* ================================================================= */}
        <aside className="w-full lg:w-96 bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl shadow-2xl p-6 flex flex-col justify-between">
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
                <Badge variant="cyan">Disponível</Badge>
              ) : (
                <Badge variant="neutral" icon={<Lock className="w-3 h-3" />}>
                  Névoa da Guerra
                </Badge>
              )}
            </div>

            {/* Ícone e Nome do Nó */}
            <div className="mt-5 flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-100 shadow-md">
                <IconRenderer name={selectedNode.icon} className="w-8 h-8 stroke-[1.5]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-100">{selectedNode.name}</h3>
                <span className="text-xs font-mono text-purple-400 uppercase tracking-wider block mt-0.5">
                  Ramo {selectedNode.branch}
                </span>
              </div>
            </div>

            {/* Descrição e Bônus Matemático */}
            <div className="mt-5 p-4 rounded-xl bg-zinc-950/70 border border-zinc-850 text-xs font-mono leading-relaxed text-zinc-300">
              <div className="flex items-center gap-1.5 text-zinc-400 font-semibold mb-2">
                <Info className="w-4 h-4 text-purple-400" />
                <span>Efeito Permanente da Linhagem:</span>
              </div>
              <p>{selectedNode.desc}</p>
            </div>

            {/* Requisitos de Linhagem */}
            {selectedNode.parent && (
              <div className="mt-4 p-3 rounded-lg bg-zinc-950/40 border border-zinc-850 text-xs font-mono flex items-center justify-between">
                <span className="text-zinc-500">Requer ancestral:</span>
                <span className={isSelectedParentUnlocked ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                  {CLAN_NODES[selectedNode.parent]?.name || 'Anterior'}
                </span>
              </div>
            )}
          </div>

          {/* Botão de Aquisição / Status */}
          <div className="pt-6 border-t border-zinc-800/80">
            <div className="flex items-center justify-between text-xs font-mono mb-3">
              <span className="text-zinc-400">Custo de Despertar:</span>
              <strong className="text-purple-300 text-sm">{selectedNode.cost} Chakra Ancestral</strong>
            </div>

            {isSelectedUnlocked ? (
              <div className="w-full py-2.5 rounded-xl bg-emerald-950/30 border border-emerald-800/50 text-emerald-400 text-xs font-mono font-bold text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Linhagem Ativa e Consolidada
              </div>
            ) : (
              <button
                disabled={!isSelectedParentUnlocked || !canAffordSelected}
                onClick={() => buyClanNode(selectedNode.id)}
                className={`w-full py-2.5 rounded-xl text-xs font-mono font-bold transition border flex items-center justify-center gap-2 ${
                  isSelectedParentUnlocked && canAffordSelected
                    ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.4)] cursor-pointer'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
                }`}
              >
                {!isSelectedParentUnlocked ? (
                  <>
                    <Lock className="w-4 h-4 text-zinc-600" /> Requer Nó Prévio
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
