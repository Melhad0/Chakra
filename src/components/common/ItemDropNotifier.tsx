import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { ItemDropToast } from '../../types/notifications';
import { getRarityConfig } from '../../types/rarity';
import { IconRenderer } from './IconRenderer';
import { Sparkles } from 'lucide-react';

interface ToastItemProps {
  toast: ItemDropToast;
  onDismiss: (id: string) => void;
}

const SingleDropToast: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);
  const rarityConfig = getRarityConfig(toast.rarity);

  useEffect(() => {
    // A notificação deve durar rigorosamente 0.7 segundos (700ms) em tela
    // Iniciamos uma micro transição de saída aos 600ms e removemos aos 700ms
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 600);

    const removeTimer = setTimeout(() => {
      onDismiss(toast.id);
    }, 700);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [toast.id, onDismiss]);

  const borderStyle: React.CSSProperties = {
    borderColor: rarityConfig.colorHex || '#EAB308',
    boxShadow: `0 0 16px ${rarityConfig.colorHex || '#EAB308'}66, inset 0 0 10px ${rarityConfig.colorHex || '#EAB308'}22`,
  };

  return (
    <div
      style={borderStyle}
      className={`min-w-[270px] max-w-[340px] px-3.5 py-2.5 rounded-xl bg-zinc-950/95 backdrop-blur-md border-2 flex items-center gap-3 transition-all duration-100 shadow-2xl ${
        isExiting
          ? 'opacity-0 scale-95 translate-y-1'
          : 'opacity-100 scale-100 translate-y-0 animate-in fade-in slide-in-from-top-2 duration-150'
      }`}
    >
      {/* Ícone com fundo temático da raridade */}
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border ${rarityConfig.borderClass} bg-zinc-900/90 ${rarityConfig.glowClass}`}
      >
        <IconRenderer
          name={toast.iconName || 'Shield'}
          className={`w-5 h-5 ${rarityConfig.textClass}`}
        />
      </div>

      {/* Informações do Item */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <span className="text-[9px] font-mono font-bold tracking-wider uppercase text-zinc-400 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
            {toast.subtext || 'Item Obtido'}
          </span>
          <span
            className={`text-[9px] font-mono px-1.5 py-0.2 rounded border uppercase font-extrabold ${rarityConfig.badgeClass}`}
          >
            {rarityConfig.label}
          </span>
        </div>

        <h4 className={`text-xs font-bold font-mono truncate leading-tight ${rarityConfig.textClass}`}>
          {toast.name}
        </h4>
      </div>
    </div>
  );
};

export const ItemDropNotifier: React.FC = () => {
  const itemDropToasts = useGameStore((s) => s.itemDropToasts);
  const dismissItemDropToast = useGameStore((s) => s.dismissItemDropToast);

  if (!itemDropToasts || itemDropToasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-16 right-6 z-50 flex flex-col gap-2.5 pointer-events-none select-none">
      {itemDropToasts.map((toast) => (
        <SingleDropToast
          key={toast.id}
          toast={toast}
          onDismiss={dismissItemDropToast}
        />
      ))}
    </div>
  );
};
