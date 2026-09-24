import React, { useState, useMemo } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { formatBigNumber, D } from '../../engine/BigNumber';
import { CLAN_NODES } from '../../engine/data';
import { calculateTotalCPS, calculateClickPower } from '../../engine/formulas';
import { audio } from '../../engine/audio';
import { Swords, Scroll, GitFork, Trophy, Zap } from 'lucide-react';

const MOCK_BOSSES = [
  { id: 1, name: 'Mizuki', arc: 'Clássico', title: 'Instrutor Traidor', avatar: '🗡️', hp: 150 },
  { id: 2, name: 'Haku (Espelhos de Gelo)', arc: 'Clássico', title: 'Portador do Hyōton', avatar: '❄️', hp: 1200 },
  { id: 3, name: 'Zabuza Momochi', arc: 'Clássico', title: 'Demônio da Névoa Oculta', avatar: '🗡️', hp: 2400 },
  { id: 4, name: 'Gaara do Deserto', arc: 'Clássico', title: 'A Besta de Areia de Suna', avatar: '🏺', hp: 45000 },
  { id: 5, name: 'Itachi Uchiha', arc: 'Shippuden', title: 'Chamas Negras do Amaterasu', avatar: '🦅', hp: 5000000 },
  { id: 6, name: 'Pain (Caminho Deva)', arc: 'Shippuden', title: 'Shinra Tensei Absoluto', avatar: '🌌', hp: 85000000 },
  { id: 7, name: 'Madara Rikudou', arc: 'Guerra', title: 'Tsukuyomi Infinito Planetário', avatar: '🌙', hp: 4800000000 },
  { id: 8, name: 'Kaguya Otsutsuki', arc: 'Guerra & Otsutsuki', title: 'Deusa Progenitora do Chakra', avatar: '👸', hp: 95000000000 },
];

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

  // Estado Local de Combate do Gauntlet
  const [bossIndex, setBossIndex] = useState<number>(0);
  const [bossHp, setBossHp] = useState<number>(MOCK_BOSSES[0].hp);
  const [isHit, setIsHit] = useState<boolean>(false);
  const [lastDmgInfo, setLastDmgInfo] = useState<{ amount: number; isCrit: boolean } | null>(null);

  const currentBoss = MOCK_BOSSES[bossIndex];
  const hpPercent = Math.max(0, Math.min(100, (bossHp / currentBoss.hp) * 100));

  // Dano real baseado no Poder de Ataque do Jogador
  const playerBaseDamage = Math.max(5, Math.floor(clickPower.toNumber()));

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
    const dmg = Math.max(1, calculatedDmg);

    setLastDmgInfo({ amount: dmg, isCrit });
    setTimeout(() => setLastDmgInfo(null), 600);

    setBossHp((prev: number) => {
      const next = prev - dmg;
      if (next <= 0) {
        audio.playLevelUp();
        // Recompensa em chakra proporcional ao chefe abatido
        const bounty = D(currentBoss.hp).mul(2);
        useGameStore.setState((state) => ({
          chakra: state.chakra.add(bounty),
        }));

        if (bossIndex + 1 < MOCK_BOSSES.length) {
          setBossIndex((idx: number) => idx + 1);
          return MOCK_BOSSES[bossIndex + 1].hp;
        }
        return 0;
      }
      return next;
    });
  };

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
          <Swords className="w-3.5 h-3.5" /> 100 Chefes
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
        {/* 1. ABA GAUNTLET (100 CHEFES) */}
        {activeTab === 'gauntlet' && (
          <div className="space-y-3">
            {/* Arena de Duelo Ativo com Efeito de Flutuação e Barra Fluida */}
            <div className="p-3 bg-black/60 border border-chakra-orange/40 rounded-xl relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div
                  className={`w-16 h-16 rounded-full bg-white/5 border-2 border-chakra-orange/60 flex items-center justify-center text-3xl animate-hover-bob transition filter ${
                    isHit ? 'brightness-200 contrast-150 scale-95' : ''
                  }`}
                >
                  {currentBoss.avatar}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-chakra-orange uppercase tracking-wider">
                      #{currentBoss.id} [{currentBoss.arc}]
                    </span>
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
                  <h4 className="text-sm font-black text-white">{currentBoss.name}</h4>
                  <p className="text-[11px] text-shinobi-muted truncate">{currentBoss.title}</p>

                  {/* Barra de Vida Fluida Dinâmica em Fogo Laranja */}
                  <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden mt-2 relative">
                    <div
                      style={{ width: `${hpPercent}%` }}
                      className="h-full bg-gradient-to-r from-red-600 via-chakra-orange to-chakra-amber fluid-bar rounded-full transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleAttackBoss}
                  className="flex-1 py-2 bg-gradient-to-r from-chakra-orange via-chakra-fire to-red-600 text-white text-xs font-black rounded-lg shadow-orange-glow hover:scale-[1.02] active:scale-95 transition flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-4 h-4" /> ATACAR COM CHAKRA! (-{formatBigNumber(playerBaseDamage)} Dano)
                </button>
              </div>
            </div>

            {/* Lista Cronológica de Oponentes */}
            <div>
              <h5 className="text-[11px] font-black uppercase text-shinobi-muted tracking-wider mb-2">
                Oponentes Cronológicos
              </h5>
              <div className="grid grid-cols-2 gap-1.5">
                {MOCK_BOSSES.map((boss, idx) => (
                  <div
                    key={boss.id}
                    onClick={() => {
                      setBossIndex(idx);
                      setBossHp(boss.hp);
                    }}
                    className={`p-2 rounded-lg border text-xs cursor-pointer transition ${
                      bossIndex === idx
                        ? 'bg-chakra-orange/20 border-chakra-orange text-white'
                        : 'bg-glass-card border-shinobi-border text-shinobi-muted hover:text-white hover:border-chakra-orange/30'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg">{boss.avatar}</span>
                      <span className="font-bold truncate">{boss.name}</span>
                    </div>
                  </div>
                ))}
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
