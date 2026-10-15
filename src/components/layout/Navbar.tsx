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
  TrendingUp,
  Zap,
  Flame,
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
    <header className="h-14 px-4 sm:px-5 bg-[#08090d]/85 backdrop-blur-2xl border-b border-zinc-800/80 flex items-center justify-between z-30 select-none shadow-[0_4px_25px_rgba(0,0,0,0.7)] relative overflow-hidden">
      {/* 0. LINHA DE ENERGIA DE CHAKRA DINÂMICA (Fluxo Contínuo na Borda Inferior) */}
      <div className="absolute bottom-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent pointer-events-none opacity-80" />
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-orange-500/30 to-transparent pointer-events-none opacity-60" />

      {/* 1. LOGO & MARCA SHINOBI (Com micro-interações e movimento suave) */}
      <div className="flex items-center gap-3 group cursor-default">
        <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500/20 via-zinc-900 to-amber-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shadow-[0_0_15px_rgba(251,146,60,0.25)] transition-all duration-300 group-hover:scale-105 group-hover:rotate-12 group-hover:shadow-[0_0_20px_rgba(251,146,60,0.4)]">
          <SunMedium className="w-4 h-4 stroke-[2.2] animate-pulse" />
          <span className="absolute inset-0 rounded-xl bg-orange-400/10 blur-sm group-hover:opacity-100 opacity-50 transition-opacity" />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <h1 className="text-xs font-black tracking-wider text-white uppercase font-sans group-hover:text-orange-300 transition-colors">
              Chakra Clicker
            </h1>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-orange-950/70 text-orange-400 border border-orange-700/60 shadow-sm">
              v2.0
            </span>
          </div>
          <span className="text-[9px] font-mono text-zinc-400 hidden sm:block">
            Motor Incremental Shinobi
          </span>
        </div>
      </div>

      {/* 2. HUD CENTRAL DINÂMICO & CLEAN (Chakra, CPS & Ancestral com Efeitos de Pulsação) */}
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-gradient-to-r from-zinc-950/90 via-zinc-900/80 to-zinc-950/90 border border-zinc-800/90 hover:border-zinc-700 rounded-2xl px-3.5 py-1.5 gap-3.5 shadow-inner transition-all duration-300">
          {/* Chakra Atual */}
          <div className="flex items-center gap-2 group/val">
            <div className="w-5 h-5 rounded-md bg-orange-950/50 border border-orange-800/60 flex items-center justify-center text-orange-400 group-hover/val:scale-110 transition-transform">
              <Flame className="w-3 h-3 fill-orange-400/20" />
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] font-mono uppercase tracking-widest text-zinc-400 font-semibold leading-none">
                Chakra
              </span>
              <span className="text-xs sm:text-sm font-mono font-black text-orange-400 tracking-tight leading-tight">
                {formatBigNumber(chakra)}
              </span>
            </div>
          </div>

          <div className="h-4 w-px bg-zinc-800/80" />

          {/* Produção Passiva (CPS) */}
          <div className="flex items-center gap-2 group/val">
            <div className="w-5 h-5 rounded-md bg-emerald-950/50 border border-emerald-800/60 flex items-center justify-center text-emerald-400 group-hover/val:scale-110 transition-transform">
              <TrendingUp className="w-3 h-3 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] font-mono uppercase tracking-widest text-zinc-400 font-semibold leading-none">
                CPS Ativo
              </span>
              <span className="text-xs sm:text-sm font-mono font-black text-emerald-400 tracking-tight leading-tight">
                +{formatBigNumber(currentCPS)}
              </span>
            </div>
          </div>

          {/* Chakra Ancestral (visível apenas se > 0) */}
          {chakraAncestral.gt(0) && (
            <>
              <div className="h-4 w-px bg-zinc-800/80" />
              <div className="flex items-center gap-2 group/val">
                <div className="w-5 h-5 rounded-md bg-purple-950/50 border border-purple-800/60 flex items-center justify-center text-purple-400 group-hover/val:scale-110 transition-transform">
                  <Zap className="w-3 h-3 fill-purple-400/20" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-mono uppercase tracking-widest text-purple-400/90 font-semibold leading-none">
                    Ancestral
                  </span>
                  <span className="text-xs sm:text-sm font-mono font-black text-purple-300 tracking-tight leading-tight">
                    {chakraAncestral.toString()}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Alerta de Exaustão Dinâmico com Movimento de Alarme */}
        {exhaustionTimer > 0 && (
          <div className="bg-rose-950/70 border border-rose-800 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 text-rose-300 text-[11px] font-mono font-bold animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.3)]">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
            <span>Exaustão: {exhaustionTimer.toFixed(0)}s</span>
          </div>
        )}
      </div>

      {/* 3. TOOLBAR DE CONTROLES & AÇÕES RÁPIDAS (Clean com Animações Fluidas) */}
      <div className="flex items-center gap-2">
        {/* Provisões de Presença com Alerta de Movimento Dinâmico */}
        <button
          onClick={openOnlineRewardModal}
          title="Abrir Provisões de Presença Shinobi"
          className={`relative flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-300 cursor-pointer border text-xs font-mono select-none ${
            readyToClaimCount > 0
              ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border-amber-500/60 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)] scale-102 animate-pulse'
              : 'bg-zinc-900/60 hover:bg-zinc-850 border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white'
          }`}
        >
          <Gift
            className={`w-3.5 h-3.5 stroke-[2] transition-transform ${
              readyToClaimCount > 0 ? 'text-amber-400 animate-bounce' : 'text-amber-400/80'
            }`}
          />
          <span className="hidden lg:inline font-semibold">Provisões</span>
          <span
            className={`text-[11px] font-bold ${
              readyToClaimCount > 0 ? 'text-amber-300' : 'text-zinc-500'
            }`}
          >
            {rewardCountdown}
          </span>
          {readyToClaimCount > 0 && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-80" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
          )}
        </button>

        {/* Botão de Chat da Aldeia Shinobi */}
        <button
          onClick={toggleChat}
          title="Abrir Chat Shinobi da Aldeia da Folha"
          className={`relative p-2 rounded-xl border transition-all duration-200 cursor-pointer active:scale-95 ${
            isChatOpen
              ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
              : 'bg-zinc-900/60 hover:bg-zinc-850 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-amber-300'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 stroke-[1.8]" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-75" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500" />
        </button>

        {/* Micro-Toolbar de Preferências (Som, Notação, Cinético) com Hover Suave */}
        <div className="hidden sm:flex items-center bg-zinc-950/70 border border-zinc-800 rounded-xl p-1 gap-1 shadow-inner">
          {/* Som Procedural */}
          <button
            onClick={handleToggleMute}
            title={isMuted ? 'Ativar Efeitos Sonoros' : 'Silenciar Áudio'}
            className="p-1.5 rounded-lg hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 transition-transform active:scale-90 cursor-pointer"
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            )}
          </button>

          {/* Notação Numérica */}
          <button
            onClick={handleToggleNotation}
            title={`Notação: ${notation === 'suffix' ? 'Sufixos (K, M, B)' : 'Científica (1.23e15)'}`}
            className="p-1.5 rounded-lg hover:bg-zinc-850 text-zinc-400 hover:text-cyan-300 transition-transform active:scale-90 cursor-pointer"
          >
            <Hash className="w-3.5 h-3.5" />
          </button>

          {/* Modo Cinético (Partículas & Screen Shake) */}
          <button
            onClick={toggleKinetic}
            title={kineticMode ? 'Modo Cinético Ativo (Partículas & Shockwaves)' : 'Modo Econômico'}
            className={`p-1.5 rounded-lg transition-all duration-200 cursor-pointer active:scale-90 ${
              kineticMode
                ? 'text-orange-400 bg-orange-950/40 border border-orange-500/40 shadow-[0_0_10px_rgba(251,146,60,0.2)]'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-850'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${kineticMode ? 'animate-spin-slow' : ''}`} />
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
                  title="Abrir Licença & Ficha Shinobi"
                  className="flex items-center gap-2 px-2.5 py-1.5 bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800 hover:border-cyan-500/60 rounded-xl text-xs font-mono transition-all duration-200 shadow-sm group cursor-pointer hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                >
                  <div
                    className={`w-6 h-6 rounded-lg bg-gradient-to-br ${navAvatar.bgGradient} border ${navFrame.borderClass} flex items-center justify-center text-[11px] relative flex-shrink-0 shadow-sm overflow-hidden group-hover:scale-105 transition-transform`}
                  >
                    {currentUser.customAvatar ? (
                      <img
                        src={currentUser.customAvatar}
                        alt={currentUser.fullName}
                        className="w-full h-full object-cover rounded-md"
                      />
                    ) : (
                      <span>{navAvatar.emojiIcon}</span>
                    )}
                  </div>
                  <span className="text-zinc-200 font-bold max-w-[85px] truncate hidden md:inline group-hover:text-cyan-300 transition-colors">
                    {currentUser.fullName.split(' ')[0]}
                  </span>
                  <span className="text-cyan-400 font-bold text-[11px] hidden sm:inline">
                    {currentUser.ninjaTag || `#${currentUser.ninjaId}`}
                  </span>
                </button>
              );
            })()}

            {currentUser.username !== 'convidado' && (
              <button
                onClick={() => saveGame()}
                title={
                  isCloudSyncing
                    ? 'Sincronizando com Neon Postgres...'
                    : cloudSyncStatus === 'synced'
                    ? 'Progresso Sincronizado na Nuvem'
                    : 'Salvo Localmente (Clique para enviar à nuvem)'
                }
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-mono border transition-all duration-200 cursor-pointer active:scale-95 ${
                  isCloudSyncing
                    ? 'bg-cyan-950/70 border-cyan-500/60 text-cyan-300 animate-pulse shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                    : cloudSyncStatus === 'synced'
                    ? 'bg-emerald-950/50 border-emerald-600/50 text-emerald-300 hover:bg-emerald-900/50'
                    : 'bg-amber-950/40 border-amber-600/50 text-amber-300 hover:bg-amber-900/50'
                }`}
              >
                {isCloudSyncing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : cloudSyncStatus === 'synced' ? (
                  <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <CloudOff className="w-3.5 h-3.5 text-amber-400" />
                )}
              </button>
            )}

            <button
              onClick={logout}
              title="Encerrar Sessão"
              className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-rose-900/60 text-zinc-400 hover:text-rose-400 transition-colors active:scale-95 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 stroke-[1.8]" />
            </button>
          </div>
        ) : (
          <button
            onClick={openAuthModal}
            title="Acessar Selo Shinobi"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold uppercase rounded-xl transition-all duration-200 shadow-sm cursor-pointer hover:shadow-[0_0_15px_rgba(6,182,212,0.25)]"
          >
            <User className="w-3.5 h-3.5 stroke-[2]" />
            <span>Acessar</span>
          </button>
        )}
      </div>
    </header>
  );
};
