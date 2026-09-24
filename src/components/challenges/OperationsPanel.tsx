import React, { useState, useMemo } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { formatBigNumber, D } from '../../engine/BigNumber';
import Decimal from 'break_infinity.js';
import { CLAN_NODES } from '../../engine/data';
import { calculateTotalCPS, calculateClickPower } from '../../engine/formulas';
import { audio } from '../../engine/audio';
import { GAUNTLET_BOSSES } from '../../data/gauntletBosses';
import { Swords, Scroll, GitFork, Trophy, Zap, ChevronLeft, ChevronRight, Info } from 'lucide-react';

export const OperationsPanel: React.FC = () => {
  const activeTab = useGameStore((s) => s.activeTab);
  const setActiveTab = useGameStore((s) => s.setActiveTab);
  const chakra = useGameStore((s) => s.chakra);
  const chakraAncestral = useGameStore((s) => s.chakraAncestral);
  const clanNodes = useGameStore((s) => s.clanNodes);
  const buyClanNode = useGameStore((s) => s.buyClanNode);
  const generators = useGameStore((s) => s.generators);
  const upgrades = useGameStore((s) => s.upgrades);
  const gatesUnlocked = useGameStore((s) => s.gatesUnlocked);
  const gatesActiveTimer = useGameStore((s) => s.gatesActiveTimer);
  const exhaustionTimer = useGameStore((s) => s.exhaustionTimer);

  const currentCPS = useMemo(() => {
    return calculateTotalCPS(
      generators,
      upgrades,
      clanNodes,
      gatesUnlocked,
      gatesActiveTimer > 0,
      exhaustionTimer > 0
    );
  }, [generators, upgrades, clanNodes, gatesUnlocked, gatesActiveTimer, exhaustionTimer]);

  const clickPower = useMemo(() => {
    return calculateClickPower(currentCPS, upgrades, clanNodes);
  }, [currentCPS, upgrades, clanNodes]);

  // Estado de Combate do Gauntlet (25 Chefes Fases 101 a 125)
  const [bossIndex, setBossIndex] = useState<number>(0);
  const [bossHp, setBossHp] = useState<Decimal>(GAUNTLET_BOSSES[0].hp);
  const [isHit, setIsHit] = useState<boolean>(false);
  const [lastDmgInfo, setLastDmgInfo] = useState<{ amount: number; isCrit: boolean } | null>(null);
  const [tierFilter, setTierFilter] = useState<string>('Todos');

  const currentBoss = GAUNTLET_BOSSES[bossIndex] || GAUNTLET_BOSSES[0];
  const hpPercent = Math.max(0, Math.min(100, bossHp.div(currentBoss.hp).mul(100).toNumber()));

  // Dano real do clique do shinobi
  const playerBaseDamage = Math.max(5, Math.floor(clickPower.toNumber()));

  const handleSelectBoss = (idx: number) => {
    setBossIndex(idx);
    setBossHp(GAUNTLET_BOSSES[idx].hp);
  };

  const handleAttackBoss = () => {
    setIsHit(true);
    setTimeout(() => setIsHit(false), 120);

    // Chance de crítico baseada nos nós de clã (Sharingan)
    let critChance = 0.05;
    let critMult = 2.0;
    if (clanNodes['sharingan_awakening']) critChance += 0.10;
    if (clanNodes['mangekyo_sharingan_lineage']) critMult = 3.0;

    const isCrit = Math.random() < critChance;
    if (isCrit) {
      audio.playCrit();
    } else {
      audio.playClick();
    }

    const calculatedDmg = isCrit ? Math.floor(playerBaseDamage * critMult) : playerBaseDamage;
    const dmg = D(Math.max(1, calculatedDmg));

    setLastDmgInfo({ amount: dmg.toNumber(), isCrit });
    setTimeout(() => setLastDmgInfo(null), 600);

    setBossHp((prev) => {
      const next = prev.sub(dmg);
      if (next.lte(0)) {
        audio.playLevelUp();
        // Concede Recompensa de Chakra e Chakra Ancestral
        useGameStore.setState((state) => ({
          chakra: state.chakra.add(currentBoss.bountyChakra),
          chakraAncestral: state.chakraAncestral.add(currentBoss.bountyAncestral),
        }));

        if (bossIndex + 1 < GAUNTLET_BOSSES.length) {
          const nextIdx = bossIndex + 1;
          setBossIndex(nextIdx);
          return GAUNTLET_BOSSES[nextIdx].hp;
        }
        return D(0);
      }
      return next;
    });
  };

  // Filtragem dos 25 chefes
  const filteredBosses = useMemo(() => {
    if (tierFilter === 'Todos') return GAUNTLET_BOSSES;
    return GAUNTLET_BOSSES.filter((b) => b.tier === tierFilter);
  }, [tierFilter]);

  return (
    <aside className="h-full bg-shinobi-card/90 backdrop-blur-md border border-shinobi-border hover:border-shinobi-border-orange/30 transition-colors rounded-xl p-3 flex flex-col overflow-hidden shadow-2xl">
      {/* Abas Deslizantes com Microinterações */}
      <nav className="flex items-center gap-1.5 pb-2 border-b border-shinobi-border overflow-x-auto custom-scrollbar flex-shrink-0">
        <button
          onClick={() => setActiveTab('gauntlet')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
            activeTab === 'gauntlet'
              ? 'bg-gradient-to-r from-chakra-orange to-chakra-amber text-black font-black shadow-orange-glow'
              : 'bg-glass-card text-shinobi-muted hover:text-white hover:border-chakra-orange/30'
          }`}
        >
          <Swords className="w-3.5 h-3.5" /> 25 Chefes (101-125)
        </button>

        <button
          onClick={() => setActiveTab('clans')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
            activeTab === 'clans'
              ? 'bg-gradient-to-r from-chakra-orange to-chakra-amber text-black font-black shadow-orange-glow'
              : 'bg-glass-card text-shinobi-muted hover:text-white hover:border-chakra-orange/30'
          }`}
        >
          <GitFork className="w-3.5 h-3.5" /> Árvore de Clãs
        </button>

        <button
          onClick={() => setActiveTab('exam')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
            activeTab === 'exam'
              ? 'bg-gradient-to-r from-chakra-orange to-chakra-amber text-black font-black shadow-orange-glow'
              : 'bg-glass-card text-shinobi-muted hover:text-white hover:border-chakra-orange/30'
          }`}
        >
          <Scroll className="w-3.5 h-3.5" /> Exame Chūnin
        </button>

        <button
          onClick={() => setActiveTab('rankings')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
            activeTab === 'rankings'
              ? 'bg-gradient-to-r from-chakra-orange to-chakra-amber text-black font-black shadow-orange-glow'
              : 'bg-glass-card text-shinobi-muted hover:text-white hover:border-chakra-orange/30'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" /> Ranks
        </button>
      </nav>

      {/* Conteúdo Dinâmico das Abas */}
      <div className="flex-1 overflow-y-auto mt-2 pr-1 custom-scrollbar">
        {/* 1. ABA GAUNTLET (25 CHEFES: FASES 101 A 125) */}
        {activeTab === 'gauntlet' && (
          <div className="space-y-3">
            {/* Arena de Duelo Ativo com Efeito de Flutuação e Barra Fluida */}
            <div className="p-3 bg-black/60 border border-chakra-orange/40 rounded-xl relative overflow-hidden shadow-xl">
              <div className="flex items-start gap-3">
                <div
                  className={`w-16 h-16 rounded-full bg-white/5 border-2 border-chakra-orange/60 flex items-center justify-center text-3xl animate-hover-bob transition filter flex-shrink-0 ${
                    isHit ? 'brightness-200 contrast-150 scale-95' : ''
                  }`}
                >
                  {currentBoss.avatar}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black text-chakra-orange uppercase tracking-wider bg-chakra-orange/15 px-1.5 py-0.5 rounded border border-chakra-orange/30">
                        Fase #{currentBoss.id}
                      </span>
                      <span className="text-[10px] font-bold text-gray-300 bg-white/10 px-1.5 py-0.5 rounded">
                        {currentBoss.level}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {lastDmgInfo && (
                        <span className={`text-[11px] font-black animate-pulse ${lastDmgInfo.isCrit ? 'text-chakra-gold' : 'text-chakra-orange'}`}>
                          -{formatBigNumber(lastDmgInfo.amount)} {lastDmgInfo.isCrit ? '🔥 CRÍTICO!' : '💥'}
                        </span>
                      )}
                      <span className="text-xs font-bold text-shinobi-muted">
                        {formatBigNumber(bossHp)} / {formatBigNumber(currentBoss.hp)} HP
                      </span>
                    </div>
                  </div>

                  <h4 className="text-sm font-black text-white mt-1 leading-tight">{currentBoss.name}</h4>
                  <p className="text-[11px] text-chakra-amber font-semibold truncate">{currentBoss.title}</p>

                  {/* Justificativa Canônica / Lore Estratégico */}
                  <div className="mt-1.5 p-1.5 rounded bg-black/50 border border-white/5 text-[11px] text-zinc-300 leading-snug flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 text-chakra-orange flex-shrink-0 mt-0.5" />
                    <span>{currentBoss.justification}</span>
                  </div>

                  {/* Barra de Vida Fluida Dinâmica em Fogo Laranja */}
                  <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden mt-2 relative">
                    <div
                      style={{ width: `${hpPercent}%` }}
                      className="h-full bg-gradient-to-r from-red-600 via-chakra-orange to-chakra-amber fluid-bar rounded-full transition-all duration-300"
                    />
                  </div>

                  {/* Recompensas ao Abater */}
                  <div className="mt-1.5 flex items-center justify-between text-[10px] font-bold">
                    <span className="text-chakra-gold">
                      Recompensa: +{formatBigNumber(currentBoss.bountyChakra)} Chakra
                    </span>
                    <span className="text-chakra-orange">
                      +{currentBoss.bountyAncestral} Ancestral
                    </span>
                  </div>
                </div>
              </div>

              {/* Botões de Ação e Navegação */}
              <div className="mt-3 flex items-center gap-2">
                <button
                  disabled={bossIndex === 0}
                  onClick={() => handleSelectBoss(bossIndex - 1)}
                  title="Chefe Anterior"
                  className="p-2 rounded-lg bg-white/5 border border-shinobi-border text-shinobi-muted hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={handleAttackBoss}
                  className="flex-1 py-2 bg-gradient-to-r from-chakra-orange via-chakra-fire to-red-600 text-white text-xs font-black rounded-lg shadow-orange-glow hover:scale-[1.02] active:scale-95 transition flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-4 h-4" /> ATACAR COM CHAKRA! (-{formatBigNumber(playerBaseDamage)} Dano)
                </button>

                <button
                  disabled={bossIndex === GAUNTLET_BOSSES.length - 1}
                  onClick={() => handleSelectBoss(bossIndex + 1)}
                  title="Próximo Chefe"
                  className="p-2 rounded-lg bg-white/5 border border-shinobi-border text-shinobi-muted hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filtros de Tier de Poder (Fases 101 a 125) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <h5 className="text-[11px] font-black uppercase text-shinobi-muted tracking-wider">
                  Escala de Progressão (25 Chefes)
                </h5>
                <span className="text-[10px] font-bold text-chakra-orange">
                  Fase #{currentBoss.id} / 125
                </span>
              </div>

              {/* Filtro Rápido de Tiers */}
              <div className="flex gap-1 overflow-x-auto pb-1.5 custom-scrollbar text-[10px] font-bold">
                {[
                  { label: 'Todos (25)', val: 'Todos' },
                  { label: 'Chūnin/Jōnin (101-105)', val: 'Chūnin / Jōnin Básico' },
                  { label: 'Elite/Pré-Kage (106-113)', val: 'Jōnin de Elite / Pré-Kage' },
                  { label: 'Kage/Lendário (114-120)', val: 'Kage / Lendário' },
                  { label: 'Divino (121-125)', val: 'Continental / Divino' },
                ].map((tier) => (
                  <button
                    key={tier.val}
                    onClick={() => setTierFilter(tier.val)}
                    className={`px-2 py-1 rounded-md whitespace-nowrap border transition ${
                      tierFilter === tier.val
                        ? 'bg-chakra-orange/20 border-chakra-orange text-chakra-orange font-black'
                        : 'bg-glass-card border-shinobi-border text-shinobi-muted hover:text-white'
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>

              {/* Grid dos Chefes com Identificação de Fase e Nível */}
              <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                {filteredBosses.map((boss) => {
                  const originalIndex = GAUNTLET_BOSSES.findIndex((b) => b.id === boss.id);
                  const isSelected = bossIndex === originalIndex;

                  return (
                    <div
                      key={boss.id}
                      onClick={() => handleSelectBoss(originalIndex)}
                      className={`p-2 rounded-lg border text-xs cursor-pointer transition flex items-center justify-between ${
                        isSelected
                          ? 'bg-chakra-orange/20 border-chakra-orange text-white shadow-sm'
                          : 'bg-glass-card border-shinobi-border text-shinobi-muted hover:text-white hover:border-chakra-orange/30'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xl flex-shrink-0">{boss.avatar}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-black text-chakra-orange">#{boss.id}</span>
                            <span className="font-bold truncate text-[11px] text-white">{boss.name}</span>
                          </div>
                          <span className="text-[9px] text-zinc-400 block truncate">{boss.level}</span>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 ml-1">
                        <span className="text-[10px] font-mono text-chakra-amber font-semibold block">
                          {formatBigNumber(boss.hp)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 2. ABA ÁRVORE DE CLÃS COM NÉVOA DA GUERRA */}
        {activeTab === 'clans' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-black/60 p-2.5 rounded-lg border border-shinobi-border">
              <span className="text-xs font-bold text-shinobi-muted">Chakra Ancestral:</span>
              <span className="text-sm font-black text-chakra-orange">{chakraAncestral.toString()}</span>
            </div>

            <div className="space-y-2">
              {Object.values(CLAN_NODES).map((node) => {
                const isUnlocked = !!clanNodes[node.id];
                const isVisible = !node.parent || !!clanNodes[node.parent];
                const canAfford = chakraAncestral.gte(node.cost);

                if (!isVisible) {
                  return (
                    <div
                      key={node.id}
                      className="p-3 bg-white/5 border border-dashed border-shinobi-border/40 rounded-lg opacity-50 flex items-center gap-3"
                    >
                      <span className="text-2xl filter grayscale">❓</span>
                      <div>
                        <span className="text-xs font-bold text-shinobi-muted block">Linhagem Oculta</span>
                        <span className="text-[10px] text-shinobi-muted/70">Requer nó ancestral prévio</span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={node.id}
                    className={`p-3 rounded-lg border transition ${
                      isUnlocked
                        ? 'bg-chakra-orange/15 border-chakra-orange/60'
                        : canAfford
                        ? 'bg-glass-card border-chakra-orange/50 hover:border-chakra-orange'
                        : 'bg-glass-card border-shinobi-border opacity-70'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{node.icon}</span>
                        <div>
                          <h4 className="text-xs font-black text-white">{node.name}</h4>
                          <p className="text-[11px] text-shinobi-muted mt-0.5 leading-snug">{node.desc}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-chakra-orange">
                        {isUnlocked ? '✓ Desperto' : `Custo: ${node.cost} Ancestral`}
                      </span>

                      {!isUnlocked && (
                        <button
                          disabled={!canAfford}
                          onClick={() => buyClanNode(node.id)}
                          className={`px-3 py-1 rounded text-[11px] font-black transition ${
                            canAfford
                              ? 'bg-gradient-to-r from-chakra-orange to-chakra-amber text-black shadow-orange-glow hover:scale-105'
                              : 'bg-white/10 text-shinobi-muted cursor-not-allowed'
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

        {/* 3. ABA EXAME CHŪNIN */}
        {activeTab === 'exam' && (
          <div className="space-y-3 p-1 text-center">
            <div className="p-4 bg-glass-card border border-chakra-orange/40 rounded-xl">
              <h4 className="text-sm font-black text-white mb-1">📜 Exame Chūnin Oficial</h4>
              <p className="text-xs text-shinobi-muted mb-4">
                Supere as 3 fases de teste (Prova Escrita, Floresta da Morte e Torneio 1v1 com QTE).
              </p>

              <div className="space-y-2 text-left text-xs mb-4">
                <div className="p-2 bg-white/5 rounded border border-shinobi-border">
                  <span className="font-bold text-chakra-orange">1ª Fase:</span> Prova Escrita & Trapaça Furtiva
                </div>
                <div className="p-2 bg-white/5 rounded border border-shinobi-border">
                  <span className="font-bold text-chakra-amber">2ª Fase:</span> Floresta da Morte (180 segundos)
                </div>
                <div className="p-2 bg-white/5 rounded border border-shinobi-border">
                  <span className="font-bold text-chakra-fire">3ª Fase:</span> Torneio na Arena & Reflexos de Parry
                </div>
              </div>

              <button
                onClick={() => alert('O Exame Chūnin começará! Bônus de 2x permanente em todo o CPS!')}
                className="w-full py-2.5 bg-gradient-to-r from-chakra-orange to-chakra-amber text-black font-black text-xs rounded-lg shadow-orange-glow hover:scale-[1.02] transition"
              >
                INICIAR DESAFIO DO EXAME
              </button>
            </div>
          </div>
        )}

        {/* 4. ABA RANKINGS */}
        {activeTab === 'rankings' && (
          <div className="space-y-2">
            <h5 className="text-[11px] font-black uppercase text-shinobi-muted tracking-wider mb-2">
              Quadro de Honra Shinobi
            </h5>
            <div className="p-2.5 bg-glass-card border border-shinobi-border rounded-lg flex items-center justify-between text-xs">
              <span className="font-bold text-chakra-gold">🥇 1º Hokage Hashirama</span>
              <span className="font-mono text-shinobi-muted">9.99 Qi</span>
            </div>
            <div className="p-2.5 bg-glass-card border border-shinobi-border rounded-lg flex items-center justify-between text-xs">
              <span className="font-bold text-gray-300">🥈 2º Madara Uchiha</span>
              <span className="font-mono text-shinobi-muted">8.50 Qi</span>
            </div>
            <div className="p-2.5 bg-glass-card border border-shinobi-border rounded-lg flex items-center justify-between text-xs">
              <span className="font-bold text-amber-600">🥉 3º Naruto Uzumaki</span>
              <span className="font-mono text-shinobi-muted">5.00 Qi</span>
            </div>
            <div className="p-2.5 bg-chakra-orange/15 border border-chakra-orange/60 rounded-lg flex items-center justify-between text-xs font-bold text-white">
              <span className="text-chakra-orange">🌟 Você (Shinobi)</span>
              <span className="font-mono text-chakra-orange font-black">{formatBigNumber(chakra)}</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
