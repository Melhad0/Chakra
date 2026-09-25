import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { formatBigNumber, toggleNotationMode, getNotationMode } from '../../engine/BigNumber';
import { calculateTotalCPS } from '../../engine/formulas';
import { usePlaytime } from '../../hooks/usePlaytime';
import { audio } from '../../engine/audio';
import { Volume2, VolumeX, Sparkles, Hash, Flame, SunMedium, User, ShieldCheck, LogOut, Gift, AlertTriangle, Swords, Clock, Scroll, Briefcase } from 'lucide-react';
import { Badge } from '../common/Badge';

export const Navbar: React.FC = () => {
  const setView = useGameStore((s) => s.setView);
  const gauntlet = useGameStore((s) => s.gauntlet);
  const activeMission = useGameStore((s) => s.activeMission);
  const currentUser = useGameStore((s) => s.currentUser);
  const openAuthModal = useGameStore((s) => s.openAuthModal);
  const logout = useGameStore((s) => s.logout);
  const chakra = useGameStore((s) => s.chakra);
  const chakraAncestral = useGameStore((s) => s.chakraAncestral);
  const generators = useGameStore((s) => s.generators);
  const upgrades = useGameStore((s) => s.upgrades);
  const clanNodes = useGameStore((s) => s.clanNodes);
  const gatesUnlocked = useGameStore((s) => s.gatesUnlocked);
  const gatesActiveTimer = useGameStore((s) => s.gatesActiveTimer);
  const exhaustionTimer = useGameStore((s) => s.exhaustionTimer);
  const onlinePresenceBuffTimer = useGameStore((s) => s.onlinePresenceBuffTimer);
  const openOnlineRewardModal = useGameStore((s) => s.openOnlineRewardModal);
  const kineticMode = useGameStore((s) => s.kineticMode);
  const toggleKinetic = useGameStore((s) => s.toggleKineticMode);
  const inventory = useGameStore((s) => s.inventory);
  const missionPermanentCpsMult = useGameStore((s) => s.missionPermanentCpsMult);
  const missionBuffTimer = useGameStore((s) => s.missionBuffTimer);
  const missionBuffMult = useGameStore((s) => s.missionBuffMult);

  const { rewardCountdown } = usePlaytime();

  const [isMuted, setIsMuted] = React.useState(audio.isMuted());
  const [notation, setNotation] = React.useState(getNotationMode());
  const [cooldownRemaining, setCooldownRemaining] = React.useState<number>(0);

  React.useEffect(() => {
    const updateCooldown = () => {
      if (gauntlet.cooldownExpiresAt && gauntlet.cooldownExpiresAt > Date.now()) {
        const remaining = Math.max(0, Math.ceil((gauntlet.cooldownExpiresAt - Date.now()) / 1000));
        setCooldownRemaining(remaining);
      } else {
        setCooldownRemaining(0);
      }
    };
    updateCooldown();
    const interval = setInterval(updateCooldown, 1000);
    return () => clearInterval(interval);
  }, [gauntlet.cooldownExpiresAt]);

  const currentCPS = React.useMemo(() => {
    const missionMult = missionPermanentCpsMult * (missionBuffTimer > 0 ? missionBuffMult : 1);
    return calculateTotalCPS(
      generators,
      upgrades,
      clanNodes,
      gatesUnlocked,
      gatesActiveTimer > 0,
      exhaustionTimer > 0,
      {},
      onlinePresenceBuffTimer > 0,
      missionMult,
      inventory?.equippedArmor,
      inventory?.equippedWeapon,
      inventory?.unlockedElements,
      inventory?.elementalSacrificePenaltyMult,
      inventory?.isAvatarShinobi
    );
  }, [
    generators,
    upgrades,
    clanNodes,
    gatesUnlocked,
    gatesActiveTimer,
    exhaustionTimer,
    onlinePresenceBuffTimer,
    missionPermanentCpsMult,
    missionBuffTimer,
    missionBuffMult,
    inventory,
  ]);

  const handleToggleMute = () => {
    const muted = audio.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleNotation = () => {
    const next = toggleNotationMode();
    setNotation(next);
  };

  const rankName = gatesUnlocked >= 8 ? 'Rikudou' : gatesUnlocked >= 4 ? 'Jōnin' : 'Gennin';

  return (
    <header className="h-16 px-4 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 flex items-center justify-between z-30 select-none shadow-sm">
      {/* Logo & Marca Minimalista */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-orange-400">
          <SunMedium className="w-5 h-5 stroke-[1.75]" />
        </div>
        <div>
          <h1 className="text-xs font-semibold tracking-wider text-zinc-100 uppercase">
            Chakra Clicker
          </h1>
          <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase block">
            Cockpit Shinobi • v2.0
          </span>
        </div>
      </div>

      {/* Métricas Principais (HUD Central de Precisão) */}
      <div className="hidden md:flex items-center gap-3">
        {/* Chakra Acumulado */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 px-3.5 py-1.5 rounded-lg text-center min-w-[130px]">
          <span className="text-[10px] font-semibold tracking-widest text-zinc-400 uppercase block">
            Chakra Total
          </span>
          <span className="text-sm font-mono tracking-tight text-orange-400 font-medium">
            {formatBigNumber(chakra)}
          </span>
        </div>

        {/* Produção Passiva (CPS) */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 px-3.5 py-1.5 rounded-lg text-center min-w-[130px]">
          <span className="text-[10px] font-semibold tracking-widest text-zinc-400 uppercase block">
            Produção / Seg
          </span>
          <span className="text-sm font-mono tracking-tight text-emerald-400 font-medium">
            +{formatBigNumber(currentCPS)}
          </span>
        </div>

        {/* Chakra Ancestral */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 px-3.5 py-1.5 rounded-lg text-center min-w-[120px]">
          <span className="text-[10px] font-semibold tracking-widest text-zinc-400 uppercase block">
            Ancestral
          </span>
          <span className="text-sm font-mono tracking-tight text-amber-300 font-medium">
            {chakraAncestral.toString()}
          </span>
        </div>

        {/* Patamar Shinobi */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 px-3 py-1.5 rounded-lg text-center min-w-[110px] flex flex-col items-center justify-center">
          <span className="text-[10px] font-semibold tracking-widest text-zinc-400 uppercase block mb-0.5">
            Patamar
          </span>
          <Badge
            variant={gatesUnlocked >= 8 ? 'danger' : gatesUnlocked >= 4 ? 'cyan' : 'neutral'}
            icon={<Flame className="w-3 h-3 stroke-[1.75]" />}
          >
            {rankName}
          </Badge>
        </div>

        {/* Indicador de Exaustão no HUD Central */}
        {exhaustionTimer > 0 && (
          <div className="bg-rose-950/40 border border-rose-800/80 px-3 py-1.5 rounded-lg text-center min-w-[120px] flex items-center justify-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 stroke-[2] animate-pulse" />
            <span className="text-[11px] font-mono text-rose-300 font-bold">
              Exaustão {exhaustionTimer.toFixed(0)}s
            </span>
          </div>
        )}
      </div>

      {/* Controles Rápidos do Cockpit */}
      <div className="flex items-center gap-2">
        {/* Ponto de Entrada Único: Arena de Desafios (Boss Gauntlet) */}
        <button
          onClick={() => setView('CHALLENGES')}
          title="Abrir Arena de Desafios (Gauntlet)"
          className={`flex items-center gap-2 px-3 py-1 rounded-lg border transition shadow-sm font-mono text-xs cursor-pointer ${
            cooldownRemaining > 0
              ? 'bg-zinc-900/90 border-amber-800/60 text-amber-300 hover:border-amber-600'
              : 'bg-rose-950/40 hover:bg-rose-900/60 border-rose-800/60 hover:border-rose-500 text-rose-200'
          }`}
        >
          <Swords className="w-3.5 h-3.5 text-rose-400 stroke-[2]" />
          <span className="font-semibold hidden sm:inline">Desafios</span>
          <span className="px-1.5 py-0.5 rounded bg-zinc-950/70 text-[10px] text-zinc-300 border border-zinc-800 font-mono">
            #{gauntlet.currentActiveBossId}
          </span>
          {cooldownRemaining > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-amber-400 font-bold bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/50">
              <Clock className="w-2.5 h-2.5 animate-spin" />
              {cooldownRemaining}s
            </span>
          )}
        </button>

        {/* Ponto de Entrada: Quadro de Missões Shinobi (Ranks E a SS) */}
        <button
          onClick={() => setView('MISSIONS')}
          title="Abrir Quadro Oficial de Missões Shinobi (Ranks E a SS)"
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border transition shadow-sm font-mono text-xs cursor-pointer ${
            activeMission.activeMissionId && activeMission.resolvesAt && Date.now() >= activeMission.resolvesAt
              ? 'bg-emerald-950/60 border-emerald-500/70 text-emerald-300 animate-pulse'
              : activeMission.activeMissionId
              ? 'bg-zinc-900 border-amber-800/60 text-amber-300'
              : 'bg-zinc-900/60 hover:bg-zinc-800/80 border-zinc-800 hover:border-zinc-700 text-zinc-300'
          }`}
        >
          <Scroll className="w-3.5 h-3.5 text-amber-400 stroke-[1.75]" />
          <span className="font-semibold hidden sm:inline">Missões</span>
          {activeMission.activeMissionId && activeMission.resolvesAt && Date.now() >= activeMission.resolvesAt ? (
            <span className="px-1.5 py-0.5 rounded bg-emerald-900/80 text-[10px] text-emerald-200 border border-emerald-700">
              Pronto!
            </span>
          ) : activeMission.activeMissionId ? (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          ) : null}
        </button>

        {/* Ponto de Entrada: Inventário RPG & Equipamentos Shinobi */}
        <button
          onClick={() => setView('INVENTORY')}
          title="Abrir Inventário RPG, Equipamentos Canônicos e Roda Elemental"
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg border transition shadow-sm font-mono text-xs cursor-pointer bg-zinc-900/60 hover:bg-zinc-800/80 border-zinc-800 hover:border-cyan-500/50 text-zinc-300"
        >
          <Briefcase className="w-3.5 h-3.5 text-cyan-400 stroke-[1.75]" />
          <span className="font-semibold hidden sm:inline">Inventário</span>
          <span className="px-1.5 py-0.5 rounded bg-zinc-950/70 text-[10px] text-zinc-400 border border-zinc-800 font-mono">
            {inventory ? inventory.inventoryBag.filter(Boolean).length : 0}/32
          </span>
        </button>

        {/* Identificação Shinobi / Botão de Acesso */}
        {currentUser ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={openAuthModal}
              title="Visualizar Registro e Perfil Shinobi"
              className="flex items-center gap-2 px-2.5 py-1 bg-zinc-900/80 hover:bg-zinc-800/80 border border-cyan-500/30 hover:border-cyan-500/60 rounded-lg text-xs font-mono transition shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 stroke-[2]" />
              <span className="text-zinc-200 font-semibold max-w-[110px] truncate hidden sm:inline">
                {currentUser.fullName.split(' ')[0]}
              </span>
              <span className="text-cyan-400 font-bold">#{currentUser.ninjaId}</span>
            </button>
            <button
              onClick={logout}
              title="Encerrar Sessão (Voltar para Login)"
              className="p-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800 hover:border-rose-900/60 text-zinc-400 hover:text-rose-400 transition"
            >
              <LogOut className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>
          </div>
        ) : (
          <button
            onClick={openAuthModal}
            title="Acessar Selo ou Cadastrar Shinobi"
            className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 text-xs font-semibold tracking-wider uppercase rounded-lg transition"
          >
            <User className="w-3.5 h-3.5 stroke-[2]" />
            <span>Acessar Selo</span>
          </button>
        )}

        {/* Temporizador de Presença (Abre Modal de Recompensas) */}
        <button
          onClick={openOnlineRewardModal}
          title="Abrir Provisões de Presença Shinobi"
          className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 hover:border-amber-600/50 text-[11px] font-mono text-zinc-300 rounded-md transition cursor-pointer"
        >
          <Gift className="w-3.5 h-3.5 stroke-[1.75] text-amber-400" />
          <span className="hidden sm:inline">Provisões</span>
          <span className="text-zinc-500 font-normal">({rewardCountdown})</span>
          {onlinePresenceBuffTimer > 0 && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          )}
        </button>

        {/* Alternador de Som */}
        <button
          onClick={handleToggleMute}
          title={isMuted ? 'Ativar Som' : 'Desativar Som'}
          className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400 stroke-[1.75]" /> : <Volume2 className="w-4 h-4 text-zinc-300 stroke-[1.75]" />}
        </button>

        {/* Alternador de Notação Numérica */}
        <button
          onClick={handleToggleNotation}
          title={`Notação atual: ${notation === 'suffix' ? 'Sufixos (K, M, B)' : 'Científica (1e15)'}`}
          className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition flex items-center gap-1 text-xs font-mono font-medium"
        >
          <Hash className="w-4 h-4 stroke-[1.75] text-zinc-400" />
        </button>

        {/* Alternador de Modo Cinético */}
        <button
          onClick={toggleKinetic}
          title={kineticMode ? 'Modo Cinético Total (60 FPS)' : 'Modo Econômico'}
          className={`p-2 rounded-lg border transition ${
            kineticMode
              ? 'bg-zinc-800 text-orange-400 border-zinc-700'
              : 'bg-zinc-900/60 border-zinc-800 text-zinc-500'
          }`}
        >
          <Sparkles className="w-4 h-4 stroke-[1.75]" />
        </button>
      </div>
    </header>
  );
};
