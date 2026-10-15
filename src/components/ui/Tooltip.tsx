import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

export interface TooltipMetric {
  label: string;
  value: string;
  colorClass?: string;
}

export interface TooltipProps {
  title: string;
  badgeText?: string;
  badgeVariant?: 'cyan' | 'purple' | 'rose' | 'amber' | 'emerald' | 'neutral';
  description: string;
  metrics?: Array<TooltipMetric>;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const BADGE_STYLES: Record<NonNullable<TooltipProps['badgeVariant']>, string> = {
  cyan: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60',
  purple: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
  rose: 'bg-rose-950/80 text-rose-300 border-rose-700/60',
  amber: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
  emerald: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
  neutral: 'bg-zinc-850 text-zinc-300 border-zinc-700',
};

export const Tooltip: React.FC<TooltipProps> = ({
  title,
  badgeText,
  badgeVariant = 'neutral',
  description,
  metrics,
  position = 'auto',
  children,
  className = '',
  disabled = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [actualPos, setActualPos] = useState<'top' | 'bottom' | 'left' | 'right'>('top');

  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const enterTimeoutRef = useRef<number | null>(null);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipEl = tooltipRef.current;
    
    // Dimensões estimadas ou medidas
    const tooltipWidth = tooltipEl ? tooltipEl.offsetWidth : 280;
    const tooltipHeight = tooltipEl ? tooltipEl.offsetHeight : 140;
    const gap = 10;
    const padding = 12;

    const spaceAbove = triggerRect.top;
    const spaceBelow = window.innerHeight - triggerRect.bottom;
    const spaceLeft = triggerRect.left;
    const spaceRight = window.innerWidth - triggerRect.right;

    let targetDirection: 'top' | 'bottom' | 'left' | 'right' = 'top';

    if (position === 'auto') {
      if (spaceAbove >= tooltipHeight + gap) {
        targetDirection = 'top';
      } else if (spaceBelow >= tooltipHeight + gap) {
        targetDirection = 'bottom';
      } else if (spaceRight >= tooltipWidth + gap) {
        targetDirection = 'right';
      } else if (spaceLeft >= tooltipWidth + gap) {
        targetDirection = 'left';
      } else {
        targetDirection = spaceAbove >= spaceBelow ? 'top' : 'bottom';
      }
    } else {
      targetDirection = position;
      // Viewport collision flip se não couber na direção solicitada
      if (targetDirection === 'top' && spaceAbove < tooltipHeight + gap && spaceBelow >= tooltipHeight + gap) {
        targetDirection = 'bottom';
      } else if (targetDirection === 'bottom' && spaceBelow < tooltipHeight + gap && spaceAbove >= tooltipHeight + gap) {
        targetDirection = 'top';
      } else if (targetDirection === 'left' && spaceLeft < tooltipWidth + gap && spaceRight >= tooltipWidth + gap) {
        targetDirection = 'right';
      } else if (targetDirection === 'right' && spaceRight < tooltipWidth + gap && spaceLeft >= tooltipWidth + gap) {
        targetDirection = 'left';
      }
    }

    setActualPos(targetDirection);

    let top = 0;
    let left = 0;

    switch (targetDirection) {
      case 'top':
        top = triggerRect.top - tooltipHeight - gap;
        left = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + gap;
        left = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;
        break;
      case 'left':
        top = triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2;
        left = triggerRect.left - tooltipWidth - gap;
        break;
      case 'right':
        top = triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2;
        left = triggerRect.right + gap;
        break;
    }

    // Viewport collision clamping (garante que nunca seja cortado nas bordas do monitor)
    const clampedLeft = Math.max(padding, Math.min(window.innerWidth - tooltipWidth - padding, left));
    const clampedTop = Math.max(padding, Math.min(window.innerHeight - tooltipHeight - padding, top));

    setCoords({ top: clampedTop, left: clampedLeft });
  }, [position]);

  const handleMouseEnter = () => {
    if (disabled) return;
    if (enterTimeoutRef.current) clearTimeout(enterTimeoutRef.current);
    enterTimeoutRef.current = window.setTimeout(() => {
      setIsVisible(true);
    }, 150); // Leve atraso de intenção (150ms)
  };

  const handleMouseLeave = () => {
    if (enterTimeoutRef.current) {
      clearTimeout(enterTimeoutRef.current);
      enterTimeoutRef.current = null;
    }
    setIsVisible(false);
  };

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
      const handleReposition = () => calculatePosition();
      window.addEventListener('resize', handleReposition);
      window.addEventListener('scroll', handleReposition, true);
      return () => {
        window.removeEventListener('resize', handleReposition);
        window.removeEventListener('scroll', handleReposition, true);
      };
    }
  }, [isVisible, calculatePosition]);

  useEffect(() => {
    return () => {
      if (enterTimeoutRef.current) clearTimeout(enterTimeoutRef.current);
    };
  }, []);

  const tooltipPortal = isVisible && typeof document !== 'undefined'
    ? createPortal(
        <div
          ref={tooltipRef}
          data-position={actualPos}
          style={{
            position: 'fixed',
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            transformOrigin:
              actualPos === 'top'
                ? 'bottom center'
                : actualPos === 'bottom'
                ? 'top center'
                : actualPos === 'left'
                ? 'right center'
                : 'left center',
          }}
          className={`z-[9999] pointer-events-none w-72 sm:w-80 max-w-xs bg-zinc-950/95 backdrop-blur-xl border border-zinc-700/80 rounded-xl p-3.5 shadow-[0_10px_40px_rgba(0,0,0,0.8)] transition-all duration-150 ease-out animate-in fade-in zoom-in-95 select-none`}
        >
          {/* Cabeçalho do Balão */}
          <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-zinc-800/80">
            <h4 className="text-xs font-bold text-zinc-100 truncate tracking-tight">{title}</h4>
            {badgeText && (
              <span
                className={`text-[9px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded border font-semibold flex-shrink-0 ${
                  BADGE_STYLES[badgeVariant] || BADGE_STYLES.neutral
                }`}
              >
                {badgeText}
              </span>
            )}
          </div>

          {/* Corpo Descritivo */}
          {description && (
            <p className="text-[11px] leading-relaxed text-zinc-400 mt-1.5 font-sans">
              {description}
            </p>
          )}

          {/* Bloco Técnico / Matemático (Rodapé do Balão) */}
          {metrics && metrics.length > 0 && (
            <div className="border-t border-zinc-800/80 mt-2 pt-2 space-y-1">
              {metrics.map((metric, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 font-mono text-[11px]">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                    {metric.label}
                  </span>
                  <span className={`font-bold tracking-tight ${metric.colorClass || 'text-cyan-400'}`}>
                    {metric.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>,
        document.body
      )
    : null;

  return (
    <div
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`inline-block ${className}`}
    >
      {children}
      {tooltipPortal}
    </div>
  );
};
