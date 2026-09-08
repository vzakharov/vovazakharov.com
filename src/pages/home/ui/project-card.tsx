import { Group, Text, Title } from '@mantine/core';
import type { ReactNode } from 'react';

import { Card, CardLink, type Summarized } from '@/shared/ui';

import { TechLine } from './tech-line';

type ProjectCardProps = Summarized & {
  techStack?: string;
  stars?: number;
  url?: string;
  /** A cross-link the card itself cannot be, since only one anchor may wrap it. */
  footer?: ReactNode;
};

export function ProjectCard({
  title,
  description,
  techStack,
  stars,
  url,
  footer,
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
      {techStack !== undefined && <TechLine>{techStack}</TechLine>}
      {footer}
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
