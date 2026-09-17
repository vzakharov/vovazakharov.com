import { Center } from '@mantine/core';
import Image from 'next/image';

import type { SiteConfig } from '@/shared/config';
import type { Named } from '@/shared/typings';

/**
 * The circle is this component's, not the file's, so each site commits one
 * square and its Open Graph card reads the same bytes. `priority` because the
 * mark is above the fold wherever it renders.
 *
 * Takes the site rather than reading it: `@/shared/ui` is a barrel client
 * components import, so reaching `@/shared/config/index.server-only` from
 * inside it would put the resolved configuration in the browser.
 */
export function SiteAvatar({
  name,
  avatar,
}: Named & Pick<SiteConfig, 'avatar'>) {
  return (
    <Center>
      <Image
        src={avatar.path}
        alt={name}
        width={150}
        height={150}
        style={{ borderRadius: '50%' }}
        priority
      />
    </Center>
  );
}
