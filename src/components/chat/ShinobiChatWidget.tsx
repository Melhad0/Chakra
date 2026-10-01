import React, { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import {
  Send,
  Smile,
  X,
  Users,
  GitFork,
  Flame,
  Radio,
} from 'lucide-react';
import {
  CHAT_CHANNELS,
  INITIAL_CHAT_MESSAGES,
  QUICK_EMOJIS,
} from '../../constants/initialChatMessages';
import { ChatMessage, ChatChannelId } from '../../types/chat';
import { getCurrentRank } from '../../constants/rankings';
import { getAvatarById } from '../../constants/profileCustomization';
import { audio } from '../../engine/audio';

export const ShinobiChatWidget: React.FC = () => {
  const isChatOpen = useGameStore((s) => s.isChatOpen);
  const closeChat = useGameStore((s) => s.closeChat);

  const [activeChannel, setActiveChannel] = useState<ChatChannelId>('general');
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentUser = useGameStore((s) => s.currentUser);
  const stats = useGameStore((s) => s.stats);
  const passedExams = useGameStore((s) => s.passedExams);

  const currentRank = getCurrentRank(
    stats.manualClicksAllTime,
    stats.highestCPSRecord,
    stats.totalPrestiges,
    passedExams
  );
  const userAvatarObj = getAvatarById(currentUser?.avatar || 'naruto');

  const isOpen = isChatOpen;

  // Auto-scroll para o final quando mensagens mudam ou o canal é alterado
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom(false);
    }
  }, [isOpen, activeChannel]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom(true);
    }
  }, [messages, isOpen]);


  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) return;

    audio.playClick();

    const now = new Date();
    const timeString = now.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newChatMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      channelId: activeChannel,
      senderId: currentUser ? String(currentUser.ninjaId) : 'player-local',
      senderName: currentUser?.fullName?.split(' ')[0] || currentUser?.username || 'Ninja de Konoha',
      senderAvatar: currentUser?.avatar || 'naruto',
      senderRankTitle: currentRank.title,
      senderRankColor: 'text-amber-300 border-amber-500/50 bg-amber-950/50',
      senderClan: currentUser?.favoriteNinja ? 'Linhagem Heróica' : 'Aldeia da Folha',
      isCurrentUser: true,
      content: trimmed,
      timestamp: timeString,
      reactions: [],
      badgeTitle: 'Você',
    };

    setMessages((prev) => [...prev, newChatMessage]);
    setInputText('');
    setShowEmojiPicker(false);
  };

  const handleToggleReaction = (messageId: string, emojiToToggle: string) => {
    audio.playClick();
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId) return msg;

        const existingReaction = msg.reactions.find((r) => r.emoji === emojiToToggle);
        if (existingReaction) {
          if (existingReaction.userReacted) {
            // Remove reação
            return {
              ...msg,
              reactions: msg.reactions
                .map((r) =>
                  r.emoji === emojiToToggle
                    ? { ...r, count: r.count - 1, userReacted: false }
                    : r
                )
                .filter((r) => r.count > 0),
            };
          } else {
            // Adiciona reação
            return {
              ...msg,
              reactions: msg.reactions.map((r) =>
                r.emoji === emojiToToggle
                  ? { ...r, count: r.count + 1, userReacted: true }
                  : r
              ),
            };
          }
        } else {
          // Cria nova reação
          return {
            ...msg,
            reactions: [
              ...msg.reactions,
              { emoji: emojiToToggle, count: 1, userReacted: true },
            ],
          };
        }
      })
    );
  };

  const handleAddEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  const filteredMessages = messages.filter((m) => m.channelId === activeChannel);

  if (!isOpen) {
    return null;
  }

  return (
    <aside aria-label="Chat Shinobi" className="fixed bottom-4 right-4 z-50 select-none font-sans">
      {/* JANELA PRINCIPAL DO CHAT SHINOBI */}
      <div className="w-[340px] sm:w-[390px] h-[520px] max-h-[85vh] rounded-2xl bg-zinc-950/95 backdrop-blur-2xl border border-zinc-800 shadow-[0_15px_50px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
        {/* Topo / Header do Chat */}
        <div className="px-3.5 py-2.5 bg-gradient-to-r from-zinc-900/90 via-zinc-900/60 to-zinc-950 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-zinc-950 shadow-md">
              <Radio className="w-4 h-4 stroke-[2.2] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold text-zinc-100 font-mono tracking-wide">
                  Rede Shinobi de Konoha
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono">
                <span>1.428 Ninjas Online</span>
                <span>•</span>
                <span className="text-amber-400 font-semibold">{currentRank.title}</span>
              </div>
            </div>
          </div>

          {/* Ações de Controle (Fechar) */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => closeChat()}
              title="Fechar Chat"
              className="w-7 h-7 rounded-lg hover:bg-rose-950/40 text-zinc-400 hover:text-rose-400 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

          {/* Abas de Canais de Comunicação */}
          <div className="px-2 py-1.5 bg-zinc-950 border-b border-zinc-850 flex items-center gap-1">
            {CHAT_CHANNELS.map((ch) => {
              const isActive = activeChannel === ch.id;
              const Icon =
                ch.id === 'general' ? Users : ch.id === 'clans' ? GitFork : Flame;

              return (
                <button
                  key={ch.id}
                  onClick={() => {
                    setActiveChannel(ch.id);
                    setShowEmojiPicker(false);
                  }}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-mono font-medium transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                    isActive
                      ? 'bg-zinc-800/90 border-amber-500/50 text-amber-300 shadow-sm'
                      : 'bg-zinc-900/40 border-zinc-850 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/70'
                  }`}
                  title={ch.description}
                >
                  <Icon className="w-3 h-3" />
                  <span className="truncate">{ch.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Banner do Canal Ativo */}
          <div className="px-3 py-1 bg-zinc-900/30 border-b border-zinc-850/60 text-[10px] font-mono text-zinc-500 flex items-center justify-between">
            <span className="truncate">
              {CHAT_CHANNELS.find((c) => c.id === activeChannel)?.description}
            </span>
            <span className="text-zinc-600 flex-shrink-0 ml-2">#criptografado</span>
          </div>

          {/* Lista de Mensagens com Rolagem Suave */}
          <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3">
            {filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center text-zinc-500 font-mono text-xs">
                <Radio className="w-8 h-8 text-zinc-600 mb-2 stroke-[1.5]" />
                <p>Nenhuma mensagem shinobi neste canal ainda.</p>
                <p className="text-[10px] text-zinc-600 mt-1">Envie uma mensagem abaixo para iniciar a transmissão.</p>
              </div>
            ) : (
              filteredMessages.map((msg) => {
              const isMe = msg.isCurrentUser;
              const isSys = msg.isSystem;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col transition-all duration-150 ${
                    isMe ? 'items-end' : 'items-start'
                  }`}
                >
                  {/* Cabeçalho da Mensagem: Avatar, Nome, Patente e Hora */}
                  <div
                    className={`flex items-center gap-1.5 mb-1 text-[11px] font-mono ${
                      isMe ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    {/* Mini Avatar com Emoji temático */}
                    <div className="w-5 h-5 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] flex-shrink-0 shadow-sm">
                      {isMe
                        ? userAvatarObj?.emojiIcon || '🍥'
                        : msg.senderAvatar === 'sasuke'
                        ? '⚡'
                        : msg.senderAvatar === 'kakashi'
                        ? '📖'
                        : msg.senderAvatar === 'naruto'
                        ? '🍥'
                        : '🥷'}
                    </div>

                    <span
                      className={`font-semibold tracking-tight ${
                        isMe
                          ? 'text-amber-300'
                          : isSys
                          ? 'text-rose-400 font-bold'
                          : 'text-zinc-200'
                      }`}
                    >
                      {msg.senderName}
                    </span>

                    {/* Badge de Patente ou Sistema */}
                    <span
                      className={`text-[9px] px-1 py-0.2 rounded border font-semibold ${msg.senderRankColor}`}
                    >
                      {msg.senderRankTitle}
                    </span>

                    {msg.senderClan && (
                      <span className="text-[9px] text-zinc-500 hidden sm:inline">
                        [{msg.senderClan}]
                      </span>
                    )}

                    <span className="text-[9px] text-zinc-600 ml-1">{msg.timestamp}</span>
                  </div>

                  {/* Balão da Mensagem */}
                  <div
                    className={`max-w-[88%] rounded-xl px-3 py-2 text-xs leading-relaxed font-sans shadow-md border ${
                      isSys
                        ? 'bg-gradient-to-r from-amber-950/30 via-zinc-900/60 to-amber-950/30 border-amber-500/40 text-amber-100 font-mono text-[11px]'
                        : isMe
                        ? 'bg-amber-950/30 border-amber-500/40 text-zinc-100 rounded-tr-none'
                        : 'bg-zinc-900/80 border-zinc-800 text-zinc-200 rounded-tl-none'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* Reações Interativas Shinobi */}
                  <div
                    className={`flex items-center gap-1 mt-1 flex-wrap ${
                      isMe ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.reactions.map((react, i) => (
                      <button
                        key={i}
                        onClick={() => handleToggleReaction(msg.id, react.emoji)}
                        className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono flex items-center gap-1 border transition-all cursor-pointer ${
                          react.userReacted
                            ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 scale-105'
                            : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                        }`}
                        title="Reagir a esta mensagem"
                      >
                        <span>{react.emoji}</span>
                        <span className="font-semibold text-[9px]">{react.count}</span>
                      </button>
                    ))}

                    {/* Botão de Adicionar Reação Rápida */}
                    <div className="relative group/react">
                      <button
                        className="px-1.5 py-0.5 rounded-md text-[10px] text-zinc-500 hover:text-zinc-300 bg-zinc-900/40 border border-zinc-850 hover:border-zinc-700 cursor-pointer"
                        title="Adicionar reação rápida"
                      >
                        +
                      </button>
                      <div className="hidden group-hover/react:flex absolute bottom-full mb-1 left-0 z-20 bg-zinc-950 border border-zinc-800 rounded-lg p-1 gap-1 shadow-xl">
                        {['🔥', '⚡', '🌀', '🍥', '👑'].map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleToggleReaction(msg.id, emoji)}
                            className="p-1 hover:bg-zinc-800 rounded text-xs transition cursor-pointer"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
          </div>

          {/* Seletor Rápido de Emojis / Selos de Mão Ninjas */}
          {showEmojiPicker && (
            <div className="px-3 py-2 bg-zinc-900/90 border-t border-zinc-800 flex items-center gap-2 overflow-x-auto custom-scrollbar animate-in slide-in-from-bottom-2 duration-150">
              <span className="text-[10px] font-mono text-zinc-500 flex-shrink-0">
                Selos Shinobi:
              </span>
              <div className="flex items-center gap-1.5">
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleAddEmoji(emoji)}
                    className="w-7 h-7 rounded-lg bg-zinc-800/80 hover:bg-amber-500/20 hover:border-amber-500/40 border border-zinc-700/60 flex items-center justify-center text-sm transition cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Footer: Input de Envio de Mensagem */}
          <form
            onSubmit={handleSendMessage}
            className="p-2.5 bg-zinc-950 border-t border-zinc-850 flex items-center gap-1.5"
          >
            {/* Botão de abrir Emojis / Selos */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                showEmojiPicker
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
              title="Inserir Emojis & Selos Shinobi"
            >
              <Smile className="w-4 h-4" />
            </button>

            {/* Input de Texto */}
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Enviar em #${activeChannel}...`}
              maxLength={200}
              className="flex-1 px-3 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 transition font-sans"
            />

            {/* Botão de Envio com Kunai / Send */}
            <button
              type="submit"
              disabled={!inputText.trim()}
              className={`p-2 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                inputText.trim()
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 border-amber-400 text-zinc-950 shadow-[0_0_15px_rgba(245,158,11,0.35)] active:scale-95'
                  : 'bg-zinc-900/60 border-zinc-850 text-zinc-600 cursor-not-allowed'
              }`}
              title="Enviar Mensagem (Enter)"
            >
              <Send className="w-4 h-4 stroke-[2.2]" />
            </button>
          </form>
        </div>
    </aside>
  );
};
