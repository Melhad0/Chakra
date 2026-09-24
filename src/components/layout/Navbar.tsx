import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { formatBigNumber, toggleNotationMode, getNotationMode } from '../../engine/BigNumber';
import { calculateTotalCPS } from '../../engine/formulas';
import { usePlaytime } from '../../hooks/usePlaytime';
import { audio } from '../../engine/audio';
import { Volume2, VolumeX, Sparkles, Hash, Flame } from 'lucide-react';

export const Navbar: React.FC = () => {
  const chakra = useGameStore((s) => s.chakra);
  const chakraAncestral = useGameStore((s) => s.chakraAncestral);
  const generators = useGameStore((s) => s.generators);
  const upgrades = useGameStore((s) => s.upgrades);
  const clanNodes = useGameStore((s) => s.clanNodes);
  const gatesUnlocked = useGameStore((s) => s.gatesUnlocked);
  const gatesActiveTimer = useGameStore((s) => s.gatesActiveTimer);
  const exhaustionTimer = useGameStore((s) => s.exhaustionTimer);
  const kineticMode = useGameStore((s) => s.kineticMode);
  const toggleKinetic = useGameStore((s) => s.toggleKineticMode);

  const { rewardCountdown } = usePlaytime();

  const [isMuted, setIsMuted] = React.useState(audio.isMuted());
  const [notation, setNotation] = React.useState(getNotationMode());

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

  const handleToggleMute = () => {
    const muted = audio.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleNotation = () => {
    const next = toggleNotationMode();
    setNotation(next);
  };

  return (
    <header className="h-16 px-4 bg-shinobi-card/95 backdrop-blur-md border-b border-shinobi-border hover:border-shinobi-border-orange/30 transition-colors flex items-center justify-between z-30 select-none shadow-lg">
      {/* Logo & Marca */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-chakra-fire via-chakra-orange to-chakra-amber flex items-center justify-center shadow-orange-glow text-lg">
          🌀
        </div>
        <div>
          <h1 className="text-base font-black tracking-wider text-white">CHAKRA CLICKER</h1>
          <span className="text-[10px] font-bold tracking-widest text-chakra-orange uppercase block -mt-1">
            Cockpit Shinobi • Estilo Kurama
          </span>
        </div>
      </div>

      {/* Métricas Principais (HUD Central) */}
      <div className="hidden md:flex items-center gap-4">
        {/* Chakra Acumulado */}
        <div className="bg-glass-card border border-shinobi-border hover:border-chakra-orange/40 transition-colors px-3.5 py-1.5 rounded-lg text-center min-w-[130px]">
          <span className="text-[10px] font-bold text-shinobi-muted tracking-wider block">CHAKRA TOTAL</span>
          <span className="text-sm font-black text-chakra-orange tracking-tight drop-shadow-[0_0_8px_rgba(255,107,0,0.5)]">
            {formatBigNumber(chakra)}
          </span>
        </div>

        {/* Produção Passiva (CPS) */}
        <div className="bg-glass-card border border-shinobi-border hover:border-chakra-amber/40 transition-colors px-3.5 py-1.5 rounded-lg text-center min-w-[130px]">
          <span className="text-[10px] font-bold text-shinobi-muted tracking-wider block">PRODUÇÃO PASSIVA</span>
          <span className="text-sm font-black text-chakra-amber tracking-tight">
            +{formatBigNumber(currentCPS)} CPS
          </span>
        </div>

        {/* Chakra Ancestral */}
        <div className="bg-glass-card border border-shinobi-border px-3.5 py-1.5 rounded-lg text-center min-w-[120px]">
          <span className="text-[10px] font-bold text-shinobi-muted tracking-wider block">ANCESTRAL</span>
          <span className="text-sm font-black text-chakra-gold tracking-tight">
            {chakraAncestral.toString()}
          </span>
        </div>

        {/* Patamar Shinobi */}
        <div className="bg-glass-card border border-shinobi-border px-3.5 py-1.5 rounded-lg text-center min-w-[110px]">
          <span className="text-[10px] font-bold text-shinobi-muted tracking-wider block">PATAMAR</span>
          <span className="text-sm font-black text-chakra-gold tracking-tight flex items-center justify-center gap-1">
            <Flame className="w-3.5 h-3.5 text-chakra-orange inline" />
            {gatesUnlocked >= 8 ? 'Rikudou' : gatesUnlocked >= 4 ? 'Jōnin' : 'Gennin'}
          </span>
        </div>
      </div>

      {/* Controles Rápidos do Cockpit */}
      <div className="flex items-center gap-2">
        {/* Cronômetro de Presença */}
        <div
          title="Recompensa de Presença Online"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-glass-card border border-chakra-orange/40 rounded-full text-xs font-bold text-chakra-orange"
        >
          <span>⏳</span>
          <span>{rewardCountdown}</span>
        </div>

        {/* Alternador de Som */}
        <button
          onClick={handleToggleMute}
          title={isMuted ? 'Ativar Som' : 'Desativar Som'}
          className="p-2 rounded-lg bg-glass-card border border-shinobi-border hover:border-chakra-orange/60 text-shinobi-muted hover:text-white transition"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-chakra-orange" />}
        </button>

        {/* Alternador de Notação Numérica */}
        <button
          onClick={handleToggleNotation}
          title={`Notação atual: ${notation === 'suffix' ? 'Sufixos (K, M, B)' : 'Científica (1e15)'}`}
          className="p-2 rounded-lg bg-glass-card border border-shinobi-border hover:border-chakra-orange/60 text-shinobi-muted hover:text-white transition flex items-center gap-1 text-xs font-bold"
        >
          <Hash className="w-4 h-4 text-chakra-gold" />
        </button>

        {/* Alternador de Modo Cinético (60 FPS) */}
        <button
          onClick={toggleKinetic}
          title={kineticMode ? 'Modo Cinético Total (60 FPS)' : 'Modo Econômico'}
          className={`p-2 rounded-lg border transition ${
            kineticMode
              ? 'bg-chakra-orange/20 border-chakra-orange text-chakra-orange shadow-orange-glow'
              : 'bg-glass-card border-shinobi-border text-shinobi-muted'
          }`}
        >
          <Sparkles className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
