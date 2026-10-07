import { Box, Stack, Text } from '@mantine/core';

import type { LabeledLink, Titled } from '@/shared/typings';
import { Card, Subheading, TextLink } from '@/shared/ui';

/** A row linking to an artist or an album, with the line under its name. */
type CatalogueEntry = LabeledLink & { detail?: string };

export type CatalogueListProps = Titled & { entries: CatalogueEntry[] };

/** The artists on the index, or an artist's albums — each row a page of its own. */
export function CatalogueList({ title, entries }: CatalogueListProps) {
  if (entries.length === 0) return null;

  return (
    <Box>
      <Subheading>{title}</Subheading>

      <Stack gap={12}>
        {entries.map(({ href, label, detail }) => (
          <Card key={href}>
            <Text fw={500}>
              <TextLink {...{ href }} underline="hover">
                {label}
              </TextLink>
            </Text>
            {detail !== undefined && detail !== '' && (
              <Text size="sm" opacity={0.6}>
                {detail}
              </Text>
            )}
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
