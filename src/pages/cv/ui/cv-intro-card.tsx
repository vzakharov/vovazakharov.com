import { Box, Group, List, ListItem, Text, Title } from '@mantine/core';
import Markdown from 'react-markdown';

import { MESSAGE_MARKDOWN } from '@/shared/i18n';
import { pick } from '@/shared/lib/collections';
import type { LabeledLink } from '@/shared/typings';
import { Card, TextLink } from '@/shared/ui';

import classes from './cv.module.scss';

type CvIntroCardProps = {
  summary: string;
  offerTitle: string;
  offer: string[];
  /** The profile page, where the long form of both halves lives. */
  more: LabeledLink;
  caseStudy?: LabeledLink;
};

/**
 * Who and what, side by side: the profile cut to a paragraph beside the
 * framing's offer headline, each half linking to its long form on one page.
 */
export function CvIntroCard({
  summary,
  offerTitle,
  offer,
  more,
  caseStudy,
}: CvIntroCardProps) {
  return (
    <Card>
      <Box className={classes['intro']}>
        <Text lh={1.625}>
          <Markdown {...MESSAGE_MARKDOWN}>{summary}</Markdown>
        </Text>
        <Box>
          <Title order={3} className={classes['subheading']}>
            {offerTitle}
          </Title>
          <List className={classes['bullets']}>
            {offer.map((item) => (
              <ListItem key={item}>{item}</ListItem>
            ))}
          </List>
        </Box>
      </Box>
      <Group gap={24} className={classes['introLinks']}>
        <TextLink {...pick(more, 'href')} withAddress>
          {more.label}
        </TextLink>
        {caseStudy !== undefined && (
          // Screen only: the experience entry already prints this address.
          <Box className="print-hidden">
            <TextLink {...pick(caseStudy, 'href')}>{caseStudy.label}</TextLink>
          </Box>
        )}
      </Group>
    </Card>
  );
}
