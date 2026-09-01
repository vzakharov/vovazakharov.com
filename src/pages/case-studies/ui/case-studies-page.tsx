import { Box, Container, Group, Stack, Text, Title } from '@mantine/core';

import { ThemeToggle } from '@/features/switch-theme';
import {
  COLLECTIONS,
  documentRoute,
  renderPrimaryDocuments,
} from '@/shared/content';
import { constructMetadata } from '@/shared/seo';
import { Card, InternalLink } from '@/shared/ui';
import { BackToHome } from './back-to-home';
import { DocumentMeta } from './document-meta';
import classes from './case-studies.module.scss';

const COLLECTION = 'case-studies';

const DESCRIPTION =
  'Long-form write-ups of work I have shipped, with the numbers behind them.';

export const caseStudiesMetadata = constructMetadata({
  title: `${COLLECTIONS[COLLECTION].label} - Vova Zakharov`,
  description: DESCRIPTION,
  path: COLLECTIONS[COLLECTION].routeBase,
});

export async function CaseStudiesPage() {
  const cards = await renderPrimaryDocuments(COLLECTION);

  return (
    <Box className={classes.page}>
      <Container size={896} px={0}>
        <Stack gap={48}>
          <Group justify="flex-end">
            <ThemeToggle />
          </Group>

          <Box component="header">
            <Stack gap={16}>
              <Title order={1}>{COLLECTIONS[COLLECTION].routeBase}</Title>
              <Text size="lg" opacity={0.8}>
                {DESCRIPTION}
              </Text>
            </Stack>
          </Box>

          <Stack gap={24}>
            {cards.map(({ document, rendered, variants }) => (
              <Card key={document.slug}>
                <Title order={2} size="h3" mb={8}>
                  <InternalLink href={document.route} underline="hover" inherit>
                    {rendered.title}
                  </InternalLink>
                </Title>
                <DocumentMeta
                  frontmatter={document.frontmatter}
                  readingMinutes={rendered.readingMinutes}
                  className={classes.cardMeta}
                />
                <Text lh={1.625} mb={16}>
                  {document.frontmatter.description}
                </Text>
                <Group component="p" gap={12} wrap="wrap" fz="sm">
                  <InternalLink href={document.route} inherit>
                    Read
                  </InternalLink>
                  {variants.map((variant) => (
                    <InternalLink
                      key={variant}
                      href={documentRoute(COLLECTION, document.slug, variant)}
                      className={classes.variantLink}
                      inherit
                    >
                      {variant} version
                    </InternalLink>
                  ))}
                </Group>
              </Card>
            ))}
          </Stack>

          <BackToHome />
        </Stack>
      </Container>
    </Box>
  );
}
