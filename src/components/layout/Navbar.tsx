import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Flame,
  SunMedium,
  User,
  LogOut,
  Gift,
  AlertTriangle,
  Swords,
  Clock,
  Scroll,
  Briefcase,
  Cloud,
  CloudOff,
  RefreshCw,
  MessageSquare,
  ChevronDown,
  GitFork,
  Trophy,
  PanelRight,
} from 'lucide-react';
import { getCurrentRank } from '../../constants/rankings';
import { getAvatarById, getFrameById } from '../../constants/profileCustomization';

export const Navbar: React.FC = () => {
  const setView = useGameStore((s) => s.setView);
  const gauntlet = useGameStore((s) => s.gauntlet);
  const activeMission = useGameStore((s) => s.activeMission);
  const currentUser = useGameStore((s) => s.currentUser);
  const openAuthModal = useGameStore((s) => s.openAuthModal);
  const logout = useGameStore((s) => s.logout);
  const stats = useGameStore((s) => s.stats);
  const passedExams = useGameStore((s) => s.passedExams);
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
  const isRightSidebarOpen = useGameStore((s) => s.isRightSidebarOpen);
  const toggleRightSidebar = useGameStore((s) => s.toggleRightSidebar);

  const { rewardCountdown, readyToClaimCount } = usePlaytime();

  const [isMuted, setIsMuted] = useState(audio.isMuted());
  const [notation, setNotation] = useState(getNotationMode());
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const [isOpsOpen, setIsOpsOpen] = useState(false);

  const opsDropdownRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (opsDropdownRef.current && !opsDropdownRef.current.contains(e.target as Node)) {
        setIsOpsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cooldown de Desafios (Gauntlet)
  useEffect(() => {
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

  const currentRank = useMemo(() => {
    return getCurrentRank(
      stats.manualClicksAllTime,
      stats.highestCPSRecord,
      stats.totalPrestiges,
      passedExams
    );
  }, [stats.manualClicksAllTime, stats.highestCPSRecord, stats.totalPrestiges, passedExams]);

  // Alertas dinâmicos para a Central de Operações
  const isMissionReady = !!(
    activeMission.activeMissionId &&
    activeMission.resolvesAt &&
    Date.now() >= activeMission.resolvesAt
  );
  const isMissionRunning = !!(
    activeMission.activeMissionId &&
    activeMission.resolvesAt &&
    activeMission.resolvesAt > Date.now()
  );
  const hasOpsAlert = isMissionReady || (cooldownRemaining === 0 && !gauntlet.isFighting);
  const inventoryItemCount = inventory ? inventory.inventoryBag.filter(Boolean).length : 0;

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

      {/* 3. Controles & Operações Shinobi */}
      <div className="flex items-center gap-2">
        {/* BOTÃO UNIFICADO: OPERAÇÕES SHINOBI (Agrupa Desafios, Missões, Inventário e mais) */}
        <div className="relative" ref={opsDropdownRef}>
          <button
            onClick={() => setIsOpsOpen((prev) => !prev)}
            title="Abrir Central de Operações Shinobi (Desafios, Missões, Inventário, Clãs e Rankings)"
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all shadow-sm font-mono text-xs cursor-pointer select-none ${
              isOpsOpen
                ? 'bg-purple-950/80 border-purple-500/70 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                : hasOpsAlert
                ? 'bg-zinc-900 border-amber-500/60 text-amber-300 hover:border-amber-400'
                : 'bg-zinc-900/80 hover:bg-zinc-850 border-zinc-800 hover:border-zinc-700 text-zinc-200'
            }`}
          >
            <div className="w-5 h-5 rounded-md bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 flex-shrink-0">
              <Scroll className="w-3 h-3 stroke-[2]" />
            </div>
            <span className="font-semibold tracking-wide">Operações Shinobi</span>
            {hasOpsAlert && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
            <ChevronDown
              className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${
                isOpsOpen ? 'rotate-180 text-purple-300' : ''
              }`}
            />
          </button>

          {/* Dropdown Menu com Desafio, Missão, Inventário e Demais Módulos */}
          {isOpsOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-zinc-950/95 backdrop-blur-xl border border-zinc-800/90 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
              <div className="px-2.5 py-1 flex items-center justify-between text-[10px] font-mono text-zinc-400 border-b border-zinc-850/80">
                <span className="font-bold uppercase tracking-wider text-purple-400">
                  Operações Principais
                </span>
                <span className="text-zinc-500">Navegação</span>
              </div>

              {/* Opção 1: Arena de Desafios (Gauntlet) */}
              <button
                onClick={() => {
                  setView('CHALLENGES');
                  setIsOpsOpen(false);
                }}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-rose-950/40 border border-transparent hover:border-rose-900/50 text-left transition group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform">
                    <Swords className="w-3.5 h-3.5 stroke-[2]" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-zinc-100 group-hover:text-rose-200 transition-colors">
                      Desafios
                    </div>
                    <div className="text-[10px] font-mono text-zinc-400">
                      Chefe Gauntlet #{gauntlet.currentActiveBossId}
                    </div>
                  </div>
                </div>
                {cooldownRemaining > 0 ? (
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/50 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5 animate-spin" />
                    {cooldownRemaining}s
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-800/50">
                    Batalhar
                  </span>
                )}
              </button>

              {/* Opção 2: Mural de Missões Shinobi */}
              <button
                onClick={() => {
                  setView('MISSIONS');
                  setIsOpsOpen(false);
                }}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-emerald-950/40 border border-transparent hover:border-emerald-900/50 text-left transition group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                    <Scroll className="w-3.5 h-3.5 stroke-[2]" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-zinc-100 group-hover:text-emerald-200 transition-colors">
                      Missões
                    </div>
                    <div className="text-[10px] font-mono text-zinc-400">
                      Ranks E a SS • Minigames & Forja
                    </div>
                  </div>
                </div>
                {isMissionReady ? (
                  <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-600 animate-pulse font-bold">
                    Pronto!
                  </span>
                ) : isMissionRunning ? (
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/50">
                    Em Curso
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-zinc-500">14 Missões</span>
                )}
              </button>

              {/* Opção 3: Arsenal & Inventário RPG */}
              <button
                onClick={() => {
                  setView('INVENTORY');
                  setIsOpsOpen(false);
                }}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-cyan-950/40 border border-transparent hover:border-cyan-900/50 text-left transition group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                    <Briefcase className="w-3.5 h-3.5 stroke-[2]" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-zinc-100 group-hover:text-cyan-200 transition-colors">
                      Inventário
                    </div>
                    <div className="text-[10px] font-mono text-zinc-400">
                      Arsenal & Afinidades Elementais
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/50">
                  {inventoryItemCount} Itens
                </span>
              </button>

              <div className="h-px bg-zinc-850/80 my-1" />

              {/* Opção 4: Árvore de Clãs */}
              <button
                onClick={() => {
                  setView('CLAN_TREE');
                  setIsOpsOpen(false);
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-purple-950/30 text-left transition group cursor-pointer text-xs"
              >
                <div className="flex items-center gap-2 text-zinc-300 group-hover:text-purple-300">
                  <GitFork className="w-3.5 h-3.5 text-purple-400" />
                  <span>Árvore de Clãs</span>
                </div>
                <span className="text-[10px] font-mono text-purple-400">
                  {chakraAncestral.toString()}
                </span>
              </button>

              {/* Opção 5: Graduação & Exames */}
              <button
                onClick={() => {
                  setView('CHUNIN_EXAM');
                  setIsOpsOpen(false);
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-amber-950/30 text-left transition group cursor-pointer text-xs"
              >
                <div className="flex items-center gap-2 text-zinc-300 group-hover:text-amber-300">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Graduação Shinobi</span>
                </div>
                <span className="text-[10px] font-mono text-amber-400">
                  {currentRank.title}
                </span>
              </button>

              {/* Opção 6: Rankings Globais */}
              <button
                onClick={() => {
                  setView('RANKINGS');
                  setIsOpsOpen(false);
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-cyan-950/30 text-left transition group cursor-pointer text-xs"
              >
                <div className="flex items-center gap-2 text-zinc-300 group-hover:text-cyan-300">
                  <Trophy className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Hall da Fama (Rankings)</span>
                </div>
                <span className="text-[10px] font-mono text-cyan-400">Top 100</span>
              </button>

              <div className="h-px bg-zinc-850/80 my-1" />

              {/* Alternar Painel Lateral */}
              <button
                onClick={() => {
                  toggleRightSidebar();
                  setIsOpsOpen(false);
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-850 text-left transition text-zinc-400 hover:text-zinc-200 cursor-pointer text-xs font-mono"
              >
                <span className="flex items-center gap-2">
                  <PanelRight className="w-3.5 h-3.5" />
                  {isRightSidebarOpen ? 'Recolher Painel Lateral' : 'Abrir Painel Lateral'}
                </span>
                <span className="text-[9px] text-zinc-500">Lateral</span>
              </button>
            </div>
          )}
        </div>

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
