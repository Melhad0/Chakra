import React, { useRef } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { formatBigNumber } from '../../engine/BigNumber';
import { calculateTotalCPS, calculateClickPower, getGatesMultiplier } from '../../engine/formulas';
import { GATE_DATA } from '../../engine/data';
import { Flame, ShieldAlert, Zap, Target, Activity, Clock, Skull, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Badge } from '../common/Badge';

interface FloatingItemProps {
  id: number;
  x: number;
  y: number;
  text: string;
  isCrit: boolean;
  onRemove: (id: number) => void;
}

const FloatingNumberItem: React.FC<FloatingItemProps> = ({ id, x, y, text, isCrit, onRemove }) => {
  const randomOffset = React.useMemo(() => Math.random() * 60 - 30, []);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(id);
    }, 850);
    return () => clearTimeout(timer);
  }, [id, onRemove]);

  return (
    <div
      onAnimationEnd={() => onRemove(id)}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        ['--float-x' as any]: `${randomOffset}px`,
      }}
      className={`absolute pointer-events-none font-mono font-bold animate-float-fade z-30 select-none ${
        isCrit
          ? 'text-2xl text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]'
          : 'text-sm text-zinc-100 drop-shadow-[0_0_6px_rgba(255,255,255,0.2)]'
      }`}
    >
      {text}
    </div>
  );
};

interface ShockwaveProps {
  id: number;
  x: number;
  y: number;
  isCrit: boolean;
  onRemove: (id: number) => void;
}

const ShockwaveItem: React.FC<ShockwaveProps> = ({ id, x, y, isCrit, onRemove }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(id);
    }, 500);
    return () => clearTimeout(timer);
  }, [id, onRemove]);

  return (
    <div
      onAnimationEnd={() => onRemove(id)}
      style={{ left: `${x}px`, top: `${y}px` }}
      className={`absolute pointer-events-none rounded-full border animate-shockwave-pulse z-20 ${
        isCrit
          ? 'w-24 h-24 border-amber-400/50 bg-amber-400/10'
          : 'w-20 h-20 border-zinc-500/40 bg-white/5'
      }`}
    />
  );
};

