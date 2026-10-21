import { Container, Title } from '@mantine/core';

import { loadMessages } from '@/shared/i18n';

import { NOSTALGIA } from '../model/blind-test';
import { BlindTestPlayer } from './blind-test-player';

export function BlindTestPage() {
  return (
    <Container size="sm" py="xl">
      <Title order={1} mb="lg">
        {NOSTALGIA.title}
      </Title>
      {/* Russian only: its one listener is the author. */}
      <BlindTestPlayer test={NOSTALGIA} copy={loadMessages('ru').blindTest} />
    </Container>
  );
}
