import React, { useState } from 'react';
import { ShinobiUser } from '../../types/auth';
import {
  DEFAULT_BANNER_PRESETS,
  getInsigniaById,
  getDefaultEquippedInsignias,
} from '../../constants/insignias';
import { InsigniaBadge } from './InsigniaBadge';
import { getAvatarById, getFrameById } from '../../constants/profileCustomization';
import { audio } from '../../engine/audio';
import {
  Volume2,
  VolumeX,
  Edit3,
  Copy,
  Check,
  Shield,
  FileText,
  Calendar,
} from 'lucide-react';

interface DiscordProfileCardProps {
  user: ShinobiUser;
  onEditProfile: () => void;
  onEditClanProfile?: () => void;
}

export const DiscordProfileCard: React.FC<DiscordProfileCardProps> = ({
  user,
  onEditProfile,
  onEditClanProfile,
}) => {
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(audio.isMuted());
  const [copiedTag, setCopiedTag] = useState<boolean>(false);

  // Avatar e moldura
  const avatarDef = getAvatarById(user.avatar);
  const frameDef = getFrameById(user.avatarFrame);

  // Banner resolução
  const bannerImage = (() => {
    if (user.customBanner) {
      if (user.customBanner.startsWith('data:') || user.customBanner.startsWith('http')) {
        return user.customBanner;
      }
      const preset = DEFAULT_BANNER_PRESETS.find((p) => p.id === user.customBanner);
      if (preset) return preset.imageUrl;
    }
    return DEFAULT_BANNER_PRESETS[0].imageUrl;
  })();

  // Insígnias ativas
  const activeInsigniaIds =
    user.equippedInsignias && user.equippedInsignias.length > 0
      ? user.equippedInsignias
      : getDefaultEquippedInsignias();

  const activeInsignias = activeInsigniaIds
    .map((id) => getInsigniaById(id))
    .filter((ins): ins is NonNullable<typeof ins> => !!ins);

  const handleToggleMute = () => {
    const next = audio.toggleMute();
    setIsAudioMuted(next);
  };

  const formattedTag = user.ninjaTag
    ? user.ninjaTag.startsWith('#')
      ? user.ninjaTag
      : `#${user.ninjaTag}`
    : `#${user.ninjaId || '0001'}`;

  const handleCopyTag = () => {
    navigator.clipboard?.writeText?.(`${user.username}${formattedTag}`);
    setCopiedTag(true);
    setTimeout(() => setCopiedTag(false), 2000);
  };

  // Data formatada
  const memberDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('pt-BR', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Mar 26, 2022';

  return (
    <div className="w-full max-w-lg mx-auto bg-[#090a0f] border border-zinc-800 rounded-xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.95)] text-zinc-100 font-sans select-none relative">
      {/* 1. TOPO HUD TÁTICO & BANNER RETANGULAR */}
      <div className="relative w-full h-44 sm:h-48 bg-zinc-950 overflow-hidden">
        <img
          src={bannerImage}
          alt="Banner do Perfil"
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        {/* Gradiente escuro para legibilidade */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f] via-transparent to-black/40 pointer-events-none" />

        {/* Faixa Tática Superior */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <div className="px-2.5 py-1 rounded-md bg-zinc-950/85 border border-zinc-700/80 backdrop-blur-md flex items-center gap-1.5 shadow-md">
            <span className="w-2 h-2 rounded-sm bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-300">
              FICHA SHINOBI // #{user.ninjaId || '0001'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onEditProfile}
              title="Personalizar Perfil"
              className="px-2.5 py-1 rounded-md bg-zinc-950/85 hover:bg-zinc-900 border border-zinc-700/80 hover:border-cyan-500/80 backdrop-blur-md flex items-center gap-1 text-[11px] font-mono font-medium text-zinc-200 hover:text-cyan-300 transition cursor-pointer shadow-md"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>
            <button
              type="button"
              onClick={handleCopyTag}
              title="Copiar Tag do Shinobi"
              className="p-1 rounded-md bg-zinc-950/85 hover:bg-zinc-900 border border-zinc-700/80 hover:border-cyan-500/80 backdrop-blur-md flex items-center justify-center text-zinc-300 hover:text-white transition cursor-pointer shadow-md"
            >
              {copiedTag ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* 2. AVATAR QUADRADO / SQUIRCLE + FILEIRA DE INSÍGNIAS TÁTICA */}
      <div className="px-5 relative pb-5">
        <div className="flex items-end justify-between -mt-14 sm:-mt-16 mb-4">
          {/* Avatar Quadrado com Borda Angulada e Brilho Ciano */}
          <div className="relative group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl p-1 bg-[#090a0f] border-2 border-cyan-500/70 shadow-[0_0_20px_rgba(6,182,212,0.25)] relative overflow-hidden flex items-center justify-center">
              {user.customAvatar ? (
                <img
                  src={user.customAvatar}
                  alt={user.fullName}
                  className="w-full h-full rounded-lg object-cover"
                />
              ) : (
                <div
                  className={`w-full h-full rounded-lg bg-gradient-to-br ${avatarDef.bgGradient} flex items-center justify-center text-3xl sm:text-4xl shadow-inner border ${frameDef.borderClass}`}
                >
                  <span>{avatarDef.emojiIcon}</span>
                </div>
              )}
            </div>

            {/* Badge Quadrada de Status Ninja no Canto */}
            <div
              title="Status: Ativo nas Sombras"
              className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-zinc-950 border border-amber-500/70 flex items-center gap-1 text-[10px] font-mono text-amber-300 shadow-md"
            >
              <span>🌙</span>
              <span className="hidden sm:inline font-bold">ATIVO</span>
            </div>
          </div>

          {/* DOCK QUADRADO DE INSÍGNIAS (BADGES) ALINHADO À DIREITA */}
          <div className="bg-zinc-950/90 border border-zinc-800 rounded-lg p-1.5 flex items-center gap-1.5 shadow-xl backdrop-blur-md mb-1">
            {activeInsignias.map((insignia) => (
              <InsigniaBadge key={insignia.id} insignia={insignia} size="md" />
            ))}
          </div>
        </div>

        {/* 3. NOME DE EXIBIÇÃO (# NOME) & TAG SHINOBI */}
        <div className="space-y-1.5 mb-4">
          {/* # Nome Principal em Formato Tático */}
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
              <span className="text-cyan-400 font-mono font-black text-xl">#</span>
              <span className="truncate">{user.fullName}</span>
            </h2>
          </div>

          {/* Handle @username com Hashtag Quadrada */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-zinc-400">
            <span className="text-zinc-200 font-bold">@{user.username}</span>
            <button
              type="button"
              onClick={handleCopyTag}
              className="px-2 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-800/80 text-cyan-300 font-bold hover:bg-cyan-900/60 hover:border-cyan-400 transition cursor-pointer flex items-center gap-1"
              title="Clique para copiar hashtag"
            >
              <span>{formattedTag}</span>
              {copiedTag && <span className="text-[10px] text-emerald-400 ml-1">✓ Copiado</span>}
            </button>

            {user.pronouns && (
              <span className="px-2 py-0.5 rounded-md bg-zinc-900/80 border border-zinc-800 text-[11px] font-mono text-zinc-400">
                {user.pronouns}
              </span>
            )}
          </div>

          {/* Frase de Status Shinobi */}
          {user.statusQuote && (
            <div className="text-xs text-zinc-300 font-mono flex items-center gap-1.5 pt-0.5">
              <span className="text-cyan-400 font-bold">»</span>
              <span>{user.statusQuote}</span>
            </div>
          )}
        </div>

        {/* 4. BOTÕES DE AÇÃO RETANGULARES / TÁTICOS */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            type="button"
            onClick={onEditProfile}
            className="w-full py-2 px-3 rounded-lg bg-zinc-900/90 hover:bg-zinc-850 hover:border-cyan-500/50 text-zinc-100 text-xs font-mono font-bold tracking-wide border border-zinc-800 shadow-sm transition active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Editar Perfil</span>
          </button>
          <button
            type="button"
            onClick={onEditClanProfile || onEditProfile}
            className="w-full py-2 px-3 rounded-lg bg-zinc-900/90 hover:bg-zinc-850 hover:border-amber-500/50 text-zinc-100 text-xs font-mono font-bold tracking-wide border border-zinc-800 shadow-sm transition active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Registro Shinobi</span>
          </button>
        </div>

        {/* 5. CONTROLE DE FREQUÊNCIA DE ÁUDIO & SOM DO COCKPIT */}
        <div className="space-y-1.5 mb-4">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block px-0.5">
            [ Sintonizador de Áudio Shinobi ]
          </span>
          <button
            type="button"
            onClick={handleToggleMute}
            className="w-full p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 flex items-center gap-3 text-zinc-200 transition active:scale-98 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-cyan-400 transition-colors">
              {isAudioMuted ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              )}
            </div>
            <div className="flex-1 text-left">
              <span className="text-xs font-bold block text-zinc-200 font-mono">
                {isAudioMuted ? 'Áudio Desativado' : 'Frequência de Chakra • Ao Vivo'}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                {isAudioMuted ? 'Clique para ativar som e efeitos' : 'Trilha sonora e efeitos de clique sincronizados'}
              </span>
            </div>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                isAudioMuted
                  ? 'bg-rose-950/50 border-rose-800 text-rose-300'
                  : 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
              }`}
            >
              {isAudioMuted ? 'MUTED' : 'LIVE'}
            </span>
          </button>
        </div>

        {/* 6. DOSSIÊ & BIOGRAFIA DO SHINOBI (ABOUT ME) */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
              [ Dossiê & Biografia do Shinobi ]
            </span>
            <FileText className="w-3.5 h-3.5 text-zinc-500" />
          </div>
          <div className="p-3.5 rounded-lg bg-zinc-950/80 border border-zinc-800 font-mono text-xs leading-relaxed text-zinc-300 relative overflow-hidden">
            {user.bio ? (
              <div className="whitespace-pre-wrap">{user.bio}</div>
            ) : (
              <div className="space-y-0.5 text-zinc-300">
                <p>* ₊ ✦ Pinterest: trulycasper</p>
                <p>* ₊ ✧ matching pfps w/ jed</p>
                <p className="text-zinc-400">* ₊ ˚ # live laugh love cgs</p>
              </div>
            )}
          </div>
        </div>

        {/* 7. REGISTRO & ALISTAMENTO OFICIAL */}
        <div className="space-y-1.5 pt-0.5">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block px-0.5">
            [ Alistamento & Registro ]
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono text-zinc-300">
            <div className="p-2 rounded-lg bg-zinc-950/80 border border-zinc-800 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              <div className="min-w-0">
                <span className="text-[9px] text-zinc-500 uppercase block">Alistamento</span>
                <span className="text-zinc-200 font-medium truncate block">{memberDate}</span>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-zinc-950/80 border border-zinc-800 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <div className="min-w-0">
                <span className="text-[9px] text-zinc-500 uppercase block">Origem</span>
                <span className="text-amber-300 font-medium truncate block">Aldeia da Folha</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
