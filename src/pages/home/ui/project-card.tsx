import { Group, Text, Title } from '@mantine/core';

import type { WithOptionalCaseStudyHref } from '@/shared/typings';
import { Card, CardLink, InternalLink, type Summarized } from '@/shared/ui';

import classes from './project-card.module.scss';
import { TechLine } from './tech-line';

type ProjectCardProps = Summarized &
  WithOptionalCaseStudyHref & {
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
  caseStudyHref,
}: ProjectCardProps) {
  return (
    <Card>
      {url !== undefined && <CardLink href={url} aria-label={title} />}
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
      {caseStudyHref !== undefined && (
        <Text size="sm" mb={12} className={classes['aboveCardLink']}>
          <InternalLink href={caseStudyHref} inherit>
            Read the case study →
          </InternalLink>
        </Text>
      )}
      <Text mb={12} lh={1.625}>
        {description}
      </Text>
      {techStack !== undefined && <TechLine>{techStack}</TechLine>}
    </Card>
  );
}
