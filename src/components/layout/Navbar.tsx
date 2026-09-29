import React, { useState, useMemo } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { formatBigNumber, toggleNotationMode, getNotationMode } from '../../engine/BigNumber';
import { calculateTotalCPS } from '../../engine/formulas';
import { usePlaytime } from '../../hooks/usePlaytime';
import { audio } from '../../engine/audio';
import {
  Volume2,
  VolumeX,
  Sparkles,
  Hash,
  SunMedium,
  User,
  LogOut,
  Gift,
  AlertTriangle,
  Cloud,
  CloudOff,
  RefreshCw,
  MessageSquare,
} from 'lucide-react';
import { getAvatarById, getFrameById } from '../../constants/profileCustomization';

export const Navbar: React.FC = () => {
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
  const isCloudSyncing = useGameStore((s) => s.isCloudSyncing);
  const cloudSyncStatus = useGameStore((s) => s.cloudSyncStatus);
  const saveGame = useGameStore((s) => s.saveGame);
  const isChatOpen = useGameStore((s) => s.isChatOpen);
  const toggleChat = useGameStore((s) => s.toggleChat);

  const { rewardCountdown, readyToClaimCount } = usePlaytime();

  const [isMuted, setIsMuted] = useState(audio.isMuted());
  const [notation, setNotation] = useState(getNotationMode());

  const currentCPS = useMemo(() => {
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



  return (
    <header className="h-14 px-4 bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/80 flex items-center justify-between z-30 select-none shadow-sm relative">
      {/* 1. Logo & Identidade Shinobi */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.15)]">
          <SunMedium className="w-4 h-4 stroke-[2]" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <h1 className="text-xs font-bold tracking-wider text-zinc-100 uppercase">
            Chakra Clicker
          </h1>
          <span className="text-[9px] font-mono text-zinc-500 uppercase">
            v2.0
          </span>
        </div>
      </div>

      {/* 2. HUD Central Minimalista & Fluido */}
      <div className="hidden md:flex items-center gap-2">
        <div className="flex items-center bg-zinc-900/60 border border-zinc-800/80 rounded-xl px-3 py-1 gap-3.5 shadow-inner">
          {/* Chakra Atual */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-medium text-zinc-400 uppercase">Chakra:</span>
            <span className="text-xs font-mono font-bold text-orange-400 tracking-tight">
              {formatBigNumber(chakra)}
            </span>
          </div>

          <div className="h-3 w-px bg-zinc-800" />

          {/* Produção Passiva (CPS) */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-medium text-zinc-400 uppercase">CPS:</span>
            <span className="text-xs font-mono font-bold text-emerald-400 tracking-tight">
              +{formatBigNumber(currentCPS)}
            </span>
          </div>

          {/* Chakra Ancestral (visível apenas se > 0) */}
          {chakraAncestral.gt(0) && (
            <>
              <div className="h-3 w-px bg-zinc-800" />
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-medium text-purple-400 uppercase">Ancestral:</span>
                <span className="text-xs font-mono font-bold text-purple-300 tracking-tight">
                  {chakraAncestral.toString()}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Indicador de Exaustão (aparece dinamicamente se ativo) */}
        {exhaustionTimer > 0 && (
          <div className="bg-rose-950/60 border border-rose-800/80 px-2 py-1 rounded-xl flex items-center gap-1.5 text-rose-300 text-[10px] font-mono font-bold animate-pulse">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            <span>{exhaustionTimer.toFixed(0)}s</span>
          </div>
        )}
      </div>

      {/* 3. Controles */}
      <div className="flex items-center gap-2">

        {/* Provisões de Presença */}
        <button
          onClick={openOnlineRewardModal}
          title="Abrir Provisões de Presença Shinobi"
          className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition cursor-pointer border text-xs font-mono ${
            readyToClaimCount > 0
              ? 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/50 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
              : 'bg-zinc-900/60 hover:bg-zinc-800/80 border-zinc-800 hover:border-zinc-700 text-zinc-300'
          }`}
        >
          <Gift
            className={`w-3.5 h-3.5 stroke-[1.75] ${
              readyToClaimCount > 0 ? 'text-amber-400 animate-bounce' : 'text-amber-400'
            }`}
          />
          <span className="hidden lg:inline">Provisões</span>
          <span className={readyToClaimCount > 0 ? 'text-amber-300 font-semibold' : 'text-zinc-500'}>
            ({rewardCountdown})
          </span>
          {readyToClaimCount > 0 && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
          )}
        </button>

        {/* Botão de Chat da Aldeia */}
        <button
          onClick={toggleChat}
          title="Abrir Chat Shinobi da Aldeia da Folha"
          className={`relative p-2 rounded-xl border transition cursor-pointer ${
            isChatOpen
              ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
              : 'bg-zinc-900/60 hover:bg-zinc-850 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-amber-300'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 stroke-[1.75]" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </button>

        {/* Micro-Toolbar de Preferências (Som, Notação, Cinético) */}
        <div className="hidden sm:flex items-center bg-zinc-900/60 border border-zinc-800 rounded-xl p-0.5 gap-0.5">
          {/* Som */}
          <button
            onClick={handleToggleMute}
            title={isMuted ? 'Ativar Som' : 'Desativar Som'}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-zinc-300" />
            )}
          </button>

          {/* Notação Numérica */}
          <button
            onClick={handleToggleNotation}
            title={`Notação: ${notation === 'suffix' ? 'Sufixos (K, M, B)' : 'Científica (1e15)'}`}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
          >
            <Hash className="w-3.5 h-3.5" />
          </button>

          {/* Modo Cinético */}
          <button
            onClick={toggleKinetic}
            title={kineticMode ? 'Modo Cinético Ativo' : 'Modo Econômico'}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              kineticMode
                ? 'text-orange-400 bg-zinc-800/90'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Perfil Shinobi & Salvar Nuvem */}
        {currentUser ? (
          <div className="flex items-center gap-1.5">
            {(() => {
              const navAvatar = getAvatarById(currentUser.avatar);
              const navFrame = getFrameById(currentUser.avatarFrame);
              return (
                <button
                  onClick={openAuthModal}
                  title="Perfil Shinobi"
                  className="flex items-center gap-1.5 px-2 py-1 bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800 hover:border-cyan-500/60 rounded-xl text-xs font-mono transition shadow-sm group cursor-pointer"
                >
                  <div
                    className={`w-5 h-5 rounded-md bg-gradient-to-br ${navAvatar.bgGradient} border ${navFrame.borderClass} flex items-center justify-center text-[10px] relative flex-shrink-0 shadow-sm`}
                  >
                    <span>{navAvatar.emojiIcon}</span>
                  </div>
                  <span className="text-zinc-200 font-semibold max-w-[80px] truncate hidden md:inline group-hover:text-cyan-300 transition-colors">
                    {currentUser.fullName.split(' ')[0]}
                  </span>
                  <span className="text-cyan-400 font-bold hidden sm:inline">#{currentUser.ninjaId}</span>
                </button>
              );
            })()}

            {currentUser.username !== 'convidado' && (
              <button
                onClick={() => saveGame()}
                title={
                  isCloudSyncing
                    ? 'Salvando no Neon Postgres...'
                    : cloudSyncStatus === 'synced'
                    ? 'Salvo no Neon Postgres'
                    : 'Salvo localmente (Clique para sincronizar)'
                }
                className={`flex items-center gap-1 px-2 py-1 rounded-xl text-[10px] font-mono border transition cursor-pointer ${
                  isCloudSyncing
                    ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300 animate-pulse'
                    : cloudSyncStatus === 'synced'
                    ? 'bg-emerald-950/50 border-emerald-600/40 text-emerald-400 hover:bg-emerald-900/40'
                    : 'bg-amber-950/40 border-amber-600/40 text-amber-300 hover:bg-amber-900/40'
                }`}
              >
                {isCloudSyncing ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : cloudSyncStatus === 'synced' ? (
                  <Cloud className="w-3 h-3 text-emerald-400" />
                ) : (
                  <CloudOff className="w-3 h-3 text-amber-400" />
                )}
              </button>
            )}

            <button
              onClick={logout}
              title="Encerrar Sessão"
              className="p-1.5 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-rose-900/60 text-zinc-400 hover:text-rose-400 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>
          </div>
        ) : (
          <button
            onClick={openAuthModal}
            title="Acessar Selo"
            className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-semibold uppercase rounded-xl transition cursor-pointer"
          >
            <User className="w-3.5 h-3.5 stroke-[2]" />
            <span>Acessar</span>
          </button>
        )}
      </div>
    </header>
  );
};
