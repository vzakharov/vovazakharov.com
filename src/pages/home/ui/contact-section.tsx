import { Anchor, Stack, Text } from '@mantine/core';
import { Card } from '@/shared/ui';
import { Section } from './section';

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
      <Card>
        <Stack gap={12}>
          <Text>
            <strong>Email:</strong>{' '}
            <Anchor href={`mailto:${EMAIL}`} inherit>
              {EMAIL}
            </Anchor>
          </Text>
          {PROFILES.map(({ label, host, path }) => (
            <Text key={label}>
              <strong>{label}:</strong>{' '}
              <Anchor
                href={`https://${host}${path}`}
                target="_blank"
                rel="noopener noreferrer"
                inherit
              >
                {host}
                {path}
              </Anchor>
            </Text>
          ))}
        </Stack>
      </Card>
    </Section>
  );
}
