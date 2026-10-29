import React from 'react';
import { cn } from '../../lib/utils';

export function Badge({ className, variant = 'default', children, ...props }) {
  const variants = {
    default: 'bg-primary/15 text-purple-300 border-primary/25',
    secondary: 'bg-zinc-800 text-zinc-300 border-zinc-700/60',
    outline: 'border-border text-foreground bg-transparent',
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    cyan: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    destructive: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors select-none',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
