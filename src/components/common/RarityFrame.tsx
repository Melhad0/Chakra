import React from 'react';
import { ItemRarity, RARITY_CONFIG } from '../../types/rarity';

interface RarityFrameProps {
  rarity: ItemRarity;
  children: React.ReactNode;
  className?: string;
  selected?: boolean;
}

export const RarityFrame: React.FC<RarityFrameProps> = ({
  rarity,
  children,
  className = '',
  selected = false,
}) => {
  const config = RARITY_CONFIG[rarity] || RARITY_CONFIG.COMMON;

  if (rarity === 'MYTHIC') {
    return (
      <div
        className={`p-[1.5px] rounded-xl bg-gradient-to-r from-red-500 via-amber-400 via-emerald-400 via-cyan-400 to-purple-500 animate-shimmer bg-[length:300%_300%] ${className} ${
          selected ? 'ring-2 ring-orange-500 scale-[1.02]' : ''
        }`}
      >
        <div className="w-full h-full bg-zinc-950/90 rounded-[10px] p-2 relative backdrop-blur-sm">
          {children}
        </div>
      </div>
    );
  }

  if (rarity === 'ADM') {
    return (
      <div
        className={`rounded-xl border border-zinc-400/80 bg-gradient-to-b from-zinc-800/90 via-[#09090b] to-black shadow-adm-vacuum ring-1 ring-white/40 p-2 relative overflow-hidden group transition-all ${className} ${
          selected ? 'ring-2 ring-orange-500 scale-[1.02]' : ''
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
        {children}
      </div>
    );
  }

  if (rarity === 'DIVINE') {
    return (
      <div
        className={`rounded-xl border border-white shadow-divine-star bg-slate-950/90 p-2 relative transition-all ${className} ${
          selected ? 'ring-2 ring-orange-500 scale-[1.02]' : ''
        }`}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border ${config.borderClass} ${config.glowClass} bg-zinc-950/80 p-2 relative transition-all ${className} ${
        selected ? 'ring-2 ring-orange-500 scale-[1.02]' : ''
      }`}
    >
      {children}
    </div>
  );
};
