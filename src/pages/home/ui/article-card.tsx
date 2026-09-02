import { Card, type Summarized } from '@/shared/ui';

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
