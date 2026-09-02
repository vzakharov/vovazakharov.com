import type { ReactNode } from 'react';

import type {
  Described,
  Titled,
  WithOptionalClassName,
} from '@/shared/typings';

type CardProps = WithOptionalClassName & {
  children: ReactNode;
};

/** A heading and the prose under it — the copy every card kind renders. */
export type Summarized = Titled & Described;

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`border border-foreground/20 p-6 hover:border-foreground/40 transition-colors print:p-4 print:border-0 print:border-b ${className}`}
    >
      {children}
    </div>
  );
}
