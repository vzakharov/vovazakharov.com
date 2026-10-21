import { Container, Title } from '@mantine/core';

import { NOSTALGIA } from '../model/blind-test';
import { BlindTestPlayer } from './blind-test-player';

export function BlindTestPage() {
  return (
    <Container size="sm" py="xl">
      <Title order={1} mb="lg">
        {NOSTALGIA.title}
      </Title>
      <BlindTestPlayer test={NOSTALGIA} />
    </Container>
  );
}
