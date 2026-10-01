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
  MoreHorizontal,
  Mic,
  MicOff,
  Edit3,
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
    <div className="w-full max-w-md mx-auto bg-[#0a0b10] border border-zinc-800/80 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.9)] text-zinc-100 font-sans select-none relative">
      {/* 1. BANNER SUPERIOR ESTILO DISCORD MOBILE */}
      <div className="relative w-full h-40 sm:h-44 bg-zinc-950 overflow-hidden">
        <img
          src={bannerImage}
          alt="Banner do Perfil"
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b10] via-transparent to-black/30 pointer-events-none" />

        {/* Botão de Opções / Três Pontinhos no Topo Direito */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          <button
            type="button"
            onClick={onEditProfile}
            title="Editar Aparência"
            className="w-8 h-8 rounded-full bg-zinc-950/70 hover:bg-zinc-900 border border-white/10 hover:border-white/20 backdrop-blur-md flex items-center justify-center text-zinc-300 hover:text-white transition cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleCopyTag}
            title="Copiar Tag do Shinobi"
            className="w-8 h-8 rounded-full bg-zinc-950/70 hover:bg-zinc-900 border border-white/10 hover:border-white/20 backdrop-blur-md flex items-center justify-center text-zinc-300 hover:text-white transition cursor-pointer"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. AVATAR CIRCULAR + FILEIRA DE INSÍGNIAS NO MESMO NÍVEL */}
      <div className="px-5 relative pb-4">
        <div className="flex items-end justify-between -mt-12 sm:-mt-14 mb-3">
          {/* Avatar Circular Sobreposto com Borda Escura Grossa */}
          <div className="relative group">
            <div className="w-22 h-22 sm:w-24 sm:h-24 rounded-full p-1 bg-[#0a0b10] border-4 border-[#0a0b10] shadow-2xl relative overflow-hidden flex items-center justify-center">
              {user.customAvatar ? (
                <img
                  src={user.customAvatar}
                  alt={user.fullName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div
                  className={`w-full h-full rounded-full bg-gradient-to-br ${avatarDef.bgGradient} flex items-center justify-center text-3xl shadow-inner border ${frameDef.borderClass}`}
                >
                  <span>{avatarDef.emojiIcon}</span>
                </div>
              )}
            </div>

            {/* Indicador de Status / Lua Ninja no Canto Inferior Direito do Avatar */}
            <div
              title="Status: Online nas Sombras"
              className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-[#0a0b10] border-2 border-[#0a0b10] flex items-center justify-center text-xs shadow-md"
            >
              <div className="w-full h-full rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-[11px]">
                🌙
              </div>
            </div>
          </div>

          {/* FILEIRA DE INSÍGNIAS (BADGES) ALINHADAS À DIREITA */}
          <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-1.5 flex items-center gap-1.5 shadow-xl backdrop-blur-md mb-2">
            {activeInsignias.map((insignia) => (
              <InsigniaBadge key={insignia.id} insignia={insignia} size="md" />
            ))}
          </div>
        </div>

        {/* 3. NOME DE EXIBIÇÃO (# NOME) & TAGS DO DISCORD */}
        <div className="space-y-1 mb-4">
          {/* # Nome Principal em Negrito */}
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
              <span className="text-zinc-500 font-medium">#</span>
              <span className="truncate">{user.fullName}</span>
            </h2>
          </div>

          {/* Handle / Nome de Usuário com Tag */}
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span className="text-zinc-300 font-semibold">{user.username}</span>
            <span
              onClick={handleCopyTag}
              className="text-cyan-400 font-bold hover:text-cyan-300 cursor-pointer transition"
              title="Clique para copiar"
            >
              {formattedTag}
            </span>
            {copiedTag && (
              <span className="text-[10px] text-emerald-400 animate-in fade-in-0 duration-150">
                Copiado!
              </span>
            )}
          </div>

          {/* Pronomes / Subtítulo Estético */}
          <div className="text-xs text-zinc-400 font-serif tracking-wide pt-0.5">
            {user.pronouns ? user.pronouns : '☆They/them or she/her☆'}
          </div>

          {/* Status / Frase de Impacto */}
          <div className="text-xs text-zinc-300 flex items-center gap-1.5 pt-0.5">
            <span>{user.statusQuote ? user.statusQuote : '🌪️ tornado wya'}</span>
          </div>
        </div>

        {/* 4. BOTÕES DE AÇÃO: EDIT USER PROFILE & EDIT SERVER PROFILE */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            type="button"
            onClick={onEditProfile}
            className="w-full py-2 px-3 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold tracking-wide border border-zinc-700/60 shadow-sm transition active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Edit User Profile</span>
          </button>
          <button
            type="button"
            onClick={onEditClanProfile || onEditProfile}
            className="w-full py-2 px-3 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold tracking-wide border border-zinc-700/60 shadow-sm transition active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Edit Server Profile</span>
          </button>
        </div>

        {/* 5. VOICE SETTINGS / CONTROLE DE ÁUDIO SHINOBI */}
        <div className="space-y-1.5 mb-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block px-1">
            Voice Settings
          </span>
          <button
            type="button"
            onClick={handleToggleMute}
            className="w-full p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 flex items-center gap-3 text-zinc-200 transition active:scale-98 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-cyan-400 transition-colors">
              {isAudioMuted ? (
                <MicOff className="w-4 h-4 text-rose-400" />
              ) : (
                <Mic className="w-4 h-4 text-emerald-400" />
              )}
            </div>
            <div className="flex-1 text-left">
              <span className="text-xs font-bold block text-zinc-200">
                {isAudioMuted ? 'Mute Ativo' : 'Microfone / Áudio Shinobi'}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                {isAudioMuted ? 'Som do jogo silenciado' : 'Efeitos sonoros e trilha ativos'}
              </span>
            </div>
            <span
              className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md border ${
                isAudioMuted
                  ? 'bg-rose-950/50 border-rose-800 text-rose-300'
                  : 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
              }`}
            >
              {isAudioMuted ? 'Muted' : 'Live'}
            </span>
          </button>
        </div>

        {/* 6. ABOUT ME / SOBRE MIM ESTILO DISCORD CAIXA TRACEJADA */}
        <div className="space-y-1.5 mb-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block px-1">
            About Me
          </span>
          <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-dashed border-zinc-700/80 font-mono text-[11px] leading-relaxed text-zinc-300 relative overflow-hidden group">
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

        {/* 7. MEMBER SINCE / MEMBRO DESDE */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block px-1">
            Member Since
          </span>
          <div className="flex items-center gap-4 text-xs font-mono text-zinc-300 px-1">
            {/* Ícone Discord / Chakra */}
            <div className="flex items-center gap-1.5">
              <span className="text-indigo-400 font-bold">💬</span>
              <span>{memberDate}</span>
            </div>
            {/* Ícone Secundário / Aldeia */}
            <div className="flex items-center gap-1.5">
              <span className="text-red-400 font-bold">🍃</span>
              <span>Jul 20, 2023</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
