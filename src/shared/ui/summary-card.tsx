import { Text, Title } from '@mantine/core';

import type { Linked } from '@/shared/typings';

import { Card, CardLink, type Summarized } from './card';

/**
 * A heading and its blurb, the whole card linking off the site. Both sites'
 * indexes are lists of these, which is why it sits here rather than in either's
 * slice.
 */
export function SummaryCard({ title, description, href }: Summarized & Linked) {
  return (
    <Card>
      <CardLink {...{ href }} aria-label={title} />
      <Title order={3} size="h4" mb={8}>
        {title}
      </Title>
      <Text lh={1.625}>{description}</Text>
    </Card>
  );
}
