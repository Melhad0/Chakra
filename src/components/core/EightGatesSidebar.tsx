import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { formatBigNumber } from '../../engine/BigNumber';
import { getGatesMultiplier } from '../../engine/formulas';
import { GATE_DATA } from '../../engine/data';
import { Tooltip } from '../ui/Tooltip';
import {
  Flame,
  Clock,
  Skull,
  Zap,
  CheckCircle2,
  PanelRightClose,
} from 'lucide-react';

export const EightGatesSidebar: React.FC = () => {
  const chakra = useGameStore((s) => s.chakra);
  const gatesUnlocked = useGameStore((s) => s.gatesUnlocked);
  const gatesActiveTimer = useGameStore((s) => s.gatesActiveTimer);
  const gatesCooldownTimer = useGameStore((s) => s.gatesCooldownTimer);
  const exhaustionTimer = useGameStore((s) => s.exhaustionTimer);
  const buyGate = useGameStore((s) => s.buyGate);
  const triggerGateRelease = useGameStore((s) => s.triggerGateRelease);
  const toggleSidebar = useGameStore((s) => s.toggleEightGatesSidebar);

  const nextGate = GATE_DATA[gatesUnlocked];
  const canUnlockGate = nextGate && chakra.gte(nextGate.cost);
  const multiplier = getGatesMultiplier(gatesUnlocked);
  const currentGate = gatesUnlocked > 0 ? GATE_DATA[gatesUnlocked - 1] : null;

  const canTriggerRelease =
    gatesUnlocked > 0 &&
    gatesActiveTimer === 0 &&
    gatesCooldownTimer === 0 &&
    exhaustionTimer === 0;

  return (
    <div className="w-80 sm:w-88 h-full bg-zinc-950/95 backdrop-blur-xl border border-zinc-800/90 rounded-2xl flex flex-col overflow-hidden shadow-2xl z-20 flex-shrink-0 animate-in fade-in slide-in-from-right-4 duration-250">
      {/* Header da Sidebar com Tooltip */}
      <div className="p-3.5 border-b border-zinc-850/90 bg-zinc-900/60 flex items-center justify-between flex-shrink-0">
        <Tooltip
          title="Oito Portões Internos"
          badgeText={`${gatesUnlocked}/8 Abertos`}
          badgeVariant={gatesUnlocked >= 8 ? 'amber' : 'rose'}
          description="Limitadores biológicos do fluxo de chakra. Ao abrir cada portão, o shinobi libera reservas extremas de velocidade e poder destrutivo sob risco de severa fadiga física."
          metrics={[
            { label: 'Portão Atual', value: currentGate ? currentGate.name : 'Nenhum' },
            { label: 'Multiplicador de Fúria', value: `${multiplier}x CPS`, colorClass: 'text-amber-400' },
            { label: 'Duração da Ativação', value: '20.0s', colorClass: 'text-zinc-300' },
            { label: 'Penalidade de Exaustão', value: '-85% CPS por 20.0s', colorClass: 'text-rose-400' },
            { label: 'Tempo de Recarga', value: '60.0s', colorClass: 'text-cyan-400' },
          ]}
          position="left"
        >
          <div className="flex items-center gap-2 cursor-help group">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                gatesActiveTimer > 0
                  ? 'bg-rose-500/20 border border-rose-500/40 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.4)] animate-pulse'
                  : 'bg-orange-500/15 border border-orange-500/30 text-orange-400 group-hover:border-orange-500/60'
              }`}
            >
              <Flame className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                {currentGate ? currentGate.name : 'Oito Portões'}
                {gatesUnlocked >= 8 && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                    MAX
                  </span>
                )}
              </h3>
              {/* Barra de Progresso Limpa dos Portões */}
              <div className="w-28 h-1 bg-zinc-800 rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-rose-500 rounded-full transition-all duration-300"
                  style={{ width: `${(gatesUnlocked / 8) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </Tooltip>

        <button
          onClick={toggleSidebar}
          title="Recolher Sidebar dos Oito Portões"
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 transition flex items-center gap-1 text-[11px] font-mono border border-transparent hover:border-zinc-700/80 cursor-pointer"
        >
          <PanelRightClose className="w-4 h-4 stroke-[1.75]" />
        </button>
      </div>

      {/* Área Rolável */}
      <div className="flex-1 p-3.5 space-y-3 overflow-y-auto custom-scrollbar">
        {/* Status de Ativação / Recarga / Exaustão */}
        {gatesActiveTimer > 0 ? (
          <Tooltip
            title="Fúria dos Portões Ativa"
            badgeText="Sobrecarga"
            badgeVariant="rose"
            description="Os canais de chakra estão sobrecarregados, multiplicando exponencialmente toda a produção por segundo de tropas e técnicas."
            metrics={[
              { label: 'Multiplicador Ativo', value: `${multiplier}x CPS`, colorClass: 'text-amber-400' },
              { label: 'Tempo Restante', value: `${gatesActiveTimer.toFixed(1)}s`, colorClass: 'text-rose-300' },
              { label: 'Fase Seguinte', value: 'Exaustão Muscular (-85% CPS)', colorClass: 'text-rose-400' },
            ]}
            position="left"
          >
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-rose-950/60 to-orange-950/40 border border-rose-600/50 shadow-[0_0_15px_rgba(244,63,94,0.2)] cursor-help">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-rose-200">
                <span className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-400 animate-spin" /> Fúria Shinobi
                </span>
                <span className="text-rose-300">{gatesActiveTimer.toFixed(1)}s</span>
              </div>
              <div className="mt-2 w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                <div
                  style={{ width: `${(gatesActiveTimer / 20.0) * 100}%` }}
                  className="h-full bg-gradient-to-r from-orange-500 to-rose-500 transition-all duration-100 rounded-full"
                />
              </div>
            </div>
          </Tooltip>
        ) : gatesCooldownTimer > 0 ? (
          <Tooltip
            title="Recarga dos Portões"
            badgeText="Em Espera"
            badgeVariant="amber"
            description="O corpo está restaurando a circulação dos tenketsu antes de permitir uma nova liberação de fúria."
            metrics={[
              { label: 'Tempo Restante', value: `${gatesCooldownTimer.toFixed(1)}s`, colorClass: 'text-amber-400' },
              { label: 'Tempo Total', value: '60.0s', colorClass: 'text-zinc-400' },
            ]}
            position="left"
          >
            <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-800/40 cursor-help">
              <div className="flex items-center justify-between text-xs font-mono text-amber-300">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> Recarga
                </span>
                <span className="font-bold">{gatesCooldownTimer.toFixed(1)}s</span>
              </div>
              <div className="mt-2 w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                <div
                  style={{ width: `${((60.0 - gatesCooldownTimer) / 60.0) * 100}%` }}
                  className="h-full bg-amber-500 transition-all duration-100 rounded-full"
                />
              </div>
            </div>
          </Tooltip>
        ) : exhaustionTimer > 0 ? (
          <Tooltip
            title="Exaustão Shinobi"
            badgeText="Penalidade Severa"
            badgeVariant="rose"
            description="Consequência física direta da ruptura dos portões de chakra. As fibras musculares e os tenketsu sofrem fadiga extrema."
            metrics={[
              { label: 'Penalidade de CPS', value: '-85% de produção', colorClass: 'text-rose-400' },
              { label: 'Duração Restante', value: `${exhaustionTimer.toFixed(1)}s`, colorClass: 'text-amber-300' },
            ]}
            position="left"
          >
            <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-800/50 text-rose-300 cursor-help">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="flex items-center gap-1.5 font-bold">
                  <Skull className="w-4 h-4 text-rose-400" /> Exaustão
                </span>
                <span className="font-bold">{exhaustionTimer.toFixed(1)}s</span>
              </div>
              <div className="mt-2 w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                <div
                  style={{ width: `${(exhaustionTimer / 20.0) * 100}%` }}
                  className="h-full bg-rose-500 transition-all duration-100 rounded-full"
                />
              </div>
            </div>
          </Tooltip>
        ) : (
          <Tooltip
            title="Tenketsu Estabilizados"
            badgeText="Pronto"
            badgeVariant="emerald"
            description="Todos os limitadores internos de energia estão prontos para liberação instantânea de potência máxima."
            metrics={[
              { label: 'Multiplicador Disponível', value: `${multiplier}x CPS`, colorClass: 'text-amber-400' },
              { label: 'Duração da Liberação', value: '20.0s', colorClass: 'text-cyan-400' },
            ]}
            position="left"
          >
            <div className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between text-xs font-mono text-zinc-300 cursor-help">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-400" /> Pronto para Fúria
              </span>
              <span className="text-[10px] text-zinc-500 font-bold">{multiplier}x CPS</span>
            </div>
          </Tooltip>
        )}

        {/* Botão de Liberação de Fúria com Tooltip */}
        <Tooltip
          title="Liberar Fúria dos Oito Portões"
          badgeText={`${multiplier}x CPS`}
          badgeVariant="rose"
          description="Rompe deliberadamente as travas de circulação energética, multiplicando a geração de chakra por 20 segundos antes de incorrer em exaustão física."
          metrics={[
            { label: 'Multiplicador', value: `${multiplier}x CPS`, colorClass: 'text-amber-400' },
            { label: 'Duração do Bônus', value: '20.0s', colorClass: 'text-cyan-400' },
            { label: 'Exaustão Subsequente', value: '-85% CPS por 20s', colorClass: 'text-rose-400' },
            { label: 'Recarga do Sistema', value: '60.0s', colorClass: 'text-zinc-400' },
          ]}
          position="left"
        >
          <button
            disabled={!canTriggerRelease}
            onClick={triggerGateRelease}
            className={`w-full py-2.5 px-3 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-2 border cursor-pointer ${
              canTriggerRelease
                ? 'bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-500 hover:to-rose-500 text-white border-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.35)] active:scale-98'
                : 'bg-zinc-900/50 border-zinc-850 text-zinc-500 cursor-not-allowed'
            }`}
          >
            <Zap className="w-4 h-4 stroke-[2]" />
            <span>Liberar Fúria</span>
          </button>
        </Tooltip>

        {/* Lista dos 8 Portões Minimalistas com Tooltips */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {GATE_DATA.map((gate) => {
            const isUnlocked = gate.id <= gatesUnlocked;
            const isActive = gatesActiveTimer > 0 && isUnlocked;
            const isNext = gate.id === gatesUnlocked + 1;

            return (
              <Tooltip
                key={gate.id}
                title={gate.name}
                badgeText={isUnlocked ? 'Desbloqueado' : isNext ? 'Disponível' : 'Bloqueado'}
                badgeVariant={isUnlocked ? 'emerald' : isNext ? 'amber' : 'neutral'}
                description={
                  isUnlocked
                    ? 'Canal corporal desbloqueado. Potencializa o multiplicador total da Fúria Shinobi.'
                    : isNext
                    ? 'Próximo portão pronto para desbloqueio por canalização de chakra.'
                    : 'Requer o desbloqueio sequencial dos portões anteriores.'
                }
                metrics={[
                  { label: 'Ordem', value: `Portão ${gate.id} de 8` },
                  { label: 'Custo de Abertura', value: `${formatBigNumber(gate.cost)} Chakra`, colorClass: 'text-cyan-400' },
                ]}
                position="left"
              >
                <div
                  className={`p-2 rounded-xl border transition flex flex-col justify-between cursor-help ${
                    isActive
                      ? 'bg-rose-950/60 border-rose-500 text-rose-100 shadow-[0_0_10px_rgba(244,63,94,0.3)] animate-pulse'
                      : isUnlocked
                      ? 'bg-zinc-900/80 border-orange-500/40 text-zinc-100'
                      : isNext
                      ? 'bg-zinc-900/40 border-zinc-700/80 text-zinc-300'
                      : 'bg-zinc-950/40 border-zinc-850/60 text-zinc-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-mono font-bold ${
                        isUnlocked
                          ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                          : 'bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      {gate.id}
                    </span>
                    {isUnlocked ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 stroke-[2]" />
                    ) : (
                      <span className="text-[9px] font-mono text-zinc-500">
                        {formatBigNumber(gate.cost)}
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] font-semibold truncate leading-tight">
                    {gate.name.replace('Portão da ', '').replace('Portão do ', '')}
                  </div>
                </div>
              </Tooltip>
            );
          })}
        </div>

        {/* Ação de Desbloquear Próximo Portão com Tooltip */}
        <div className="pt-2 border-t border-zinc-850/80">
          <Tooltip
            title={gatesUnlocked >= 8 ? 'Portões Maximizados' : `Desbloquear ${nextGate?.name}`}
            badgeText={gatesUnlocked >= 8 ? 'MAX' : canUnlockGate ? 'Acessível' : 'Insuficiente'}
            badgeVariant={gatesUnlocked >= 8 ? 'emerald' : canUnlockGate ? 'cyan' : 'rose'}
            description={
              gatesUnlocked >= 8
                ? 'Todos os 8 portões biológicos de chakra foram completamente dominados.'
                : 'Canalize energia ancestral para romper permanentemente este limitador biológico e elevar o poder de Fúria.'
            }
            metrics={
              nextGate
                ? [
                    { label: 'Custo de Abertura', value: `${formatBigNumber(nextGate.cost)} Chakra`, colorClass: 'text-cyan-400' },
                    { label: 'Multiplicador Total', value: `${getGatesMultiplier(gatesUnlocked + 1)}x CPS`, colorClass: 'text-amber-400' },
                  ]
                : []
            }
            position="left"
          >
            <button
              disabled={gatesUnlocked >= 8 || !canUnlockGate}
              onClick={buyGate}
              className={`w-full py-2 px-3 rounded-xl text-xs font-mono font-medium transition flex items-center justify-center gap-1.5 border ${
                gatesUnlocked >= 8
                  ? 'bg-zinc-900/40 border-zinc-800 text-emerald-400 cursor-default'
                  : canUnlockGate
                  ? 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/50 text-amber-300 shadow-sm cursor-pointer'
                  : 'bg-zinc-900/40 border-zinc-850 text-zinc-500 cursor-not-allowed'
              }`}
            >
              {gatesUnlocked >= 8 ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 stroke-[2]" /> Todos os 8 Portões Abertos
                </>
              ) : (
                <>
                  <span>Desbloquear {nextGate?.name}</span>
                  <span className="font-bold text-amber-400">({formatBigNumber(nextGate?.cost || 0)})</span>
                </>
              )}
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

