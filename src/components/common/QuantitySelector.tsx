import React from 'react';
import { ShopMode, ShopQty } from '../../types/economy';

interface QuantitySelectorProps {
  mode: ShopMode;
  qty: ShopQty;
  onModeChange: (mode: ShopMode) => void;
  onQtyChange: (qty: ShopQty) => void;
  className?: string;
}

const QUANTITIES: ShopQty[] = [1, 10, 100, 'max'];

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  mode,
  qty,
  onModeChange,
  onQtyChange,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-between gap-2 p-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 ${className}`}>
      {/* Alternador de Modo (Comprar / Vender) */}
      <div className="flex gap-1">
        <button
          onClick={() => onModeChange('buy')}
          className={`px-3 py-1 text-xs font-medium rounded-md transition-all border ${
            mode === 'buy'
              ? 'bg-zinc-800 text-zinc-100 border-zinc-700 shadow-sm'
              : 'bg-transparent text-zinc-400 hover:text-zinc-200 border-transparent hover:bg-zinc-800/40'
          }`}
        >
          Comprar
        </button>
        <button
          onClick={() => onModeChange('sell')}
          className={`px-3 py-1 text-xs font-medium rounded-md transition-all border ${
            mode === 'sell'
              ? 'bg-zinc-800 text-zinc-100 border-zinc-700 shadow-sm'
              : 'bg-transparent text-zinc-400 hover:text-zinc-200 border-transparent hover:bg-zinc-800/40'
          }`}
        >
          Vender
        </button>
      </div>

      {/* Seletor de Quantidade (1x, 10x, 100x, Max) */}
      <div className="flex gap-1">
        {QUANTITIES.map((q) => {
          const isActive = qty === q;
          return (
            <button
              key={String(q)}
              onClick={() => onQtyChange(q)}
              className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-all border ${
                isActive
                  ? 'bg-zinc-700/80 text-zinc-100 border-zinc-600 shadow-sm'
                  : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-700/60 hover:text-zinc-200 border-zinc-700/40'
              }`}
            >
              {q === 'max' ? 'Max' : `${q}x`}
            </button>
          );
        })}
      </div>
    </div>
  );
};
