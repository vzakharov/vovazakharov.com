import { Card, type Summarized } from '@/shared/ui';

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
        {stars && <span className="text-sm opacity-60">★ {stars}</span>}
      </div>
      <p className="mb-3 leading-relaxed">{description}</p>
      {techStack && <p className="text-sm font-mono opacity-60">{techStack}</p>}
    </Card>
  );

  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block">
        {content}
      </a>
    );
  }

  return content;
}
