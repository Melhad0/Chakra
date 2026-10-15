import React, { useState } from 'react';
import { ShinobiUser } from '../../types/auth';
import {
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
  Calendar,
  Sparkles,
  Flame,
  Award,
  Scroll,
  Radio,
} from 'lucide-react';

interface ShinobiProfileCardProps {
  user: ShinobiUser;
  onEditProfile: () => void;
  onEditClanProfile?: () => void;
}

export const ShinobiProfileCard: React.FC<ShinobiProfileCardProps> = ({
  user,
  onEditProfile,
  onEditClanProfile,
}) => {
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(audio.isMuted());
  const [copiedTag, setCopiedTag] = useState<boolean>(false);

  // Avatar e moldura
  const avatarDef = getAvatarById(user.avatar);
  const frameDef = getFrameById(user.avatarFrame);

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
    : `#${String(user.ninjaId || '0001').padStart(4, '0')}`;

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
    : 'Registro Oficial';

  return (
    <div className="w-full max-w-xl mx-auto rounded-2xl bg-gradient-to-b from-zinc-900/90 via-zinc-950/95 to-[#090b10] border border-zinc-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.85)] text-zinc-100 font-sans select-none relative overflow-hidden backdrop-blur-xl">
      {/* Luz ambiente de topo (Chakra Glow sutil) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-cyan-500/10 via-amber-500/5 to-transparent blur-2xl pointer-events-none" />

      {/* 1. CABEÇALHO DA LICENÇA SHINOBI (Estilo Registro Oficial Ninja) */}
      <div className="px-5 py-3.5 border-b border-zinc-800/80 bg-zinc-950/60 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500/20 to-zinc-900 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
            <Scroll className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold tracking-wider text-zinc-200 uppercase">
                Licença Shinobi Oficial
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-cyan-950/70 border border-cyan-800/60 text-cyan-300">
                REG {formattedTag}
              </span>
            </div>
            <span className="text-[9px] text-zinc-500 font-mono block">
              Grande Aliança Shinobi • Arquivo Central
            </span>
          </div>
        </div>

        {/* Status de Prontidão */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 text-[10px] font-mono font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>ATIVO</span>
          </div>

          <button
            type="button"
            onClick={onEditProfile}
            title="Editar Ficha Ninja"
            className="p-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 hover:border-cyan-500/60 text-zinc-300 hover:text-cyan-300 transition cursor-pointer shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. IDENTIDADE PRINCIPAL (Layout Horizontal Limpo) */}
      <div className="p-5 sm:p-6 space-y-5 relative z-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5">
          {/* Avatar com Moldura Elemental Tática */}
          <div className="relative group flex-shrink-0">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl p-1 bg-zinc-950 border-2 border-zinc-800 shadow-[0_0_25px_rgba(0,0,0,0.6)] flex items-center justify-center overflow-hidden">
              {user.customAvatar ? (
                <img
                  src={user.customAvatar}
                  alt={user.fullName}
                  className="w-full h-full rounded-xl object-cover"
                />
              ) : (
                <div
                  className={`w-full h-full rounded-xl bg-gradient-to-br ${avatarDef.bgGradient} flex items-center justify-center text-3xl sm:text-4xl shadow-inner border ${frameDef.borderClass}`}
                >
                  <span>{avatarDef.emojiIcon}</span>
                </div>
              )}

              {/* Borda da Moldura Elemental Ativa */}
              <div
                className={`absolute inset-0 rounded-2xl pointer-events-none border-2 ${frameDef.borderClass} ${frameDef.glowClass} opacity-80`}
              />
            </div>

            {/* Selo do Clã / Elemento */}
            <div
              title={`Moldura: ${frameDef.name}`}
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-zinc-950 border border-cyan-500/50 text-[9px] font-mono font-bold text-cyan-300 whitespace-nowrap shadow-lg flex items-center gap-1"
            >
              <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
              <span>{frameDef.name}</span>
            </div>
          </div>

          {/* Dados do Shinobi */}
          <div className="flex-1 text-center sm:text-left min-w-0 space-y-2">
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
                  {user.fullName}
                </h2>
                {user.pronouns && (
                  <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400">
                    {user.pronouns}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-xs font-mono">
                <span className="text-zinc-400 font-medium">@{user.username}</span>
                <button
                  type="button"
                  onClick={handleCopyTag}
                  className="px-2 py-0.5 rounded-md bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-cyan-500/50 text-cyan-300 text-[11px] font-bold transition cursor-pointer flex items-center gap-1"
                  title="Clique para copiar credencial completa"
                >
                  <span>{formattedTag}</span>
                  {copiedTag ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3 text-zinc-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Lema Shinobi (Nindō) */}
            {user.statusQuote ? (
              <div className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 text-xs text-zinc-300 font-mono flex items-center gap-2">
                <Flame className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span className="italic truncate">"{user.statusQuote}"</span>
              </div>
            ) : (
              <div className="text-xs text-zinc-500 italic font-mono">
                "O verdadeiro shinobi é aquele que persevera diante de qualquer adversidade."
              </div>
            )}
          </div>
        </div>

        {/* 3. CONDECORAÇÕES & MEDALHAS TÁTICAS (Insígnias em Fita Limpa) */}
        <div className="p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/70 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Condecorações de Combate</span>
            </span>
            <span className="text-[10px] font-mono text-cyan-400">
              {activeInsignias.length} Conquistadas
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            {activeInsignias.length > 0 ? (
              activeInsignias.map((insignia) => (
                <div
                  key={insignia.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs shadow-sm hover:border-zinc-700 transition"
                >
                  <InsigniaBadge insignia={insignia} size="sm" />
                  <span className="text-[11px] font-medium text-zinc-300">{insignia.name}</span>
                </div>
              ))
            ) : (
              <span className="text-xs text-zinc-500 italic">
                Nenhuma condecoração equipada no registro.
              </span>
            )}
          </div>
        </div>

        {/* 4. DOSSIÊ & REGISTRO DE SERVIÇO (Bio Shinobi Limpa) */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block px-0.5">
            Dossiê & Notas de Campo
          </span>
          <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 font-mono text-xs leading-relaxed text-zinc-300 relative border-l-2 border-l-cyan-500">
            {user.bio ? (
              <p className="whitespace-pre-wrap">{user.bio}</p>
            ) : (
              <p className="text-zinc-500 italic">
                Nenhum relatório confidencial registrado neste shinobi. Edite sua ficha para adicionar detalhes sobre suas especialidades em ninjutsu, taijutsu e genjutsu.
              </p>
            )}
          </div>
        </div>

        {/* 5. DADOS TÁTICOS & ALISTAMENTO (Grid Limpo) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-zinc-950/50 border border-zinc-800/80 flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-[9px] text-zinc-500 uppercase block">Alistamento</span>
              <span className="text-zinc-200 font-medium truncate block">{memberDate}</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-zinc-950/50 border border-zinc-800/80 flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-[9px] text-zinc-500 uppercase block">Origem</span>
              <span className="text-amber-300 font-medium truncate block">Konohagakure</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-zinc-950/50 border border-zinc-800/80 flex items-center gap-2.5">
            <Award className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-[9px] text-zinc-500 uppercase block">Mentor</span>
              <span className="text-emerald-300 font-medium truncate block">
                {user.favoriteNinja || 'Naruto Uzumaki'}
              </span>
            </div>
          </div>
        </div>

        {/* 6. CONSOLE DE SINTONIZADOR DE ÁUDIO DO COCKPIT */}
        <div className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center border transition ${
                isAudioMuted
                  ? 'bg-zinc-900 border-zinc-800 text-zinc-500'
                  : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
              }`}
            >
              <Radio className={`w-4 h-4 ${!isAudioMuted ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-200 block font-mono">
                {isAudioMuted ? 'Frequência Silenciada' : 'Frequência de Chakra • Conectada'}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono block">
                {isAudioMuted
                  ? 'Efeitos de áudio e sintetizador pausados'
                  : 'SFX procedural via Web Audio API ativo'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleMute}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
              isAudioMuted
                ? 'bg-rose-950/40 border-rose-800 text-rose-300 hover:bg-rose-950/60'
                : 'bg-emerald-950/40 border-emerald-800 text-emerald-300 hover:bg-emerald-950/60'
            }`}
          >
            {isAudioMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span>Mudo</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                <span>Ligado</span>
              </>
            )}
          </button>
        </div>

        {/* 7. BOTÕES DE AÇÃO RÁPIDA */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={onEditProfile}
            className="py-2.5 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:border-cyan-500/60 text-xs font-mono font-bold tracking-wide transition active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editar Ficha</span>
          </button>

          <button
            type="button"
            onClick={onEditClanProfile || onEditProfile}
            className="py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 hover:border-zinc-700 text-xs font-mono font-bold tracking-wide transition active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Registro de Clã</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Compatibilidade com importações legadas
export const DiscordProfileCard = ShinobiProfileCard;
