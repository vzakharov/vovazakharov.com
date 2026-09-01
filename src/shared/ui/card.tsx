import { ReactNode } from 'react';

type CardProps = {
  children: ReactNode;
  className?: string;
};

/** A heading and the prose under it — the copy every card kind renders. */
export type Summarized = { title: string; description: string };

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`border border-foreground/20 p-6 hover:border-foreground/40 transition-colors print:p-4 print:border-0 print:border-b ${className}`}
    >
      {children}
    </div>
  );
}
