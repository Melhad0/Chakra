import React, { useRef } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { formatBigNumber } from '../../engine/BigNumber';
import { calculateTotalCPS, calculateClickPower } from '../../engine/formulas';
import { GATE_DATA } from '../../engine/data';
import { Flame, ShieldAlert, Zap } from 'lucide-react';

export const ActionStage: React.FC = () => {
  const chakra = useGameStore((s) => s.chakra);
  const generators = useGameStore((s) => s.generators);
  const upgrades = useGameStore((s) => s.upgrades);
  const clanNodes = useGameStore((s) => s.clanNodes);
  const gatesUnlocked = useGameStore((s) => s.gatesUnlocked);
  const gatesActiveTimer = useGameStore((s) => s.gatesActiveTimer);
  const gatesCooldownTimer = useGameStore((s) => s.gatesCooldownTimer);
  const exhaustionTimer = useGameStore((s) => s.exhaustionTimer);
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
      exhaustionTimer > 0
    );
  }, [generators, upgrades, clanNodes, gatesUnlocked, gatesActiveTimer, exhaustionTimer]);

  const clickPower = React.useMemo(() => {
    return calculateClickPower(currentCPS, upgrades, clanNodes);
  }, [currentCPS, upgrades, clanNodes]);

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
    <main className="h-full bg-shinobi-card/80 backdrop-blur-md border border-shinobi-border rounded-xl p-4 flex flex-col items-center justify-between relative overflow-hidden select-none">
      {/* 1. PALCO FOCAL DO SELO REATIVO COM ANÉIS CONCÊNTRICOS & AURA */}
      <div
        ref={stageRef}
        onClick={handleClick}
        className={`flex-1 w-full flex flex-col items-center justify-center relative cursor-pointer ${
          stageShaking ? 'animate-[bounce_0.2s_ease-in-out_2]' : ''
        }`}
      >
        {/* Anéis Concêntricos Giratórios em Velocidades Alternadas */}
        <div className="absolute w-[290px] h-[290px] rounded-full border-2 border-dashed border-chakra-water/25 animate-spin-slow pointer-events-none" />
        <div className="absolute w-[230px] h-[230px] rounded-full border-2 border-dotted border-chakra-fire/35 animate-spin-reverse pointer-events-none" />

        {/* Aura Viva em Chamas de Chakra */}
        <div className="absolute w-[190px] h-[190px] rounded-full bg-radial from-chakra-water/30 via-chakra-fire/20 to-transparent blur-xl animate-pulse-slow pointer-events-none" />

        {/* Botão Central Reativo (Squash & Stretch) */}
        <div
          id="click-btn"
          className="relative z-10 w-36 h-36 rounded-full bg-gradient-to-br from-white/15 to-black/60 border-2 border-chakra-water/70 flex items-center justify-center shadow-chakra-glow active:scale-90 transition-transform duration-100 ease-out"
        >
          <span className="text-6xl filter drop-shadow-[0_0_12px_rgba(255,255,255,0.4)] pointer-events-none">
            🤚
          </span>
        </div>

        {/* Ondas de Choque Radiais Translúcidas */}
        {shockwaves.map((wave) => (
          <div
            key={wave.id}
            onAnimationEnd={() => removeShockwave(wave.id)}
            style={{ left: `${wave.x}px`, top: `${wave.y}px` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border pointer-events-none animate-[ping_0.5s_cubic-bezier(0,0,0.2,1)_forwards] ${
              wave.isCrit
                ? 'w-24 h-24 border-chakra-gold bg-chakra-gold/20 shadow-gold-glow'
                : 'w-20 h-20 border-chakra-water bg-chakra-water/10 shadow-chakra-glow'
            }`}
          />
        ))}

        {/* Números Flutuantes Parabólicos */}
        {floatingNumbers.map((item) => (
          <div
            key={item.id}
            onAnimationEnd={() => removeFloatingNumber(item.id)}
            style={{ left: `${item.x}px`, top: `${item.y}px` }}
            className={`absolute pointer-events-none font-ninja font-black animate-[fade-up_0.8s_ease-out_forwards] -translate-x-1/2 -translate-y-1/2 ${
              item.isCrit
                ? 'text-2xl text-chakra-gold drop-shadow-[0_0_15px_#ffd700]'
                : 'text-base text-white drop-shadow-[0_0_8px_#00e5ff]'
            }`}
          >
            {item.text}
          </div>
        ))}

        {/* Badges de Status do Clique */}
        <div className="flex gap-2.5 mt-5 z-10 pointer-events-none">
          <div className="px-3 py-1 rounded-full bg-chakra-water/10 border border-chakra-water text-chakra-water text-xs font-black">
            Clique: +{formatBigNumber(clickPower)}
          </div>
          <div className="px-3 py-1 rounded-full bg-chakra-earth/10 border border-chakra-earth text-chakra-earth text-xs font-black">
            Crítico: {clanNodes['sharingan_awakening'] ? '15%' : '5%'} ({clanNodes['mangekyo_sharingan_lineage'] ? '3.0x' : '2.0x'})
          </div>
        </div>
      </div>

      {/* 2. PAINEL DOS OITO PORTÕES INTERNOS */}
      <div className="w-full bg-black/40 border border-shinobi-border rounded-lg p-3 mt-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-black text-chakra-fire uppercase flex items-center gap-1">
            <Flame className="w-3.5 h-3.5" /> Oito Portões Internos
          </h3>
          <span className="text-[11px] font-bold text-shinobi-muted">
            {exhaustionTimer > 0
              ? `💀 Exausto: ${exhaustionTimer.toFixed(1)}s`
              : gatesActiveTimer > 0
              ? `🔥 Ativo: ${gatesActiveTimer.toFixed(1)}s (+${gatesUnlocked * 150}% CPS)`
              : gatesCooldownTimer > 0
              ? `⏳ Recarga: ${gatesCooldownTimer.toFixed(1)}s`
              : gatesUnlocked >= 8
              ? 'Poder Supremo Desbloqueado'
              : `Próximo: ${nextGate?.name}`}
          </span>
        </div>

        {/* Indicadores dos 8 Portões */}
        <div className="grid grid-cols-8 gap-1.5 mb-2.5">
          {GATE_DATA.map((gate) => {
            const isUnlocked = gate.id <= gatesUnlocked;
            const isActive = gatesActiveTimer > 0 && isUnlocked;

            return (
              <div
                key={gate.id}
                title={`${gate.name} (${formatBigNumber(gate.cost)} Chakra)`}
                className={`h-7 rounded flex items-center justify-center text-xs font-black transition ${
                  isActive
                    ? 'bg-red-600 text-white shadow-fire-glow animate-pulse'
                    : isUnlocked
                    ? 'bg-chakra-fire/20 border border-chakra-fire text-white'
                    : 'bg-white/5 border border-shinobi-border text-shinobi-muted/40'
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
            className={`flex-1 py-1.5 px-3 rounded text-xs font-black transition ${
              canUnlockGate && gatesUnlocked < 8
                ? 'bg-white/10 hover:bg-white/20 border border-chakra-fire text-white'
                : 'bg-white/5 border border-shinobi-border text-shinobi-muted/50 cursor-not-allowed'
            }`}
          >
            {gatesUnlocked >= 8
              ? 'Todos os 8 Abertos 🌟'
              : `Abrir ${nextGate?.name} (${formatBigNumber(nextGate?.cost || 0)})`}
          </button>

          <button
            disabled={gatesUnlocked === 0 || gatesActiveTimer > 0 || gatesCooldownTimer > 0 || exhaustionTimer > 0}
            onClick={triggerGateRelease}
            className={`flex-1 py-1.5 px-3 rounded text-xs font-black transition flex items-center justify-center gap-1 ${
              gatesUnlocked > 0 && gatesActiveTimer === 0 && gatesCooldownTimer === 0 && exhaustionTimer === 0
                ? 'bg-gradient-to-r from-chakra-fire to-red-600 text-white shadow-fire-glow hover:scale-105'
                : 'bg-white/5 border border-shinobi-border text-shinobi-muted/50 cursor-not-allowed'
            }`}
          >
            <Zap className="w-3.5 h-3.5" /> Liberar Fúria (+{gatesUnlocked * 150}%)
          </button>
        </div>
      </div>

      {/* 3. LOG DINÂMICO DE AÇÃO */}
      <div className="w-full mt-2 py-1.5 px-3 bg-black/50 border border-shinobi-border rounded-lg text-[11px] text-shinobi-muted flex items-center gap-2 flex-shrink-0">
        <ShieldAlert className="w-3.5 h-3.5 text-chakra-water" />
        <span className="truncate">
          {exhaustionTimer > 0
            ? 'O corpo entrou em colapso devido à liberação do Portão da Morte!'
            : gatesActiveTimer > 0
            ? 'Os Portões de Chakra foram abertos! Frequência metabólica extrema ativa!'
            : 'Canalize seu chakra com selos de mão para despertar novas técnicas ninjas...'}
        </span>
      </div>
    </main>
  );
};
