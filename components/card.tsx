import type { ReactNode } from 'react';

import type { Described, Titled, WithOptionalClassName } from '@/lib/typings';

type CardProps = WithOptionalClassName & {
  children: ReactNode;
};

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`border border-foreground/20 p-6 hover:border-foreground/40 transition-colors print:p-4 print:border-0 print:border-b ${className}`}
    >
      {children}
    </div>
  );
}

/** A heading and the prose under it — the copy every card kind renders. */
type Summarized = Titled & Described;

type ProjectCardProps = Summarized & {
  techStack?: string;
  stars?: number;
  url?: string;
};

export function ProjectCard({
  title,
  description,
  techStack,
  stars,
  url,
}: ProjectCardProps) {
  const content = (
    <Card>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-bold">{title}</h3>
        {stars !== undefined && (
          <span className="text-sm opacity-60">★ {stars}</span>
        )}
      </div>
      <p className="mb-3 leading-relaxed">{description}</p>
      {techStack !== undefined && (
        <p className="text-sm font-mono opacity-60">{techStack}</p>
      )}
    </Card>
  );

  if (url !== undefined) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block">
        {content}
      </a>
    );
  }

  return content;
}

type ArticleCardProps = Summarized & {
  url: string;
};

export function ArticleCard({ title, description, url }: ArticleCardProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
      aria-label={title}
    >
      <Card>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="leading-relaxed">{description}</p>
      </Card>
    </a>
  );
}