export const ActionStage: React.FC = () => {
  const chakra = useGameStore((s) => s.chakra);
  const generators = useGameStore((s) => s.generators);
  const upgrades = useGameStore((s) => s.upgrades);
  const clanNodes = useGameStore((s) => s.clanNodes);
  const gatesUnlocked = useGameStore((s) => s.gatesUnlocked);
  const gatesActiveTimer = useGameStore((s) => s.gatesActiveTimer);
  const gatesCooldownTimer = useGameStore((s) => s.gatesCooldownTimer);
  const exhaustionTimer = useGameStore((s) => s.exhaustionTimer);
  const clickExhaustionTimer = useGameStore((s) => s.clickExhaustionTimer);
  const onlinePresenceBuffTimer = useGameStore((s) => s.onlinePresenceBuffTimer);
  const stageShaking = useGameStore((s) => s.stageShaking);
  const floatingNumbers = useGameStore((s) => s.floatingNumbers);
  const shockwaves = useGameStore((s) => s.shockwaves);

  const clickChakra = useGameStore((s) => s.clickChakra);
  const buyGate = useGameStore((s) => s.buyGate);
  const triggerGateRelease = useGameStore((s) => s.triggerGateRelease);
  const removeFloatingNumber = useGameStore((s) => s.removeFloatingNumber);
  const removeShockwave = useGameStore((s) => s.removeShockwave);

  const stageRef = useRef<HTMLDivElement>(null);

  const currentCPS = React.useMemo(() => {
    return calculateTotalCPS(
      generators,
      upgrades,
      clanNodes,
      gatesUnlocked,
      gatesActiveTimer > 0,
      exhaustionTimer > 0,
      {},
      onlinePresenceBuffTimer > 0
    );
  }, [generators, upgrades, clanNodes, gatesUnlocked, gatesActiveTimer, exhaustionTimer, onlinePresenceBuffTimer]);

  const clickPower = React.useMemo(() => {
    return calculateClickPower(currentCPS, upgrades, clanNodes, generators);
  }, [currentCPS, upgrades, clanNodes, generators]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    clickChakra({ x, y });
  };

  const nextGate = GATE_DATA[gatesUnlocked];
  const canUnlockGate = nextGate && chakra.gte(nextGate.cost);

  return (
    <main className="h-full bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 hover:border-zinc-700/80 transition-colors rounded-xl p-4 flex flex-col items-center justify-between relative overflow-hidden select-none shadow-sm">
      {/* ALERTA DE EXAUSTÃO MUSCULAR SEVERA */}
      {(exhaustionTimer > 0 || clickExhaustionTimer > 0) && (
        <div className="w-full mb-3 p-2.5 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 font-mono text-xs flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 stroke-[2] animate-bounce" />
            <div>
              <span className="font-bold">Colapso Muscular Shinobi:</span>
              <span className="ml-1 text-[11px] text-rose-200">CPS -85% ({exhaustionTimer.toFixed(1)}s)</span>
            </div>
          </div>
          {clickExhaustionTimer > 0 && (
            <span className="px-2 py-0.5 rounded bg-rose-900/60 border border-rose-700/60 text-[10px] text-rose-200 font-bold">
              Cliques Bloqueados: {clickExhaustionTimer.toFixed(1)}s
            </span>
          )}
        </div>
      )}

      {/* 1. PALCO FOCAL DO SELO REATIVO COM ANÉIS CONCÊNTRICOS SUTIS */}
      <div
        ref={stageRef}
        onClick={handleClick}
        className={`flex-1 w-full flex flex-col items-center justify-center relative ${
          clickExhaustionTimer > 0 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
        } ${stageShaking ? 'animate-[bounce_0.2s_ease-in-out_2]' : ''}`}
      >
        {/* Anéis de Precisão Técnica */}
        <div className="absolute w-[280px] h-[280px] rounded-full border border-dashed border-zinc-800/60 animate-spin-slow pointer-events-none" />
        <div className="absolute w-[220px] h-[220px] rounded-full border border-zinc-800/40 animate-spin-reverse pointer-events-none" />

        {/* Halo Suave de Profundidade */}
        <div className="absolute w-[180px] h-[180px] rounded-full bg-orange-500/5 blur-3xl pointer-events-none" />

        {/* Botão Central Reativo de Alta Precisão */}
        <div
          id="click-btn"
          className={`group relative z-10 w-36 h-36 rounded-2xl flex flex-col items-center justify-center shadow-lg transition-all duration-150 ease-out ${
            clickExhaustionTimer > 0
              ? 'bg-rose-950/30 border border-rose-900/60'
              : 'bg-zinc-900/90 border border-zinc-800/90 hover:border-orange-500/40 hover:bg-zinc-850 active:scale-95'
          }`}
        >
          <div
            className={`w-16 h-16 rounded-xl flex items-center justify-center transition-transform ${
              clickExhaustionTimer > 0
                ? 'bg-rose-900/40 border border-rose-800 text-rose-400'
                : 'bg-zinc-800/60 border border-zinc-700/50 text-orange-400 group-hover:scale-105'
            }`}
          >
            {clickExhaustionTimer > 0 ? (
              <Skull className="w-8 h-8 stroke-[1.5]" />
            ) : (
              <Target className="w-8 h-8 stroke-[1.5]" />
            )}
          </div>
          <span className="text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-widest mt-2">
            {clickExhaustionTimer > 0 ? `Exausto (${clickExhaustionTimer.toFixed(1)}s)` : 'Canalizar'}
          </span>
        </div>

        {/* Ondas de Choque Radiais */}
        {shockwaves.map((wave) => (
          <ShockwaveItem
            key={wave.id}
            id={wave.id}
            x={wave.x}
            y={wave.y}
            isCrit={wave.isCrit}
            onRemove={removeShockwave}
          />
        ))}

        {/* Números Flutuantes */}
        {floatingNumbers.map((item) => (
          <FloatingNumberItem
            key={item.id}
            id={item.id}
            x={item.x}
            y={item.y}
            text={item.text}
            isCrit={item.isCrit}
            onRemove={removeFloatingNumber}
          />
        ))}

        {/* Badges de Status do Clique Minimalistas */}
        <div className="flex gap-2 mt-5 z-10 pointer-events-none">
          <Badge variant="chakra" icon={<Zap className="w-3 h-3 stroke-[1.75]" />}>
            +{formatBigNumber(clickPower)} / Clique
          </Badge>
          <Badge variant="neutral" icon={<Activity className="w-3 h-3 stroke-[1.75]" />}>
            Crítico: {clanNodes['sharingan_awakening'] ? '15%' : '5%'} ({clanNodes['mangekyo_sharingan_lineage'] ? '3.0x' : '2.0x'})
          </Badge>
        </div>
      </div>

      {/* 2. PAINEL DOS OITO PORTÕES INTERNOS */}
      <div className="w-full bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3.5 mt-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wide flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-orange-400 stroke-[1.75]" /> Oito Portões Internos
          </h3>
          <div>
            {exhaustionTimer > 0 ? (
              <Badge variant="danger" icon={<Skull className="w-3 h-3 stroke-[1.75]" />}>
                Exaustão: {exhaustionTimer.toFixed(1)}s (-85% CPS)
              </Badge>
            ) : gatesActiveTimer > 0 ? (
              <Badge variant="production" icon={<Flame className="w-3 h-3 stroke-[1.75]" />}>
                Ativo: {gatesActiveTimer.toFixed(1)}s ({getGatesMultiplier(gatesUnlocked)}x CPS)
              </Badge>
            ) : gatesCooldownTimer > 0 ? (
              <Badge variant="warning" icon={<Clock className="w-3 h-3 stroke-[1.75]" />}>
                Recarga: {gatesCooldownTimer.toFixed(1)}s
              </Badge>
            ) : gatesUnlocked >= 8 ? (
              <Badge variant="cyan">Abertura Completa (15x)</Badge>
            ) : (
              <span className="text-[10px] font-mono text-zinc-400">
                Próximo: {nextGate?.name}
              </span>
            )}
          </div>
        </div>

        {/* Indicadores dos 8 Portões */}
        <div className="grid grid-cols-8 gap-1 mb-3">
          {GATE_DATA.map((gate) => {
            const isUnlocked = gate.id <= gatesUnlocked;
            const isActive = gatesActiveTimer > 0 && isUnlocked;

            return (
              <div
                key={gate.id}
                title={`${gate.name} (${formatBigNumber(gate.cost)} Chakra)`}
                className={`h-7 rounded-md flex items-center justify-center text-xs font-mono font-medium transition ${
                  isActive
                    ? 'bg-rose-950/80 border border-rose-600 text-rose-200 animate-pulse'
                    : isUnlocked
                    ? 'bg-zinc-800/80 border border-zinc-700 text-zinc-100'
                    : 'bg-zinc-900/40 border border-zinc-850 text-zinc-600'
                }`}
              >
                {gate.id}
              </div>
            );
          })}
        </div>

        {/* Ações de Upgrade e Liberação dos Portões */}
        <div className="flex gap-2">
          <button
            disabled={gatesUnlocked >= 8 || !canUnlockGate}
            onClick={buyGate}
            className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition border ${
              canUnlockGate && gatesUnlocked < 8
                ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border-zinc-700 shadow-sm'
                : 'bg-zinc-900/50 border-zinc-800/80 text-zinc-500 cursor-not-allowed'
            }`}
          >
            {gatesUnlocked >= 8 ? (
              <span className="flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 stroke-[1.75]" /> Todos os 8 Abertos
              </span>
            ) : (
              `Abrir ${nextGate?.name} (${formatBigNumber(nextGate?.cost || 0)})`
            )}
          </button>

          <button
            disabled={gatesUnlocked === 0 || gatesActiveTimer > 0 || gatesCooldownTimer > 0 || exhaustionTimer > 0}
            onClick={triggerGateRelease}
            className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition flex items-center justify-center gap-1.5 border ${
              gatesUnlocked > 0 && gatesActiveTimer === 0 && gatesCooldownTimer === 0 && exhaustionTimer === 0
                ? 'bg-orange-600 hover:bg-orange-500 text-white border-orange-500 shadow-sm'
                : 'bg-zinc-900/50 border-zinc-800/80 text-zinc-500 cursor-not-allowed'
            }`}
          >
            <Zap className="w-3.5 h-3.5 stroke-[1.75]" /> Liberar Fúria ({getGatesMultiplier(gatesUnlocked)}x CPS)
          </button>
        </div>
      </div>

      {/* 3. LOG DINÂMICO DE AÇÃO */}
      <div className="w-full mt-2.5 py-1.5 px-3 bg-zinc-950/40 border border-zinc-800/60 rounded-lg text-[11px] font-mono text-zinc-400 flex items-center gap-2 flex-shrink-0">
        <ShieldAlert className="w-3.5 h-3.5 text-zinc-500 stroke-[1.75]" />
        <span className="truncate">
          {clickExhaustionTimer > 0
            ? 'Colapso muscular severo: o fluxo dos dezetsu foi interrompido por exaustão física.'
            : exhaustionTimer > 0
            ? 'Exaustão Shinobi ativa: CPS reduzido em 85% após o encerramento dos Portões.'
            : gatesActiveTimer > 0
            ? `Os Oito Portões Internos estão abertos (${getGatesMultiplier(gatesUnlocked)}x CPS). Cuidado com o colapso iminente!`
            : 'Canalize seu chakra com selos de mão para despertar novas técnicas ninjas.'}
        </span>
      </div>
    </main>
  );
};
