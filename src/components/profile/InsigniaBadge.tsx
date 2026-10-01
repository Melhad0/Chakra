import React, { useState } from 'react';
import {
  ShieldAlert,
  Zap,
  Hexagon,
  Hash,
  Swords,
  Eye,
  Flame,
  Crown,
} from 'lucide-react';
import { ShinobiInsignia } from '../../constants/insignias';

interface InsigniaBadgeProps {
  insignia: ShinobiInsignia;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  isEquipped?: boolean;
  onToggle?: () => void;
}

export const InsigniaBadge: React.FC<InsigniaBadgeProps> = ({
  insignia,
  size = 'md',
  interactive = false,
  isEquipped = true,
  onToggle,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const sizeClasses = {
    sm: 'w-5 h-5 text-[10px]',
    md: 'w-6 h-6 text-xs',
    lg: 'w-8 h-8 text-sm',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  const renderIcon = () => {
    switch (insignia.iconType) {
      case 'SHIELD':
        return <ShieldAlert className={`${iconSizes} stroke-[2.2]`} />;
      case 'BOOST':
        return <Zap className={`${iconSizes} stroke-[2.2]`} />;
      case 'HEXAGON':
        return <Hexagon className={`${iconSizes} stroke-[2.2] fill-current/30`} />;
      case 'HASH':
        return <Hash className={`${iconSizes} stroke-[2.5]`} />;
      case 'SWORDS':
        return <Swords className={`${iconSizes} stroke-[2.2]`} />;
      case 'EYE':
        return <Eye className={`${iconSizes} stroke-[2.2]`} />;
      case 'FLAME':
        return <Flame className={`${iconSizes} stroke-[2.2] fill-current/20`} />;
      case 'CROWN':
        return <Crown className={`${iconSizes} stroke-[2.2] fill-current/20`} />;
      default:
        return <Hexagon className={iconSizes} />;
    }
  };

  return (
    <div
      className="relative inline-flex items-center justify-center group"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        type="button"
        onClick={onToggle}
        disabled={!interactive}
        title={insignia.name}
        className={`${sizeClasses} rounded-md flex items-center justify-center transition-all duration-200 border ${
          isEquipped
            ? `${insignia.bgGlow} ${insignia.borderClass} scale-100`
            : 'bg-zinc-900/60 border-zinc-800 text-zinc-500 opacity-50 grayscale'
        } ${interactive ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'}`}
      >
        {renderIcon()}
      </button>

      {/* Tooltip Tático Quadrado */}
      {showTooltip && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-48 p-2 rounded-lg bg-zinc-950/95 border border-zinc-700/80 shadow-[0_10px_25px_rgba(0,0,0,0.85)] backdrop-blur-md text-center animate-in fade-in-0 zoom-in-95 duration-150">
          <div className="flex items-center justify-center gap-1.5 mb-0.5">
            <span className={insignia.color}>{renderIcon()}</span>
            <span className="text-[11px] font-bold text-zinc-100 truncate">{insignia.name}</span>
          </div>
          <p className="text-[10px] text-zinc-400 leading-tight">{insignia.description}</p>
          <div className="w-2 h-2 bg-zinc-950 border-r border-b border-zinc-700/80 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
        </div>
      )}
    </div>
  );
};
