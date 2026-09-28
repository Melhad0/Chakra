import React, { useRef } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { formatBigNumber } from '../../engine/BigNumber';
import { calculateTotalCPS, calculateClickPower, getGatesMultiplier } from '../../engine/formulas';
import {
  Flame,
  ShieldAlert,
  Zap,
  Target,
  Activity,
  Skull,
  AlertTriangle,
  PanelRightClose,
  PanelRightOpen,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { ClickStageBackground } from './ClickStageBackground';
import { EightGatesSidebar } from './EightGatesSidebar';

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
  const generators = useGameStore((s) => s.generators);
  const upgrades = useGameStore((s) => s.upgrades);
  const clanNodes = useGameStore((s) => s.clanNodes);
  const gatesUnlocked = useGameStore((s) => s.gatesUnlocked);
  const gatesActiveTimer = useGameStore((s) => s.gatesActiveTimer);
  const gatesCooldownTimer = useGameStore((s) => s.gatesCooldownTimer);
  const exhaustionTimer = useGameStore((s) => s.exhaustionTimer);
  const clickExhaustionTimer = useGameStore((s) => s.clickExhaustionTimer);
  const onlinePresenceBuffTimer = useGameStore((s) => s.onlinePresenceBuffTimer);
  const floatingNumbers = useGameStore((s) => s.floatingNumbers);
  const shockwaves = useGameStore((s) => s.shockwaves);
  
  // Controles de Sidebars
  const isEightGatesSidebarOpen = useGameStore((s) => s.isEightGatesSidebarOpen);
  const toggleEightGatesSidebar = useGameStore((s) => s.toggleEightGatesSidebar);
  const isLeftSidebarOpen = useGameStore((s) => s.isLeftSidebarOpen);
  const toggleLeftSidebar = useGameStore((s) => s.toggleLeftSidebar);
  const isRightSidebarOpen = useGameStore((s) => s.isRightSidebarOpen);
  const toggleRightSidebar = useGameStore((s) => s.toggleRightSidebar);

  const clickChakra = useGameStore((s) => s.clickChakra);
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

  const gatesMultiplier = getGatesMultiplier(gatesUnlocked);

  return (
    <main className="h-full bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 hover:border-zinc-700/80 transition-colors rounded-xl p-3 sm:p-3.5 flex flex-col justify-between relative overflow-hidden select-none shadow-sm">
      {/* ALERTA DE EXAUSTÃO MUSCULAR SEVERA */}
      {(exhaustionTimer > 0 || clickExhaustionTimer > 0) && (
        <div className="w-full mb-2 p-2 sm:p-2.5 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 font-mono text-xs flex items-center justify-between z-20 flex-shrink-0 animate-in fade-in duration-200">
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

      {/* BARRA SUPERIOR DE CONTROLE & TOGGLES DE TODAS AS SIDEBARS */}
      <div className="w-full mb-2 flex items-center justify-between gap-2 flex-shrink-0">
        {/* Lado Esquerdo: Sidebar Toggle da Esquerda (Tropas) + Badges de Clique */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={toggleLeftSidebar}
            title={isLeftSidebarOpen ? 'Recolher Painel de Tropas & Upgrades' : 'Expandir Painel de Tropas & Upgrades'}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-1.5 border cursor-pointer ${
              isLeftSidebarOpen
                ? 'bg-zinc-900/60 hover:bg-zinc-800/80 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                : 'bg-cyan-500/15 hover:bg-cyan-500/25 border-cyan-500/50 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
            }`}
          >
            {isLeftSidebarOpen ? (
              <PanelLeftClose className="w-3.5 h-3.5 stroke-[2]" />
            ) : (
              <PanelLeftOpen className="w-3.5 h-3.5 stroke-[2] text-cyan-400" />
            )}
            <span className="font-semibold hidden md:inline">
              {isLeftSidebarOpen ? 'Tropas' : 'Abrir Tropas'}
            </span>
          </button>

          <Badge variant="chakra" icon={<Zap className="w-3 h-3 stroke-[1.75]" />}>
            +{formatBigNumber(clickPower)} / Clique
          </Badge>
          <Badge variant="neutral" icon={<Activity className="w-3 h-3 stroke-[1.75]" />}>
            Crítico: {clanNodes['sharingan_awakening'] ? '15%' : '5%'}
          </Badge>
        </div>

        {/* Lado Direito: Sidebar Toggle dos Oito Portões + Sidebar Toggle da Direita (Operações) */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* SIDEBAR TOGGLE: SISTEMA DOS OITO PORTÕES */}
          <button
            onClick={toggleEightGatesSidebar}
            title={isEightGatesSidebarOpen ? 'Recolher Painel dos Oito Portões' : 'Abrir Painel dos Oito Portões'}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-2 border cursor-pointer ${
              gatesActiveTimer > 0
                ? 'bg-rose-950/60 border-rose-500 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse'
                : isEightGatesSidebarOpen
                ? 'bg-orange-500/20 border-orange-500/50 text-orange-300 shadow-[0_0_12px_rgba(249,115,22,0.15)]'
                : 'bg-zinc-900/80 hover:bg-zinc-850 border-zinc-800 hover:border-orange-500/40 text-zinc-300'
            }`}
          >
            <Flame
              className={`w-3.5 h-3.5 stroke-[2] ${
                gatesActiveTimer > 0 ? 'text-rose-400 animate-bounce' : 'text-orange-400'
              }`}
            />
            <span className="font-semibold hidden sm:inline">Oito Portões</span>

            {gatesActiveTimer > 0 ? (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-900/70 text-rose-200 border border-rose-600/60 font-bold">
                {gatesActiveTimer.toFixed(1)}s ({gatesMultiplier}x)
              </span>
            ) : gatesCooldownTimer > 0 ? (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40 font-bold">
                {gatesCooldownTimer.toFixed(1)}s
              </span>
            ) : exhaustionTimer > 0 ? (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-950/60 text-rose-300 border border-rose-800/40 font-bold">
                Exausto
              </span>
            ) : (
              <span className="text-[10px] text-zinc-500 font-mono">
                ({gatesUnlocked}/8)
              </span>
            )}

            {isEightGatesSidebarOpen ? (
              <PanelRightClose className="w-3.5 h-3.5 text-orange-400 stroke-[2]" />
            ) : (
              <PanelRightOpen className="w-3.5 h-3.5 text-zinc-400 stroke-[2]" />
            )}
          </button>

          {/* SIDEBAR TOGGLE: CENTRAL DE OPERAÇÕES (DIREITA) */}
          <button
            onClick={toggleRightSidebar}
            title={isRightSidebarOpen ? 'Recolher Central de Operações' : 'Expandir Central de Operações'}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-1.5 border cursor-pointer ${
              isRightSidebarOpen
                ? 'bg-zinc-900/60 hover:bg-zinc-800/80 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                : 'bg-purple-500/15 hover:bg-purple-500/25 border-purple-500/50 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
            }`}
          >
            <span className="font-semibold hidden md:inline">
              {isRightSidebarOpen ? 'Operações' : 'Abrir Operações'}
            </span>
            {isRightSidebarOpen ? (
              <PanelRightClose className="w-3.5 h-3.5 stroke-[2]" />
            ) : (
              <PanelRightOpen className="w-3.5 h-3.5 stroke-[2] text-purple-400" />
            )}
          </button>
        </div>
      </div>

      {/* ÁREA CENTRAL: BOXE PRINCIPAL DO SELO + SIDEBAR DOS OITO PORTÕES */}
      <div className="flex-1 w-full flex flex-row gap-3 min-h-0 overflow-hidden relative">
        {/* ABAS FLUTUANTES NAS BORDAS QUANDO AS SIDEBARS ESTIVEREM RECOLHIDAS */}
        {!isLeftSidebarOpen && (
          <button
            onClick={toggleLeftSidebar}
            title="Expandir Painel de Tropas & Upgrades (Sidebar Toggle)"
            className="absolute left-1.5 top-1/2 -translate-y-1/2 z-30 px-1.5 py-3 rounded-r-xl bg-zinc-900/90 hover:bg-zinc-850 border border-l-0 border-zinc-700/80 hover:border-cyan-500/60 text-zinc-400 hover:text-cyan-300 shadow-2xl backdrop-blur-md transition-all flex flex-col items-center gap-1.5 cursor-pointer group"
          >
            <PanelLeftOpen className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-mono [writing-mode:vertical-lr] tracking-widest text-zinc-400 group-hover:text-cyan-300 font-bold uppercase">
              Tropas
            </span>
          </button>
        )}

        {!isRightSidebarOpen && (
          <button
            onClick={toggleRightSidebar}
            title="Expandir Central de Operações Shinobi (Sidebar Toggle)"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 z-30 px-1.5 py-3 rounded-l-xl bg-zinc-900/90 hover:bg-zinc-850 border border-r-0 border-zinc-700/80 hover:border-purple-500/60 text-zinc-400 hover:text-purple-300 shadow-2xl backdrop-blur-md transition-all flex flex-col items-center gap-1.5 cursor-pointer group"
          >
            <PanelRightOpen className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-mono [writing-mode:vertical-lr] tracking-widest text-zinc-400 group-hover:text-purple-300 font-bold uppercase">
              Operações
            </span>
          </button>
        )}

        {/* BOXE PRINCIPAL (PALCO DO SELO) - ADAPTA DINAMICAMENTE EM LARGURA E ALTURA */}
        <div
          ref={stageRef}
          onClick={handleClick}
          className={`flex-1 h-full relative rounded-2xl overflow-hidden border border-zinc-800/80 bg-zinc-950/90 flex flex-col items-center justify-center shadow-inner group/stage select-none transition-all duration-300 ease-in-out ${
            clickExhaustionTimer > 0 ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
          }`}
        >
          {/* Fundo Animado Cenográfico: Floresta da Folha & Vale do Fim */}
          <ClickStageBackground clickExhaustion={clickExhaustionTimer > 0} />

          {/* Anéis de Precisão Técnica */}
          <div className="absolute w-[280px] h-[280px] rounded-full border border-dashed border-zinc-800/60 animate-spin-slow pointer-events-none z-10" />
          <div className="absolute w-[220px] h-[220px] rounded-full border border-zinc-800/40 animate-spin-reverse pointer-events-none z-10" />

          {/* Halo Suave de Profundidade */}
          <div className="absolute w-[180px] h-[180px] rounded-full bg-orange-500/5 blur-3xl pointer-events-none z-10" />

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
        </div>

        {/* SIDEBAR DOS OITO PORTÕES INTERNOS */}
        {isEightGatesSidebarOpen && <EightGatesSidebar />}
      </div>

      {/* 3. LOG DINÂMICO DE AÇÃO (SLIM FOOTER) */}
      <div className="w-full mt-2 py-1.5 px-3 bg-zinc-950/40 border border-zinc-800/60 rounded-lg text-[11px] font-mono text-zinc-400 flex items-center gap-2 flex-shrink-0">
        <ShieldAlert className="w-3.5 h-3.5 text-zinc-500 stroke-[1.75]" />
        <span className="truncate">
          {clickExhaustionTimer > 0
            ? 'Colapso muscular severo: o fluxo dos dezetsu foi interrompido por exaustão física.'
            : exhaustionTimer > 0
            ? 'Exaustão Shinobi ativa: CPS reduzido em 85% após o encerramento dos Portões.'
            : gatesActiveTimer > 0
            ? `Os Oito Portões Internos estão abertos (${gatesMultiplier}x CPS). Cuidado com o colapso iminente!`
            : 'Canalize seu chakra com selos de mão para despertar novas técnicas ninjas.'}
        </span>
      </div>
    </main>
  );
};
