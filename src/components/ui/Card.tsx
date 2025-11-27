import { tokens, cn } from '../../lib/design-tokens';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  className?: string;
}

export function Card({ children, padding = 'md', hover = false, className }: CardProps) {
  return (
    <div
      className={cn(
        tokens.card.base,
        tokens.card.padding[padding],
        hover && tokens.card.hover,
        className
      )}
    >
      {children}
    </div>
  );
}
