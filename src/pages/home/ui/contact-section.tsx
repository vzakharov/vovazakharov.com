import { Stack, Text } from '@mantine/core';

import { Card, Section, Subheading, TextLink } from '@/shared/ui';

// A `mailto:` has no page to leave for, so it stays in this tab and takes none
// of the new-tab hardening the rest get.
const EMAIL = 'vzakharov@gmail.com';

const PROFILES = [
  { label: 'GitHub', host: 'github.com', path: '/vzakharov' },
  { label: 'LinkedIn', host: 'linkedin.com', path: '/in/vovahimself' },
  { label: 'X/Twitter', host: 'x.com', path: '/vovahimself' },
  { label: 'Substack', host: 'substack.com', path: '/@vovahimself' },
];

export function ContactSection() {
  return (
    <Section id="contact">
      <Subheading>Contact</Subheading>
      <Card>
        <Stack gap={12}>
          <Text>
            <strong>Email:</strong>{' '}
            <TextLink href={`mailto:${EMAIL}`}>{EMAIL}</TextLink>
          </Text>
          {PROFILES.map(({ label, host, path }) => (
            <Text key={label}>
              <strong>{label}:</strong>{' '}
              <TextLink href={`https://${host}${path}`} newTab>
                {host}
                {path}
              </TextLink>
            </Text>
          ))}
        </Stack>
      </Card>
    </Section>
  );
}
