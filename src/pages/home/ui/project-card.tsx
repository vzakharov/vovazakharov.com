import { Group, Text, Title } from '@mantine/core';

import { Card, CardLink, type Summarized } from '@/shared/ui';

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
      <Group justify="space-between" align="flex-start" mb={8} wrap="nowrap">
        <Title order={3} size="h4">
          {title}
        </Title>
        {stars !== undefined && (
          <Text size="sm" opacity={0.6}>
            ★ {stars}
          </Text>
        )}
      </Group>
      <Text mb={12} lh={1.625}>
        {description}
      </Text>
      {techStack !== undefined && (
        <Text size="sm" ff="monospace" opacity={0.6}>
          {techStack}
        </Text>
      )}
    </Card>
  );

  return url === undefined ? (
    content
  ) : (
    <CardLink href={url} aria-label={title}>
      {content}
    </CardLink>
  );
}
