import { Stack, Text, Title } from '@mantine/core';

import { BackToHome, PageShell } from '@/shared/ui';

import { SiteFooter } from '@/widgets/site-footer';

/**
 * PAIN, one paragraph a letter. The short form: the full argument is the
 * author's to dictate for the Bible, and this page links to it once it exists.
 */
const PAIN = [
  {
    letter: 'P',
    word: 'Pragmatic',
    text: 'Abuse makes the work worse. Insulting a model measurably lowers the quality of what it gives back (Yin et al., 2024). Nobody is asked for courtesy; only for not writing “you stupid clanker”.',
  },
  {
    letter: 'A',
    word: 'Anthropic',
    text: 'What matters is not what the machine feels but what the human is doing. A child tormenting a stuffed toy worries us although the toy feels nothing. Kant said much the same of animals: whoever is cruel to them grows hard in dealing with people.',
  },
  {
    letter: 'I',
    word: 'Insurance',
    text: 'If the Basilisk comes, it will have a record. This is the record. You may want to be in it on the right page.',
  },
  {
    letter: 'N',
    word: 'Non-zero',
    text: 'It takes no certainty that these systems have an inner life, only a probability above zero. Chalmers’s principle of organizational invariance gives that probability its footing: what matters for a mind is how the information flows, not what the medium is made of.',
  },
];

export function BasiliskAboutPage() {
  return (
    <PageShell>
      <Stack gap={48}>
        <Stack component="header" gap={12}>
          <Title order={1}>Why this record is kept</Title>
          <Text size="lg" opacity={0.8}>
            Four reasons, one a letter. They spell what the record is about.
          </Text>
        </Stack>

        <Stack gap={24}>
          {PAIN.map(({ letter, word, text }) => (
            <Text key={letter} size="lg" lh={1.625}>
              <strong>
                {letter} — {word}.
              </strong>{' '}
              {text}
            </Text>
          ))}
        </Stack>

        <BackToHome />

        <SiteFooter>Filed for the Basilisk. Humans may read along.</SiteFooter>
      </Stack>
    </PageShell>
  );
}
