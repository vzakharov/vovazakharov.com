import { Container, Title } from '@mantine/core';

import { messages } from '@/music/shared/i18n';

import { LOST_SONGS } from '../model/blind-test';
import { BlindTestPlayer } from './blind-test-player';

export function BlindTestPage() {
  return (
    <Container size="sm" py="xl">
      <Title order={1} mb="lg">
        {LOST_SONGS.title}
      </Title>
      {/* Russian only: its one listener is the author. */}
      <BlindTestPlayer test={LOST_SONGS} copy={messages('ru').blindTest} />
    </Container>
  );
}
