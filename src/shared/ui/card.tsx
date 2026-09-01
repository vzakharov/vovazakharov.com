import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`border border-foreground/20 p-6 hover:border-foreground/40 transition-colors print:p-4 print:border-0 print:border-b ${className}`}
    >
      {children}
    </div>
  );
}
