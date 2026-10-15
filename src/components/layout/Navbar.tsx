import React, { useState, useMemo } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { formatBigNumber, toggleNotationMode, getNotationMode } from '../../engine/BigNumber';
import { calculateTotalCPS, getGatesMultiplier, calculatePendingAncestralChakra } from '../../engine/formulas';
import { usePlaytime } from '../../hooks/usePlaytime';
import { audio } from '../../engine/audio';
import { Tooltip } from '../ui/Tooltip';
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
  const stats = useGameStore((s) => s.stats);
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

      {/* 2. HUD CENTRAL COMPACTO & MINIMALISTA (Ícone + font-mono com Tooltip Flutuante) */}
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-zinc-950/90 border border-zinc-800 hover:border-zinc-700 rounded-2xl px-2.5 py-1 gap-2 shadow-inner transition-all duration-300">
          {/* Pílula 1: Chakra Atual */}
          <Tooltip
            title="Chakra Atual"
            badgeText="Energia Vital"
            badgeVariant="amber"
            description="Energia primordial moldada a partir da união das energias física e espiritual. Recurso fundamental para recrutar tropas, adquirir técnicas e abrir os Oito Portões."
            metrics={[
              { label: 'Total Acumulado', value: formatBigNumber(stats.totalChakraEarned), colorClass: 'text-amber-400' },
              { label: 'Cliques Manuais', value: stats.manualClicksAllTime.toLocaleString('pt-BR'), colorClass: 'text-zinc-200' },
              { label: 'Renascimentos', value: `${stats.totalPrestiges}`, colorClass: 'text-purple-300' },
            ]}
            position="bottom"
          >
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-orange-950/30 hover:bg-orange-950/60 border border-orange-800/40 hover:border-orange-500/60 transition-colors cursor-help">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-xs sm:text-sm font-mono font-black text-orange-400 tracking-tight">
                {formatBigNumber(chakra)}
              </span>
            </div>
          </Tooltip>

          <div className="h-4 w-px bg-zinc-800/80" />

          {/* Pílula 2: Produção Passiva (CPS) */}
          <Tooltip
            title="Produção Contínua (CPS)"
            badgeText="Fluxo Passivo"
            badgeVariant="emerald"
            description="Geração automática contínua de Chakra gerada pelas tropas e aliados em serviço, potencializada por jutsus dominados e bônus ativos."
            metrics={[
              { label: 'Multiplicador de Portões', value: `${gatesActiveTimer > 0 ? getGatesMultiplier(gatesUnlocked) : 1}x`, colorClass: gatesActiveTimer > 0 ? 'text-rose-400' : 'text-zinc-400' },
              { label: 'Buff de Missões', value: `${(missionPermanentCpsMult * (missionBuffTimer > 0 ? missionBuffMult : 1)).toFixed(2)}x`, colorClass: 'text-emerald-400' },
              { label: 'Estado Fisiológico', value: exhaustionTimer > 0 ? `Exaustão (${exhaustionTimer.toFixed(0)}s)` : 'Normal', colorClass: exhaustionTimer > 0 ? 'text-rose-400' : 'text-emerald-400' },
            ]}
            position="bottom"
          >
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-emerald-950/30 hover:bg-emerald-950/60 border border-emerald-800/40 hover:border-emerald-500/60 transition-colors cursor-help">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="text-xs sm:text-sm font-mono font-black text-emerald-400 tracking-tight">
                +{formatBigNumber(currentCPS)}
              </span>
            </div>
          </Tooltip>

          {/* Pílula 3: Chakra Ancestral (visível apenas se > 0) */}
          {chakraAncestral.gt(0) && (
            <>
              <div className="h-4 w-px bg-zinc-800/80" />
              <Tooltip
                title="Chakra Ancestral"
                badgeText="Linhagem Sábia"
                badgeVariant="purple"
                description="Chakra primordial do Sábio dos Seis Caminhos. Permanente através dos renascimentos e investido para despertar técnicas lendárias na Árvore de Clãs."
                metrics={[
                  { label: 'Saldo Imortal', value: chakraAncestral.toString(), colorClass: 'text-purple-300' },
                  { label: 'Pendente no Renascimento', value: `+${calculatePendingAncestralChakra(stats.totalChakraEarned)}`, colorClass: 'text-amber-400' },
                ]}
                position="bottom"
              >
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-purple-950/30 hover:bg-purple-950/60 border border-purple-800/40 hover:border-purple-500/60 transition-colors cursor-help">
                  <Zap className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-xs sm:text-sm font-mono font-black text-purple-300 tracking-tight">
                    {chakraAncestral.toString()}
                  </span>
                </div>
              </Tooltip>
            </>
          )}
        </div>

        {/* Alerta de Exaustão Dinâmico com Tooltip */}
        {exhaustionTimer > 0 && (
          <Tooltip
            title="Colapso Muscular Shinobi"
            badgeText="Sobrecarga"
            badgeVariant="rose"
            description="Fadiga física pós-encerramento da Fúria dos Oito Portões. O fluxo de chakra é severamente restringido durante o período de recuperação."
            metrics={[
              { label: 'Penalidade de CPS', value: '-85%', colorClass: 'text-rose-400' },
              { label: 'Tempo Restante', value: `${exhaustionTimer.toFixed(1)}s`, colorClass: 'text-amber-400' },
            ]}
            position="bottom"
          >
            <div className="bg-rose-950/70 border border-rose-800 px-2 py-1.5 rounded-xl flex items-center gap-1 text-rose-300 text-xs font-mono font-bold animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.3)] cursor-help">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
              <span>{exhaustionTimer.toFixed(0)}s</span>
            </div>
          </Tooltip>
        )}
      </div>

      {/* 3. TOOLBAR DE CONTROLES & AÇÕES RÁPIDAS COM TOOLTIPS */}
      <div className="flex items-center gap-2">
        {/* Provisões de Presença */}
        <Tooltip
          title="Provisões de Presença Shinobi"
          badgeText={readyToClaimCount > 0 ? 'Disponível' : 'Em Recarga'}
          badgeVariant={readyToClaimCount > 0 ? 'amber' : 'neutral'}
          description="Rações e suprimentos de guerra concedidos em intervalos fixos pelo Quartel da Aldeia enquanto o cockpit estiver operacional."
          metrics={[
            { label: 'Prontos para Resgate', value: `${readyToClaimCount} pacote(s)`, colorClass: readyToClaimCount > 0 ? 'text-amber-300' : 'text-zinc-400' },
            { label: 'Próxima Entrega', value: rewardCountdown, colorClass: 'text-cyan-400' },
          ]}
          position="bottom"
        >
          <button
            onClick={openOnlineRewardModal}
            className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all duration-300 cursor-pointer border text-xs font-mono select-none ${
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
            <span className="text-[11px] font-bold">
              {readyToClaimCount > 0 ? `+${readyToClaimCount}` : rewardCountdown}
            </span>
            {readyToClaimCount > 0 && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-80" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
            )}
          </button>
        </Tooltip>

        {/* Botão de Chat da Aldeia Shinobi */}
        <Tooltip
          title="Frequência de Rádio Shinobi"
          badgeText="Aldeia da Folha"
          badgeVariant="cyan"
          description="Canal de comunicação instantânea e cooperação tática com outros shinobis da rede."
          position="bottom"
        >
          <button
            onClick={toggleChat}
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
        </Tooltip>

        {/* Micro-Toolbar de Preferências (Som, Notação, Cinético) */}
        <div className="hidden sm:flex items-center bg-zinc-950/70 border border-zinc-800 rounded-xl p-1 gap-1 shadow-inner">
          {/* Som Procedural */}
          <Tooltip
            title="Efeitos Sonoros"
            badgeText={isMuted ? 'Silenciado' : 'Ativo'}
            badgeVariant={isMuted ? 'rose' : 'emerald'}
            description="Sons sintetizados proceduralmente via Web Audio API para cliques e feedback de combate."
            position="bottom"
          >
            <button
              onClick={handleToggleMute}
              className="p-1.5 rounded-lg hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 transition-transform active:scale-90 cursor-pointer"
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              )}
            </button>
          </Tooltip>

          {/* Notação Numérica */}
          <Tooltip
            title="Formatação Numérica"
            badgeText={notation === 'suffix' ? 'Sufixo (K, M, B)' : 'Científica'}
            badgeVariant="cyan"
            description="Alterne o modo de exibição de números gigantescos (break_infinity.js)."
            position="bottom"
          >
            <button
              onClick={handleToggleNotation}
              className="p-1.5 rounded-lg hover:bg-zinc-850 text-zinc-400 hover:text-cyan-300 transition-transform active:scale-90 cursor-pointer"
            >
              <Hash className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          {/* Modo Cinético (Partículas & Screen Shake) */}
          <Tooltip
            title="Modo Cinético Visual"
            badgeText={kineticMode ? 'Ativado' : 'Econômico'}
            badgeVariant={kineticMode ? 'amber' : 'neutral'}
            description="Ativa partículas de impacto, ondas de choque visuais e vibração da tela."
            position="bottom"
          >
            <button
              onClick={toggleKinetic}
              className={`p-1.5 rounded-lg transition-all duration-200 cursor-pointer active:scale-90 ${
                kineticMode
                  ? 'text-orange-400 bg-orange-950/40 border border-orange-500/40 shadow-[0_0_10px_rgba(251,146,60,0.2)]'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-850'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${kineticMode ? 'animate-spin-slow' : ''}`} />
            </button>
          </Tooltip>
        </div>

        {/* Perfil Shinobi & Salvar Nuvem */}
        {currentUser ? (
          <div className="flex items-center gap-1.5">
            {(() => {
              const navAvatar = getAvatarById(currentUser.avatar);
              const navFrame = getFrameById(currentUser.avatarFrame);
              return (
                <Tooltip
                  title={`Ficha Shinobi: ${currentUser.fullName}`}
                  badgeText={currentUser.ninjaTag || `#${currentUser.ninjaId}`}
                  badgeVariant="cyan"
                  description="Acesse sua licença ninja oficial, personalização de moldura e dados cadastrais."
                  position="bottom"
                >
                  <button
                    onClick={openAuthModal}
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
                        <User className="w-3.5 h-3.5 text-cyan-300" />
                      )}
                    </div>
                    <span className="text-zinc-200 font-bold max-w-[85px] truncate hidden md:inline group-hover:text-cyan-300 transition-colors">
                      {currentUser.fullName.split(' ')[0]}
                    </span>
                    <span className="text-cyan-400 font-bold text-[11px] hidden sm:inline">
                      {currentUser.ninjaTag || `#${currentUser.ninjaId}`}
                    </span>
                  </button>
                </Tooltip>
              );
            })()}

            {currentUser.username !== 'convidado' && (
              <Tooltip
                title="Sincronização Neon Postgres"
                badgeText={isCloudSyncing ? 'Sincronizando' : cloudSyncStatus === 'synced' ? 'Nuvem Conectada' : 'Pendente'}
                badgeVariant={cloudSyncStatus === 'synced' ? 'emerald' : 'amber'}
                description="Persistência relacional direta com o banco Neon Postgres em Frankfurt. Mantém seus dados seguros entre múltiplos dispositivos."
                metrics={[
                  { label: 'Status', value: isCloudSyncing ? 'Enviando...' : cloudSyncStatus === 'synced' ? 'Sincronizado' : 'Salvo Local', colorClass: cloudSyncStatus === 'synced' ? 'text-emerald-400' : 'text-amber-400' },
                ]}
                position="bottom"
              >
                <button
                  onClick={() => saveGame()}
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
              </Tooltip>
            )}

            <Tooltip
              title="Encerrar Sessão"
              badgeText="Logout"
              badgeVariant="rose"
              description="Desconectar do perfil shinobi ativo e retornar à tela de entrada."
              position="bottom"
            >
              <button
                onClick={logout}
                className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-rose-900/60 text-zinc-400 hover:text-rose-400 transition-colors active:scale-95 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 stroke-[1.8]" />
              </button>
            </Tooltip>
          </div>
        ) : (
          <button
            onClick={openAuthModal}
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
