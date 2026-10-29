import React from 'react';
import { cn } from '../../lib/utils';

export const Button = React.forwardRef(
  ({ className, variant = 'default', size = 'default', disabled, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 select-none';

    const variants = {
      default:
        'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-[0.98]',
      secondary:
        'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/40',
      outline:
        'border border-border bg-transparent hover:bg-accent hover:text-accent-foreground',
      ghost:
        'hover:bg-accent/60 hover:text-accent-foreground',
      link:
        'text-primary underline-offset-4 hover:underline p-0 h-auto',
      subtle:
        'bg-zinc-900/60 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white',
    };

    const sizes = {
      default: 'h-9 px-4 py-2',
      sm: 'h-7 rounded-md px-2.5 text-xs',
      lg: 'h-10 rounded-lg px-6 text-base',
      icon: 'h-8 w-8 p-0 rounded-md',
      iconLg: 'h-9 w-9 p-0 rounded-lg',
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
