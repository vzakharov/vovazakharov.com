import { Container, Title } from '@mantine/core';

import { messages } from '@/music/shared/i18n';

import { BlindTestPlayer,NOSTALGIA } from '../quiz';

export function BlindTestPage() {
  return (
    <Container size="sm" py="xl">
      <Title order={1} mb="lg">
        {NOSTALGIA.title}
      </Title>
      {/* Russian only: its one listener is the author. */}
      <BlindTestPlayer test={NOSTALGIA} copy={messages('ru').blindTest} />
    </Container>
  );
}
