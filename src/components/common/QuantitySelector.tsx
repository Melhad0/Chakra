import React from 'react';
import { ShopMode, ShopQty } from '../../types/economy';

interface QuantitySelectorProps {
  mode: ShopMode;
  qty: ShopQty;
  onModeChange: (mode: ShopMode) => void;
  onQtyChange: (qty: ShopQty) => void;
  className?: string;
}

const QUANTITIES: ShopQty[] = [1, 10, 25, 100, 'max'];

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  mode,
  qty,
  onModeChange,
  onQtyChange,
  className = '',
}) => {
  return (
    <div className={`p-1.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex flex-col gap-1.5 w-full max-w-full overflow-hidden ${className}`}>
      {/* Linha 1: Alternador de Modo (Comprar / Vender) */}
      <div className="grid grid-cols-2 gap-1 w-full p-0.5 rounded-lg bg-zinc-900/80 border border-zinc-850">
        <button
          type="button"
          onClick={() => onModeChange('buy')}
          className={`py-1 text-xs font-semibold rounded-md transition-all text-center cursor-pointer select-none active:scale-[0.98] ${
            mode === 'buy'
              ? 'bg-emerald-500 text-zinc-950 font-bold shadow-sm shadow-emerald-950/50'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
        >
          Comprar
        </button>
        <button
          type="button"
          onClick={() => onModeChange('sell')}
          className={`py-1 text-xs font-semibold rounded-md transition-all text-center cursor-pointer select-none active:scale-[0.98] ${
            mode === 'sell'
              ? 'bg-rose-500 text-zinc-950 font-bold shadow-sm shadow-rose-950/50'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
        >
          Vender
        </button>
      </div>

      {/* Linha 2: Seletor de Quantidade em Grade de 5 Colunas (100% de largura) */}
      <div className="grid grid-cols-5 gap-1 w-full">
        {QUANTITIES.map((q) => {
          const isActive = qty === q;
          return (
            <button
              key={String(q)}
              type="button"
              onClick={() => onQtyChange(q)}
              className={`py-1 px-1 text-[11px] font-mono font-medium rounded-lg transition-all text-center border cursor-pointer select-none active:scale-95 truncate ${
                isActive
                  ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/70 shadow-sm font-semibold'
                  : 'bg-zinc-900/60 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200 border-zinc-800/80'
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
