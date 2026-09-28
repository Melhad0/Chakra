import React from 'react';
import { ShopMode, ShopQty } from '../../types/economy';
import { ShoppingCart, ArrowDownRight, Sparkles } from 'lucide-react';

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
    <div
      className={`p-2 rounded-xl bg-gradient-to-b from-zinc-950/80 to-zinc-950/50 border border-zinc-800/80 shadow-md flex flex-col gap-2 w-full max-w-full overflow-hidden ${className}`}
    >
      {/* Linha 1: Alternador de Modo (Comprar / Vender) com Iluminação Dinâmica */}
      <div className="grid grid-cols-2 gap-1.5 w-full p-1 rounded-xl bg-zinc-900/90 border border-zinc-800/90 shadow-inner">
        <button
          type="button"
          onClick={() => onModeChange('buy')}
          className={`py-1.5 px-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none active:scale-[0.98] ${
            mode === 'buy'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 font-bold shadow-md shadow-emerald-950/60'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5 stroke-[2.2]" />
          <span>Comprar</span>
        </button>

        <button
          type="button"
          onClick={() => onModeChange('sell')}
          className={`py-1.5 px-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none active:scale-[0.98] ${
            mode === 'sell'
              ? 'bg-gradient-to-r from-rose-500 to-red-600 text-zinc-950 font-bold shadow-md shadow-rose-950/60'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
          }`}
        >
          <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.2]" />
          <span>Vender</span>
        </button>
      </div>

      {/* Linha 2: Seletor de Quantidade em Grade de 5 Colunas (100% de largura) */}
      <div className="grid grid-cols-5 gap-1.5 w-full">
        {QUANTITIES.map((q) => {
          const isActive = qty === q;
          const isMax = q === 'max';

          return (
            <button
              key={String(q)}
              type="button"
              onClick={() => onQtyChange(q)}
              className={`py-1.5 px-1 text-[11px] font-mono font-medium rounded-lg transition-all text-center border cursor-pointer select-none active:scale-95 truncate relative ${
                isActive
                  ? isMax
                    ? 'bg-gradient-to-r from-amber-500/25 via-amber-400/20 to-amber-500/25 text-amber-300 border-amber-500/70 shadow-sm shadow-amber-950/50 font-bold'
                    : 'bg-cyan-950/80 text-cyan-300 border-cyan-500/70 shadow-sm shadow-cyan-950/50 font-semibold'
                  : 'bg-zinc-900/60 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200 border-zinc-800/80 hover:border-zinc-700/80'
              }`}
            >
              {isMax ? (
                <span className="flex items-center justify-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5 text-amber-400 stroke-[2]" />
                  <span>MAX</span>
                </span>
              ) : (
                `${q}x`
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

