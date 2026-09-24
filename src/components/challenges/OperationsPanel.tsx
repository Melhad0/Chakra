import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { formatBigNumber } from '../../engine/BigNumber';
import { CLAN_NODES } from '../../engine/data';
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

  // Estado Local de Combate do Gauntlet
  const [bossIndex, setBossIndex] = useState<number>(0);
  const [bossHp, setBossHp] = useState<number>(MOCK_BOSSES[0].hp);
  const [isHit, setIsHit] = useState<boolean>(false);

  const currentBoss = MOCK_BOSSES[bossIndex];
  const hpPercent = Math.max(0, Math.min(100, (bossHp / currentBoss.hp) * 100));

  const handleAttackBoss = () => {
    audio.playCrit();
    setIsHit(true);
    setTimeout(() => setIsHit(false), 120);

    const dmg = Math.max(10, Math.floor(currentBoss.hp * 0.15));
    setBossHp((prev: number) => {
      const next = prev - dmg;
      if (next <= 0) {
        audio.playLevelUp();
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
    <aside className="h-full bg-shinobi-card/80 backdrop-blur-md border border-shinobi-border rounded-xl p-3 flex flex-col overflow-hidden">
      {/* Abas Deslizantes com Microinterações */}
      <nav className="flex items-center gap-1 pb-2 border-b border-shinobi-border overflow-x-auto custom-scrollbar flex-shrink-0">
        <button
          onClick={() => setActiveTab('gauntlet')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
            activeTab === 'gauntlet'
              ? 'bg-chakra-fire text-white shadow-fire-glow'
              : 'bg-glass-card text-shinobi-muted hover:text-white'
          }`}
        >
          <Swords className="w-3.5 h-3.5" /> 100 Chefes
        </button>

        <button
          onClick={() => setActiveTab('clans')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
            activeTab === 'clans'
              ? 'bg-chakra-water text-black shadow-chakra-glow font-black'
              : 'bg-glass-card text-shinobi-muted hover:text-white'
          }`}
        >
          <GitFork className="w-3.5 h-3.5" /> Árvore de Clãs
        </button>

        <button
          onClick={() => setActiveTab('exam')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
            activeTab === 'exam'
              ? 'bg-chakra-wind text-black font-black'
              : 'bg-glass-card text-shinobi-muted hover:text-white'
          }`}
        >
          <Scroll className="w-3.5 h-3.5" /> Exame Chūnin
        </button>

        <button
          onClick={() => setActiveTab('rankings')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
            activeTab === 'rankings'
              ? 'bg-chakra-gold text-black font-black'
              : 'bg-glass-card text-shinobi-muted hover:text-white'
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
            <div className="p-3 bg-black/40 border border-chakra-fire/30 rounded-xl relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div
                  className={`w-16 h-16 rounded-full bg-white/5 border-2 border-chakra-fire/50 flex items-center justify-center text-3xl animate-hover-bob transition filter ${
                    isHit ? 'brightness-200 contrast-150 scale-95' : ''
                  }`}
                >
                  {currentBoss.avatar}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-chakra-fire uppercase tracking-wider">
                      #{currentBoss.id} [{currentBoss.arc}]
                    </span>
                    <span className="text-xs font-bold text-shinobi-muted">
                      {bossHp} / {currentBoss.hp} HP
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-white">{currentBoss.name}</h4>
                  <p className="text-[11px] text-shinobi-muted truncate">{currentBoss.title}</p>

                  {/* Barra de Vida Fluida Dinâmica com Rastro Fantasma */}
                  <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden mt-2 relative">
                    <div
                      style={{ width: `${hpPercent}%` }}
                      className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-red-600 fluid-bar rounded-full transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleAttackBoss}
                  className="flex-1 py-2 bg-gradient-to-r from-chakra-fire to-red-600 text-white text-xs font-black rounded-lg shadow-fire-glow hover:scale-[1.02] active:scale-95 transition flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-4 h-4" /> ATACAR COM CHAKRA!
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
                        ? 'bg-chakra-fire/20 border-chakra-fire text-white'
                        : 'bg-glass-card border-shinobi-border text-shinobi-muted hover:text-white'
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
            <div className="flex items-center justify-between bg-black/40 p-2.5 rounded-lg border border-shinobi-border">
              <span className="text-xs font-bold text-shinobi-muted">Chakra Ancestral:</span>
              <span className="text-sm font-black text-chakra-ancestral">{chakraAncestral.toString()}</span>
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
                        ? 'bg-chakra-wind/10 border-chakra-wind/60'
                        : canAfford
                        ? 'bg-glass-card border-chakra-water/50'
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
                      <span className="text-[10px] font-bold text-chakra-ancestral">
                        {isUnlocked ? '✓ Desperto' : `Custo: ${node.cost} Ancestral`}
                      </span>

                      {!isUnlocked && (
                        <button
                          disabled={!canAfford}
                          onClick={() => buyClanNode(node.id)}
                          className={`px-3 py-1 rounded text-[11px] font-black transition ${
                            canAfford
                              ? 'bg-chakra-water text-black shadow-chakra-glow hover:scale-105'
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
            <div className="p-4 bg-glass-card border border-chakra-wind/40 rounded-xl">
              <h4 className="text-sm font-black text-white mb-1">📜 Exame Chūnin Oficial</h4>
              <p className="text-xs text-shinobi-muted mb-4">
                Supere as 3 fases de teste (Prova Escrita, Floresta da Morte e Torneio 1v1 com QTE).
              </p>

              <div className="space-y-2 text-left text-xs mb-4">
                <div className="p-2 bg-white/5 rounded border border-shinobi-border">
                  <span className="font-bold text-chakra-wind">1ª Fase:</span> Prova Escrita & Trapaça Furtiva
                </div>
                <div className="p-2 bg-white/5 rounded border border-shinobi-border">
                  <span className="font-bold text-chakra-water">2ª Fase:</span> Floresta da Morte (180 segundos)
                </div>
                <div className="p-2 bg-white/5 rounded border border-shinobi-border">
                  <span className="font-bold text-chakra-fire">3ª Fase:</span> Torneio na Arena & Reflexos de Parry
                </div>
              </div>

              <button
                onClick={() => alert('O Exame Chūnin começará! Bônus de 2x permanente em todo o CPS!')}
                className="w-full py-2.5 bg-gradient-to-r from-chakra-wind to-emerald-500 text-black font-black text-xs rounded-lg shadow-md hover:scale-[1.02] transition"
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
            <div className="p-2.5 bg-chakra-fire/10 border border-chakra-fire/50 rounded-lg flex items-center justify-between text-xs font-bold text-white">
              <span>🌟 Você (Shinobi)</span>
              <span className="font-mono text-chakra-water">{formatBigNumber(chakra)}</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
