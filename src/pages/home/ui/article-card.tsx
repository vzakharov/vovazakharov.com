import { Text, Title } from '@mantine/core';

import { Card, CardLink, type Summarized } from '@/shared/ui';

type ArticleCardProps = Summarized & {
  url: string;
};

export function ArticleCard({ title, description, url }: ArticleCardProps) {
  return (
    <CardLink href={url} aria-label={title}>
      <Card>
        <Title order={3} size="h4" mb={8}>
          {title}
        </Title>
        <Text lh={1.625}>{description}</Text>
      </Card>
    </CardLink>
  );
}
