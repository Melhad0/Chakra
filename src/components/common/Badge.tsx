import React from 'react';

export type BadgeVariant = 'neutral' | 'production' | 'warning' | 'danger' | 'cyan' | 'chakra';

interface BadgeProps {
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  dot?: boolean;
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, { container: string; dot: string }> = {
  neutral: {
    container: 'bg-zinc-800/40 text-zinc-400 border-zinc-700/40',
    dot: 'bg-zinc-400',
  },
  production: {
    container: 'bg-emerald-950/20 text-emerald-400 border-emerald-800/30',
    dot: 'bg-emerald-400',
  },
  warning: {
    container: 'bg-amber-950/20 text-amber-400 border-amber-800/30',
    dot: 'bg-amber-400',
  },
  danger: {
    container: 'bg-rose-950/20 text-rose-400 border-rose-800/30',
    dot: 'bg-rose-400',
  },
  cyan: {
    container: 'bg-cyan-950/20 text-cyan-400 border-cyan-800/30',
    dot: 'bg-cyan-400',
  },
  chakra: {
    container: 'bg-orange-950/20 text-orange-400 border-orange-800/30',
    dot: 'bg-orange-400',
  },
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  icon,
  dot = false,
  className = '',
  children,
}) => {
  const styles = variantStyles[variant] || variantStyles.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide uppercase border transition-colors ${styles.container} ${className}`}
    >
      {dot && !icon && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${styles.dot}`} />}
      {icon && <span className="flex-shrink-0 flex items-center justify-center">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
